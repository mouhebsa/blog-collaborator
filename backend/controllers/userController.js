const User = require("../models/user");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  const { roles } = req.body;
  const userId = req.params.id;

  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return res
      .status(400)
      .json({ message: "Roles are required and must be an array." });
  }

  const validRoles = User.schema.path("roles").caster.enumValues;
  if (roles.some((role) => !validRoles.includes(role))) {
    return res.status(400).json({
      message: `Invalid role specified. Valid roles are: ${validRoles.join(
        ", "
      )}`,
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.roles = roles;
    await user.save();

    const updatedUser = await User.findById(userId).select("-password");
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    if (error.name === "CastError" && error.path === "_id") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
};
