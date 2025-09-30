const express = require('express');
const taskController = require('../controllers/taskController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Get tasks assigned to the current user
router.get('/assigned-to-me', taskController.getMyAssignedTasks);

router
  .route('/')
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router
  .route('/stats')
  .get(
    authController.restrictTo('admin'),
    taskController.getTaskStats
  );

// Status update route
router.patch('/:id/status', taskController.updateTaskStatus);

router
  .route('/:id')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
