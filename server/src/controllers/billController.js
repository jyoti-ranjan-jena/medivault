const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const Medicine = require('../models/Medicine');
const Patient = require('../models/Patient');
const { MEMBERSHIP_CONFIG } = require('../utils/membershipEngine'); // <-- ONLY IMPORT CONFIG

// @desc    Create a new bill (Sell Medicines)
// @route   POST /api/bills
// @access  Private (Attendant/Admin)
const createBill = async (req, res) => {
  try {
    // IGNORING ANY FRONTEND DISCOUNT TO PREVENT MANIPULATION
    const { patientId, items, paymentMode } = req.body; 
    
    // 1. Validate Patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    let calculatedTotal = 0;
    const finalItems = [];

    // 2. Process Items (Check Stock & Deduct)
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine); 
      if (!medicine) throw new Error(`Medicine not found: ${item.medicine}`);

      const batch = medicine.batches.id(item.batchId);
      if (!batch) throw new Error(`Batch not found for ${medicine.name}`);
      if (batch.quantity < item.quantity) throw new Error(`Insufficient stock for ${medicine.name}`);

      finalItems.push({
        medicineDoc: medicine, 
        batchDoc: batch,       
        medicineId: medicine._id,
        name: medicine.name,
        batchId: batch._id,
        quantity: item.quantity,
        price: batch.sellPrice,
        amount: batch.sellPrice * item.quantity
      });

      calculatedTotal += (batch.sellPrice * item.quantity);
    }

    // --- SECURE BACKEND DISCOUNT CALCULATION ---
    const currentTier = patient.membershipTier || 'Standard';
    // Get the discount percentage (Fallback to 5% Standard if undefined)
    const tierDiscountPercentage = MEMBERSHIP_CONFIG[currentTier] || 5; 
    
    // Backend calculates the exact discount independently
    const finalDiscount = (calculatedTotal * tierDiscountPercentage) / 100;
    const grandTotal = Math.max(0, calculatedTotal - finalDiscount);
    // -------------------------------------------

    // 3. Deduct Stock 
    for (const item of finalItems) {
      item.batchDoc.quantity -= item.quantity;
      item.medicineDoc.totalStock -= item.quantity;
      await item.medicineDoc.save(); 
    }

    // 4. Create Bill (Saving all 3 pricing metrics!)
    const bill = await Bill.create({
      patient: patientId,
      soldBy: req.user._id,
      items: finalItems.map(i => ({
        medicine: i.medicineId,
        name: i.name,
        batchId: i.batchId,
        quantity: i.quantity,
        price: i.price,
        amount: i.amount
      })),
      totalAmount: calculatedTotal,
      discount: finalDiscount,
      grandTotal: grandTotal,
      paymentMode
    });

    // --- CRM LIFETIME SPEND TRACKER (NO AUTO-UPGRADE) ---
    try {
      patient.totalLifetimeSpent += grandTotal;
      patient.lastVisit = Date.now();
      await patient.save();

      res.status(201).json({ success: true, data: bill });
    } catch (crmError) {
      // Graceful degradation: If CRM update fails, the bill is still valid
      console.error('CRM Sync Failed:', crmError);
      res.status(201).json({ success: true, data: bill, crmSyncError: true });
    }

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all bills / transaction history
// @route   GET /api/bills
// @access  Private
const getBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate('patient', 'name mobile') // Fetch patient name and mobile
      .populate('items.medicine', 'name') // Fetch medicine names
      .sort('-createdAt'); // Sort by newest first
      
      res.status(200).json({ success: true, count: bills.length, data: bills });
    } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBill, getBills };