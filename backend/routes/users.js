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

// User routes
router.get('/me', userController.getMe);
router.patch('/update-me', userController.updateMe);
router.patch('/update-password', userController.updatePassword);
router.delete('/delete-me', userController.deleteMe);

// Get all users and delete specific users (admin only)
router.route('/')
  .get(authorize('admin'), userController.getAllUsers);

router.route('/:id')
  .delete(authorize('admin'), userController.deleteUserById);

module.exports = router;
