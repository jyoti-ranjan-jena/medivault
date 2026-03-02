const express = require('express');
const router = express.Router();
const { createBill, getBills } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

// Only logged-in users can create bills
router.post('/', protect, createBill);
router.get('/', protect, getBills); // ADD THIS LINE

module.exports = router;