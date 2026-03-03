const express = require('express');
const router = express.Router();
const { getPatients, createPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getPatients)
  .post(protect, createPatient);

router.route('/:id')
  .put(protect, updatePatient)
  .delete(protect, deletePatient);

module.exports = router;