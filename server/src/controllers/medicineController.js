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

// @desc    Create a NEW medicine
// @route   POST /api/medicines
// 🔴 FIX: Renamed from addMedicine to createMedicine
const createMedicine = async (req, res) => {
  try {
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

// @desc    Update a medicine
// @route   PUT /api/medicines/:id
// @access  Private (Admin)
const updateMedicine = async (req, res) => {
  try {
    let medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    // Assuming we overwrite the first batch for simplicity based on our frontend structure
    const updatedData = req.body;
    
    // Recalculate total stock safely based on new batch info
    if (updatedData.batches && updatedData.batches.length > 0) {
      updatedData.totalStock = updatedData.batches.reduce((acc, batch) => acc + batch.quantity, 0);
    }

    medicine = await Medicine.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: medicine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a medicine (Soft Delete to protect old bills)
// @route   DELETE /api/medicines/:id
// @access  Private (Admin)
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    // 🔴 FIX: Soft delete instead of hard delete!
    medicine.isDeleted = true;
    await medicine.save();
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 🟢 PERFECT EXPORTS
module.exports = { 
  getMedicines, 
  createMedicine, // Fixed name
  updateMedicine, 
  deleteMedicine, 
  addBatch
};