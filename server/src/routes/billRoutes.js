const express = require('express');
const router = express.Router();
const { createBill } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

// Only logged-in users can create bills
router.post('/', protect, createBill);

module.exports = router;