import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { testConnection, closePool } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/users', userRoutes);

// Root health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'User Management Service API',
    version: '1.0.0',
    endpoints: {
      health: '/users/health',
      stats: '/users/stats',
      create_user: 'POST /users',
      get_all_users: 'GET /users',
      get_user: 'GET /users/:id',
      update_user: 'PUT /users/:id',
      delete_user: 'DELETE /users/:id',
      get_user_by_email: 'GET /users/email/:email'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.log('⚠️  Starting server without database connection...');
      console.log('   Database will be retried on first request');
    }

    app.listen(PORT, () => {
      console.log(`🚀 User management service running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/users/health`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await closePool();
  process.exit(0);
});

startServer();