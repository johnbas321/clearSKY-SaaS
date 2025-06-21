import express from 'express';
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserStats,
  getUserByEmail
} from '../controllers/userController.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId
} from '../middlewares/validation.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'User management service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Statistics route
router.get('/stats', getUserStats);

// Get user by email (for auth service)
router.get('/email/:email', getUserByEmail);

// CRUD routes
router.post('/', validateCreateUser, createUser);
router.get('/', getAllUsers);
router.get('/:id', validateUserId, getUser);
router.put('/:id', validateUserId, validateUpdateUser, updateUser);
router.delete('/:id', validateUserId, deleteUser);

export default router;