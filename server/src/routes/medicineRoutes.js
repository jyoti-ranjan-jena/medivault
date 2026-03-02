const express = require('express');
const router = express.Router();
// 🔴 FIX: Cleaned up imports to match the controller exactly
const { 
  getMedicines, 
  createMedicine, 
  addBatch, 
  updateMedicine, 
  deleteMedicine 
} = require('../controllers/medicineController');

// Import the security middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Route (Maybe viewing medicines is allowed for all staff?)
// Let's protect it so only logged-in users can see inventory
router.route('/')
  .get(protect, getMedicines)
  // 🔴 FIX: Changed addMedicine to createMedicine
  .post(protect, authorize('admin', 'pharmacist'), createMedicine); 

// Adding a batch is also restricted
router.route('/:id/batch')
  .put(protect, authorize('admin', 'pharmacist'), addBatch);

// 🔴 FIX: Added the missing Edit and Delete routes!
router.route('/:id')
  .put(protect, authorize('admin', 'pharmacist'), updateMedicine)
  .delete(protect, authorize('admin', 'pharmacist'), deleteMedicine);

module.exports = router;