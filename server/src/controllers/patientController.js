// const Patient = require('../models/Patient');

// // @desc    Get all patients
// // @route   GET /api/patients
// const getPatients = async (req, res) => {
//   try {
//     const patients = await Patient.find({});
//     res.json({ success: true, data: patients });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Create new patient
// // @route   POST /api/patients
// // @access  Private
// const createPatient = async (req, res) => {
//   try {
//     const { name, mobile, age, gender, address } = req.body;
    
//     // Check if patient with mobile already exists
//     const existingPatient = await Patient.findOne({ mobile });
//     if (existingPatient) {
//       return res.status(400).json({ success: false, message: 'Patient with this mobile number already exists' });
//     }

//     const patient = await Patient.create({
//       name, mobile, age, gender, address
//     });

//     res.status(201).json({ success: true, data: patient });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // EXPORT BOTH AT THE BOTTOM
// module.exports = { 
//   getPatients, 
//   createPatient 
// };

const Patient = require('../models/Patient');

// @desc    Get all active patients
// @route   GET /api/patients
const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ isDeleted: false }).sort('-createdAt');
    res.status(200).json({ success: true, count: patients.length, data: patients });
  } catch (error) {
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

module.exports = { getPatients, createPatient, updatePatient, deletePatient };