const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/users
// @desc    Get all users
// @access  Admin
router.get('/', protect, authorize(['Admin']), getUsers);

// @route   PUT /api/users/:id/role
// @desc    Update a user's role
// @access  Admin
router.put('/:id/role', protect, authorize(['Admin']), updateUserRole);

module.exports = router;