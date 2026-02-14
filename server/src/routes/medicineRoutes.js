const express = require('express');
const router = express.Router();
const { getMedicines, addMedicine, addBatch } = require('../controllers/medicineController');

// Import the security middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Route (Maybe viewing medicines is allowed for all staff?)
// Let's protect it so only logged-in users can see inventory
router.route('/').get(protect, getMedicines);

// Admin & Pharmacist Only Routes
// 'attendants' cannot add new medicines, only admins/pharmacists can.
router.route('/').post(protect, authorize('admin', 'pharmacist'), addMedicine);

// Adding a batch is also restricted
router.route('/:id/batch').put(protect, authorize('admin', 'pharmacist'), addBatch);

module.exports = router;