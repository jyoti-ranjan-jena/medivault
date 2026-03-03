const express = require('express');
const router = express.Router();
const { getUsers, createStaff } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// 🔒 Strictly locked to Admins only
router.route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createStaff);

module.exports = router;