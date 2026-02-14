const Medicine = require('../models/Medicine');

// @desc    Get all medicines (with filter for low stock)
// @route   GET /api/medicines
const getMedicines = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    // Search logic (RegEx for partial matching)
    const query = keyword ? {
      name: { $regex: keyword, $options: 'i' },
      isDeleted: false
    } : { isDeleted: false };

    const medicines = await Medicine.find(query).sort({ name: 1 });
    res.json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a NEW medicine
// @route   POST /api/medicines
const addMedicine = async (req, res) => {
  try {
    // Determine total stock from initial batches
    const { batches } = req.body;
    
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Add a BATCH to existing medicine
// @route   PUT /api/medicines/:id/batch
const addBatch = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    // Add new batch to the array
    medicine.batches.push(req.body);
    
    // The pre('save') hook in the model will auto-update 'totalStock'
    await medicine.save();

    res.json({ success: true, data: medicine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getMedicines, addMedicine, addBatch };