const Medicine = require('../models/Medicine');

// @desc    Get all medicines (Paginated & Searchable)
// @route   GET /api/medicines
// @access  Private
const getMedicines = async (req, res) => {
  try {
    // 1. Extract query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Default to 20 items per page
    const search = req.query.search || '';
    
    // 2. Calculate how many documents to skip
    const skip = (page - 1) * limit;

    // 3. Build the query object
    let query = { isDeleted: false };
    
    // If user is searching, use Regex for partial, case-insensitive matching
    if (search) {
      query.name = { $regex: search, $options: 'i' }; 
    }

    // 4. Run Count and Fetch concurrently for maximum speed
    const [total, medicines] = await Promise.all([
      Medicine.countDocuments(query),
      Medicine.find(query)
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit)
    ]);

    // 5. Return the paginated payload
    res.status(200).json({ 
      success: true, 
      count: medicines.length,
      pagination: {
        totalRecords: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      },
      data: medicines 
    });

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