const Patient = require('../models/Patient');

// @desc    Get all patients (Paginated & Searchable & Filtered)
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';
    const tier = req.query.membershipTier || 'All'; 
    const status = req.query.status || 'All'; 
    
    const skip = (page - 1) * limit;

    let query = { isDeleted: false };
    
    // 1. Apply Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Apply Tier Filter
    if (tier && tier !== 'All') {
      query.membershipTier = tier;
    }

    // 3. Apply Status Filter 
    if (status && status !== 'All') {
      query.status = status;
    }

    // Run Count, Fetch, and Global Stats concurrently for maximum speed
    const [totalFiltered, patients, globalActive, globalPlatinum, ltvData] = await Promise.all([
      Patient.countDocuments(query),
      Patient.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Patient.countDocuments({ isDeleted: false, status: 'Active' }),
      Patient.countDocuments({ isDeleted: false, membershipTier: 'Platinum' }),
      Patient.aggregate([
        { $match: { isDeleted: false } }, 
        { $group: { _id: null, total: { $sum: "$totalLifetimeSpent" } } }
      ])
    ]);

    const totalLTV = ltvData.length > 0 ? ltvData[0].total : 0;

    res.status(200).json({ 
      success: true, 
      count: patients.length,
      globalStats: {
        totalActive: globalActive,
        totalPlatinum: globalPlatinum,
        totalLTV: totalLTV
      },
      pagination: {
        totalRecords: totalFiltered,
        currentPage: page,
        totalPages: Math.ceil(totalFiltered / limit),
        hasNextPage: page * limit < totalFiltered,
        hasPrevPage: page > 1
      },
      data: patients 
    });

  } catch (error) {
    console.error("Backend Error in getPatients:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new patient
// @route   POST /api/patients
const createPatient = async (req, res) => {
  try {
    const patientExists = await Patient.findOne({ mobile: req.body.mobile, isDeleted: false });
    if (patientExists) {
      return res.status(400).json({ success: false, message: 'A patient with this mobile number already exists.' });
    }

    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a patient profile (Status, VIP Tier, Clinical Info)
// @route   PUT /api/patients/:id
const updatePatient = async (req, res) => {
  try {
    let patient = await Patient.findById(req.params.id);
    
    if (!patient || patient.isDeleted) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Soft Delete a patient
// @route   DELETE /api/patients/:id
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient || patient.isDeleted) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Soft delete so old bills don't crash
    patient.isDeleted = true;
    await patient.save();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Only ONE clean export at the bottom!
module.exports = { getPatients, createPatient, updatePatient, deletePatient };