const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protect all routes after this middleware
router.use(protect);

// Test endpoint to check authentication and role
router.get('/test-auth', (req, res) => {
  console.log('Test auth endpoint called');
  console.log('User:', req.user);
  res.json({
    status: 'success',
    data: {
      user: req.user,
      message: 'Authentication working'
    }
  });
});

// Simple test endpoint (no admin required)
router.get('/ping', (req, res) => {
  res.json({
    status: 'success',
    message: 'Users API is working',
    timestamp: new Date().toISOString()
  });
});

// User routes
router.get('/me', userController.getMe);
router.patch('/update-me', userController.updateMe);
router.patch('/update-password', userController.updatePassword);
router.delete('/delete-me', userController.deleteMe);

// Get all users and delete specific users (admin only)
router.route('/')
  .get(authorize('admin'), userController.getAllUsers);

router.route('/:id')
  .delete(authorize('admin'), (req, res, next) => {
    console.log('DELETE request received for user ID:', req.params.id);
    console.log('Current user role:', req.user?.role);
    console.log('Current user ID:', req.user?.id);
    userController.deleteUserById(req, res, next);
  });

module.exports = router;
