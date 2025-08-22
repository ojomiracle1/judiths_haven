const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const XLSX = require('xlsx');
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;
const fs = require('fs');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.isAdmin ? 'admin' : 'user',
      token: generateToken(user._id),
    });
  } else {
    throw new ApiError(401, 'Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    isAdmin: email === 'ojomiracle20@gmail.com' ? true : false,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.isAdmin ? 'admin' : 'user',
      token: generateToken(user._id),
    });
  } else {
    throw new ApiError(400, 'Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.isAdmin ? 'admin' : 'user',
      address: user.address,
      phone: user.phone,
    });
  } else {
    throw new ApiError(404, 'User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    // Address validation
    if (req.body.address) {
      const { street, city, state, postalCode, country } = req.body.address;
      if (!street || !city || !state || !postalCode || !country) {
        return res.status(400).json({
          message: 'All address fields (street, city, state, postalCode, country) are required.',
        });
      }
      user.address = {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      };
    }
    if (req.body.phone) {
      user.phone = req.body.phone;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      role: updatedUser.isAdmin ? 'admin' : 'user',
      address: updatedUser.address,
      phone: updatedUser.phone,
      token: generateToken(updatedUser._id),
    });
  } else {
    throw new ApiError(404, 'User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.json({ message: 'User removed' });
  } else {
    throw new ApiError(404, 'User not found');
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    throw new ApiError(404, 'User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin;
    if (req.body.address) {
      user.address = req.body.address;
    }
    if (req.body.phone) {
      user.phone = req.body.phone;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      role: updatedUser.isAdmin ? 'admin' : 'user',
      address: updatedUser.address,
      phone: updatedUser.phone,
    });
  } else {
    throw new ApiError(404, 'User not found');
  }
});

// @desc    Bulk delete users
// @route   POST /api/users/bulk-delete
// @access  Private/Admin
const bulkDeleteUsers = asyncHandler(async (req, res) => {
  const { userIds } = req.body;
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: 'No user IDs provided' });
  }
  const result = await User.deleteMany({ _id: { $in: userIds } });
  res.json({ message: `Deleted ${result.deletedCount} users` });
});

// @desc    Bulk update users (role/status)
// @route   PUT /api/users/bulk-update
// @access  Private/Admin
const bulkUpdateUsers = asyncHandler(async (req, res) => {
  const { userIds, update } = req.body;
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: 'No user IDs provided' });
  }
  // Only allow safe fields
  const allowedFields = ['isAdmin', 'role', 'status'];
  const updateFields = {};
  for (const key of allowedFields) {
    if (update[key] !== undefined) updateFields[key] = update[key];
  }
  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }
  const result = await User.updateMany({ _id: { $in: userIds } }, { $set: updateFields });
  res.json({ message: `Updated ${result.nModified || result.modifiedCount || 0} users` });
});

// @desc    Export users as CSV or Excel
// @route   GET /api/users/export?format=csv|excel
// @access  Private/Admin
const exportUsers = asyncHandler(async (req, res) => {
  try {
    const format = req.query.format || 'csv';
    const users = await User.find({}).lean();
    const fields = [
      { id: '_id', title: 'ID' },
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'isAdmin', title: 'IsAdmin' },
      { id: 'isBanned', title: 'IsBanned' },
      { id: 'createdAt', title: 'CreatedAt' },
    ];
    const data = users.map(u => ({
      ID: u._id,
      Name: u.name,
      Email: u.email,
      IsAdmin: u.isAdmin,
      IsBanned: u.isBanned,
      CreatedAt: u.createdAt,
    }));
    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.end(buf);
    } else {
      const csvWriter = createCsvWriter({ header: fields });
      const csv = csvWriter.stringifyRecords(users.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        isAdmin: u.isAdmin,
        isBanned: u.isBanned,
        createdAt: u.createdAt,
      })));
      res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
      res.setHeader('Content-Type', 'text/csv');
      return res.end(csv);
    }
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  bulkDeleteUsers,
  bulkUpdateUsers,
  exportUsers,
};