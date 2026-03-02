const Patient = require('../models/Patient');

// @desc    Get all patients
// @route   GET /api/patients
const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
const createPatient = async (req, res) => {
  try {
    const { name, mobile, age, gender, address } = req.body;
    
    // Check if patient with mobile already exists
    const existingPatient = await Patient.findOne({ mobile });
    if (existingPatient) {
      return res.status(400).json({ success: false, message: 'Patient with this mobile number already exists' });
    }

    const patient = await Patient.create({
      name, mobile, age, gender, address
    });

    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// EXPORT BOTH AT THE BOTTOM
module.exports = { 
  getPatients, 
  createPatient 
};