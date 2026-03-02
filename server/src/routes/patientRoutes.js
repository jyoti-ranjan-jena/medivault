const express = require('express');
const router = express.Router();
// IMPORT the new createPatient controller here:
const { getPatients, createPatient } = require('../controllers/patientController'); 
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPatients);
router.post('/', protect, createPatient); // ADD THIS LINE

module.exports = router;