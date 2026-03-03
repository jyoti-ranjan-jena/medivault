const User = require('../models/User'); // Ensure this path matches your User model

// @desc    Get all registered staff members
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    // .select('-password') ensures we NEVER accidentally send passwords to the frontend!
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new staff account
// @route   POST /api/users
// @access  Private (Admin only)
const createStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if email is already taken
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered in the system.' });
    }

    // 2. Create the user (Your User model should automatically hash the password in a pre('save') hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'attendant' // Default to least-privileged role
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, createStaff };