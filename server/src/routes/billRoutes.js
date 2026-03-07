const express = require('express');
const router = express.Router();
const { createBill, getBills, exportBills } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

// Only logged-in users can create bills
router.post('/', protect, createBill);
router.get('/', protect, getBills); 
router.get('/export', protect, exportBills); 

module.exports = router;