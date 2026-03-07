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

// @desc    Get all bills (Paginated & Searchable by Patient)
// @route   GET /api/bills
// @access  Private
const getBills = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    
    const skip = (page - 1) * limit;
    let query = {};

    // --- THE UPGRADED SEARCH ENGINE ---
    if (search) {
      const Patient = require('../models/Patient');
      
      // 1. Find matching patients by Name or Phone
      const matchingPatients = await Patient.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const patientIds = matchingPatients.map(p => p._id);
      
      // 2. Match EITHER the Patient ID OR a partial match on the Invoice _id string
      query.$or = [
        { patient: { $in: patientIds } },
        { 
          $expr: { 
            $regexMatch: { 
              input: { $toString: "$_id" }, 
              regex: search, 
              options: "i" 
            } 
          } 
        }
      ];
    }

    // Run Count and Fetch concurrently
    const [total, bills] = await Promise.all([
      Bill.countDocuments(query),
      Bill.find(query)
        .populate('patient', 'name mobile membershipTier') // Pull patient details
        .sort({ createdAt: -1 }) // Newest bills first
        .skip(skip)
        .limit(limit)
    ]);

    res.status(200).json({ 
      success: true, 
      count: bills.length,
      pagination: {
        totalRecords: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      },
      data: bills 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export bills to CSV-ready format
// @route   GET /api/bills/export
// @access  Private
const exportBills = async (req, res) => {
  try {
    const search = req.query.search || '';
    let query = {};

    // --- THE UPGRADED SEARCH ENGINE ---
    if (search) {
      const Patient = require('../models/Patient');
      
      // 1. Find matching patients by Name or Phone
      const matchingPatients = await Patient.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const patientIds = matchingPatients.map(p => p._id);
      
      // 2. Match EITHER the Patient ID OR a partial match on the Invoice _id string
      query.$or = [
        { patient: { $in: patientIds } },
        { 
          $expr: { 
            $regexMatch: { 
              input: { $toString: "$_id" }, 
              regex: search, 
              options: "i" 
            } 
          } 
        }
      ];
    }

    // Fetch ALL matching bills without pagination limits
    const bills = await Bill.find(query)
      .populate('patient', 'name mobile')
      .sort({ createdAt: -1 });

    // Map the database objects into a clean, flat structure for Excel
    const csvData = bills.map(bill => ({
      Invoice_ID: bill._id.toString().slice(-8).toUpperCase(),
      Date: new Date(bill.createdAt).toLocaleDateString(),
      Time: new Date(bill.createdAt).toLocaleTimeString(),
      Patient_Name: bill.patient ? bill.patient.name : 'Walk-In',
      Patient_Mobile: bill.patient ? bill.patient.mobile : 'N/A',
      Items_Count: bill.items.length,
      Subtotal: bill.totalAmount || 0,
      Discount: bill.discount || 0,
      Grand_Total: bill.grandTotal || bill.totalAmount || 0,
      Payment_Mode: bill.paymentMode
    }));

    res.status(200).json({ success: true, data: csvData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBill, getBills, exportBills };