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

module.exports = { getPatients };