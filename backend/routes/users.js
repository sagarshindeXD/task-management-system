const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protect all routes after this middleware
router.use(authController.protect);

// User routes
router.get('/me', userController.getMe);
router.patch('/update-me', userController.updateMe);
router.patch('/update-password', userController.updatePassword);
router.delete('/delete-me', userController.deleteMe);

// Get all users (accessible to all authenticated users)
router.route('/').get(userController.getAllUsers);

module.exports = router;
