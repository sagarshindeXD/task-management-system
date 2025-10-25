const {
  sendTaskAssignedEmail,
  sendTaskUpdatedEmail,
  sendTaskCompletedEmail,
  sendDeadlineReminder,
} = require('../utils/emailService');

// @desc    Get tasks assigned to the current user
// @route   GET /api/tasks/assigned-to-me
// @access  Private
exports.getMyAssignedTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.find({ 
    assignedTo: req.user.id,
    status: { $ne: 'completed' }
  })
  .populate('assignedTo', 'name email')
  .populate('createdBy', 'name email')
  .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks
    }
  });
});

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  // Check if the user has permission to view this task
  // (either the creator or an assignee)
  const isCreator = task.createdBy._id.toString() === req.user.id;
  const isAssignee = task.assignedTo.some(
    assignee => assignee._id.toString() === req.user.id
  );

  if (!isCreator && !isAssignee && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to view this task', 403)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      task
    }
  });
});

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getAllTasks = catchAsync(async (req, res, next) => {
  const { userId, ...otherQueryParams } = req.query;
  
  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  // Base query to find tasks where user is either creator or assignee
  const baseQuery = {
    $or: [
      { createdBy: userId },
      { assignedTo: userId }
    ]
  };

  // Filtering
  const queryObj = { ...otherQueryParams };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'userId'];
  excludedFields.forEach(el => delete queryObj[el]);

  // Combine base query with additional filters
  const filter = { 
    ...baseQuery,
    ...queryObj
  };
  
  let query = Task.find(filter)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('assignedBy', 'name email')
    .populate('client', 'name');

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  // Use the filter object we created earlier
  const total = await Task.countDocuments(filter);
  query = query.skip(skip).limit(limit);

  const tasks = await query;

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    total,
    data: {
      tasks
    }
  });
});

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  // Check if user is assigned to this task or is the creator
  const isAssigned = task.assignedTo.some(assignee => 
    assignee._id && assignee._id.toString() === req.user.id
  );
  const isCreator = task.createdBy && 
    (typeof task.createdBy === 'string' 
      ? task.createdBy === req.user.id 
      : task.createdBy._id.toString() === req.user.id);

  if (!isAssigned && !isCreator) {
    return next(new AppError('You are not authorized to update this task', 403));
  }

  // Validate status
  const validStatuses = ['todo', 'in-progress', 'completed', 'overdue'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  // Update status and save
  task.status = status;
  const updatedTask = await task.save({ validateBeforeSave: false });

  // Send email notifications if task is completed
  if (status === 'completed') {
    const populatedTask = await Task.findById(updatedTask._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (populatedTask) {
      // Send completion email to assignees and creator (async, don't wait)
      sendTaskCompletedEmail(populatedTask, task.assignedTo, req.user.id);
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      task: updatedTask
    }
  });
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = catchAsync(async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate, assignedTo, client, department, assignDate, labels } = req.body;

    // Validate required fields
    if (!title) {
      return next(new AppError('Task title is required', 400));
    }

    if (!client) {
      return next(new AppError('Client is required', 400));
    }

    // Process assigned users - simplified approach
    let assignedUsers = [];

    if (assignedTo) {
      const assigneeIds = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

      // Validate that users exist (without complex transaction logic)
      const users = await User.find({
        _id: { $in: assigneeIds }
      });

      if (users.length !== assigneeIds.length) {
        const foundIds = users.map(u => u._id.toString());
        const missingIds = assigneeIds.filter(id => !foundIds.includes(id.toString()));
        return next(new AppError(`One or more assigned users do not exist. Missing IDs: ${missingIds.join(', ')}`, 400));
      }

      assignedUsers = users.map(user => user._id);
    }

    // Create task with all provided data
    const taskDataToSave = {
      title,
      description,
      priority,
      status: status || 'todo',
      dueDate,
      createdBy: req.user.id,
      assignedTo: assignedUsers,
      client,
      department: department || 'General',
      assignDate: assignDate || new Date(),
      assignedBy: req.user.id, // Always use the current user as the assigner
      labels: labels || []
    };

    const task = await Task.create(taskDataToSave);

    // Populate the task with user data
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('client', 'name');

    // Send email notifications to assignees (async, don't wait)
    if (assignedUsers.length > 0) {
      sendTaskAssignedEmail(populatedTask, assignedUsers);
    }

    res.status(201).json({
      status: 'success',
      data: {
        task: populatedTask
      }
    });
  } catch (error) {
    console.error('Error creating task:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return next(new AppError(`Validation error: ${messages.join('. ')}`, 400));
    }

    if (error.code === 11000) {
      return next(new AppError('Duplicate task code', 400));
    }

    next(new AppError(error.message || 'Failed to create task', 500));
  }
});

// @desc    Update task
// @route   PATCH /api/tasks/:id
// @access  Private
exports.updateTask = catchAsync(async (req, res, next) => {
  // Convert assignee string to array if it's a single ID
  if (req.body.assignedTo && !Array.isArray(req.body.assignedTo)) {
    req.body.assignedTo = [req.body.assignedTo];
  }

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('assignedTo', 'name email')
   .populate('createdBy', 'name email')
   .populate('assignedBy', 'name email')
   .populate('client', 'name');

  if (!updatedTask) {
    return next(new AppError('No task found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      task: updatedTask
    }
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private/Admin
exports.getTaskStats = catchAsync(async (req, res, next) => {
  const stats = await Task.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgPriority: { $avg: { $switch: {
          branches: [
            { case: { $eq: ['$priority', 'high'] }, then: 3 },
            { case: { $eq: ['$priority', 'medium'] }, then: 2 },
            { case: { $eq: ['$priority', 'low'] }, then: 1 }
          ],
          default: 0
        }}}
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

// @desc    Get dashboard metrics for admin
// @route   GET /api/tasks/dashboard-metrics
// @access  Private (Admin only)
exports.getDashboardMetrics = catchAsync(async (req, res, next) => {
  try {
    // Get user-specific task statistics
    const userStats = await Task.aggregate([
      {
        $match: {
          assignedTo: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$assignedTo'
      },
      {
        $group: {
          _id: '$assignedTo',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          todoTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
          },
          delayedTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'in-progress'] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          inReviewTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } // In-progress tasks are considered "in review"
          }
        }
      }
    ]);

    // Get unique user IDs and fetch user details
    const userIds = userStats.map(stat => stat._id);
    const users = await User.find(
      { _id: { $in: userIds } },
      'name email'
    ).lean();

    // Map user data with calculated statistics
    const userMetrics = users.map(user => {
      const stats = userStats.find(s => s._id.toString() === user._id.toString()) || {};
      const total = stats.totalTasks || 0;
      const completed = stats.completedTasks || 0;
      const performance = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        _id: user._id,
        name: user.name,
        tasksAssigned: total,
        doneTasks: completed,
        pendingTasks: (stats.inProgressTasks || 0) + (stats.todoTasks || 0),
        delayedTasks: stats.delayedTasks || 0,
        inReviewTasks: stats.inReviewTasks || 0,
        workingTasks: stats.inProgressTasks || 0,
        performance: performance
      };
    });

    // Get department-specific task statistics
    const departmentStats = await Task.aggregate([
      {
        $match: {
          department: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$department',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          todoTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
          },
          delayedTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'in-progress'] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          inReviewTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } // In-progress tasks are considered "in review"
          }
        }
      }
    ]);

    // Map department data with calculated statistics
    const departmentMetrics = departmentStats.map(dept => {
      const total = dept.totalTasks || 0;
      const completed = dept.completedTasks || 0;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        name: dept._id,
        tasksAssigned: total,
        doneTasks: completed,
        pendingTasks: (dept.inProgressTasks || 0) + (dept.todoTasks || 0),
        delayedTasks: dept.delayedTasks || 0,
        inReviewTasks: dept.inReviewTasks || 0,
        workingTasks: dept.inProgressTasks || 0,
        completionRate: completionRate
      };
    });

    // Get overall summary statistics
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
    const todoTasks = await Task.countDocuments({ status: 'todo' });

    res.status(200).json({
      status: 'success',
      users: userMetrics,
      departments: departmentMetrics,
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks
      }
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    // Return empty data instead of error
    res.status(200).json({
      status: 'success',
      users: [],
      departments: [],
      summary: {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0
      }
    });
  }
});

// @desc    Get completed tasks for current user
// @route   GET /api/tasks/my-completed
// @access  Private
exports.getMyCompletedTasks = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const tasks = await Task.find({
    assignedTo: req.user.id,
    status: 'completed'
  })
  .populate('assignedTo', 'name email')
  .populate('createdBy', 'name email')
  .populate('assignedBy', 'name email')
  .populate('client', 'name')
  .sort('-updatedAt')
  .skip(skip)
  .limit(limit);

  const total = await Task.countDocuments({
    assignedTo: req.user.id,
    status: 'completed'
  });

  res.status(200).json({
    status: 'success',
    data: {
      tasks,
      total
    }
  });
});

// @desc    Get all team tasks (for organization-wide view)
// @route   GET /api/tasks/team-tasks
// @access  Private
exports.getTeamTasks = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const tasks = await Task.find({
    status: { $ne: 'completed' }  // Exclude completed tasks
  })
  .populate('assignedTo', 'name email')
  .populate('createdBy', 'name email')
  .populate('assignedBy', 'name email')
  .populate('client', 'name')
  .sort('-updatedAt')
  .skip(skip)
  .limit(limit);

  const total = await Task.countDocuments({
    status: { $ne: 'completed' }  // Exclude completed tasks from count
  });

  res.status(200).json({
    status: 'success',
    data: {
      tasks,
      total
    }
  });
});

// @desc    Get all team completed tasks (for organization-wide view)
// @route   GET /api/tasks/team-completed
// @access  Private
exports.getTeamCompletedTasks = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const tasks = await Task.find({
    status: 'completed'
  })
  .populate('assignedTo', 'name email')
  .populate('createdBy', 'name email')
  .populate('assignedBy', 'name email')
  .populate('client', 'name')
  .sort('-updatedAt')
  .skip(skip)
  .limit(limit);

  const total = await Task.countDocuments({
    status: 'completed'
  });

  res.status(200).json({
    status: 'success',
    data: {
      tasks,
      total
    }
  });
});
