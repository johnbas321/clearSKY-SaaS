import { User } from '../models/User.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

// Create new user
export const createUser = asyncHandler(async (req, res) => {
  const { id, full_name, email, password, role } = req.body;

  // Check if user already exists

  const existingUserById = await User.findByEmail(email);
  if (existingUserById) {
    return res.status(409).json({
      success: false,
      message: 'User with this ID already exists'
    });
  }

  const existingUserByEmail = await User.findByEmail(email);
  if (existingUserByEmail) {
    return res.status(409).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create new user
  const newUser = await User.create({
    id: id,
    full_name: full_name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser.toJSON()
  });
});

// Get user by ID
export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { include_auth } = req.query;

  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Return with or without authentication data based on query parameter
  const userData = include_auth === 'true' ? user.toJSONWithAuth() : user.toJSON();

  res.json({
    success: true,
    data: userData
  });
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Clean and prepare update data
  const cleanUpdateData = {};
  
  if (updateData.id) {
    cleanUpdateData.id = updateData.id
  }

  if (updateData.full_name) {
    cleanUpdateData.full_name = updateData.full_name.trim();
  }
  
  if (updateData.email) {
    cleanUpdateData.email = updateData.email.toLowerCase().trim();
  }
  
  if (updateData.password) {
    cleanUpdateData.password = updateData.password;
  }
  
  if (updateData.role) {
    cleanUpdateData.role = updateData.role;
  }

  // Check if email is being changed and if it already exists
  if (cleanUpdateData.email) {
    const existingUser = await User.findByEmail(cleanUpdateData.email);
    if (existingUser && existingUser.id !== parseInt(id)) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }
  }

  const updatedUser = await User.update(id, cleanUpdateData);
  
  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser.toJSON()
  });
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await User.delete(id);
  
  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Get all users with filters
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, limit, include_auth } = req.query;

  const filters = {};
  
  if (role) {
    filters.role = role.toUpperCase();
  }
  
  if (search) {
    filters.search = search;
  }
  
  if (limit) {
    filters.limit = parseInt(limit);
  }

  const users = await User.findAll(filters);

  // Convert users to appropriate format
  const userData = users.map(user => 
    include_auth === 'true' ? user.toJSONWithAuth() : user.toJSON()
  );

  res.json({
    success: true,
    data: userData,
    count: userData.length
  });
});

// Get user statistics
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.getCountByRole();
  
  res.json({
    success: true,
    data: {
      total: Object.values(stats).reduce((sum, count) => sum + count, 0),
      by_role: stats
    }
  });
});

// Get user by email (for authentication service)
export const getUserByEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;
  console.log(req.params)
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email parameter is required'
    });
  }

  const user = await User.findByEmail(email.toLowerCase());
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  console.log(user.toJSONWithAuth)
  // Always include auth data for this endpoint (used by auth service)
  res.json({
    success: true,
    data: user.toJSONWithAuth()
  });
});