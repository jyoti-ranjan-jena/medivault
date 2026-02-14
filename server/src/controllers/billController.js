const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const Medicine = require('../models/Medicine');
const Patient = require('../models/Patient');

// @desc    Create a new bill (Sell Medicines)
// @route   POST /api/bills
// @access  Private (Attendant/Admin)
const createBill = async (req, res) => {
  // REMOVED: Session/Transaction start (Not supported on standalone local Mongo)

  try {
    const { patientId, items, paymentMode, discount } = req.body;
    
    // 1. Validate Patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    let calculatedTotal = 0;
    const finalItems = [];

    // 2. Process Items (Check Stock & Deduct)
    // We validate ALL items first before deducting anything to be safe
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine); // Removed .session(session)
      
      if (!medicine) {
        throw new Error(`Medicine not found: ${item.medicine}`);
      }

      // Find the specific batch
      const batch = medicine.batches.id(item.batchId);
      
      if (!batch) {
        throw new Error(`Batch not found for ${medicine.name}`);
      }

      if (batch.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${medicine.name} (Batch: ${batch.batchNumber})`);
      }

      // Add to list for final processing
      finalItems.push({
        medicineDoc: medicine, // Store full doc to update later
        batchDoc: batch,       // Store batch subdoc
        medicineId: medicine._id,
        name: medicine.name,
        batchId: batch._id,
        quantity: item.quantity,
        price: batch.sellPrice,
        amount: batch.sellPrice * item.quantity
      });

      calculatedTotal += (batch.sellPrice * item.quantity);
    }

    // 3. Deduct Stock (Now that we know ALL items are valid)
    for (const item of finalItems) {
      // Deduct from Batch
      item.batchDoc.quantity -= item.quantity;
      // Deduct from Total
      item.medicineDoc.totalStock -= item.quantity;
      
      await item.medicineDoc.save(); // Save each medicine update
    }

    // 4. Final Calculations
    // Ensure discount doesn't make total negative
    const finalDiscount = discount || 0;
    const grandTotal = Math.max(0, calculatedTotal - finalDiscount);

    // 5. Create Bill
    // Note: Without transaction, we pass the Object, not an Array
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
      grandTotal,
      paymentMode
    });

    // Success!
    res.status(201).json({ success: true, data: bill });

  } catch (error) {
    // No transaction to abort, just return error
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createBill };