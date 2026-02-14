const express = require('express');
const router = express.Router();
const { getPatients } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPatients);

module.exports = router;