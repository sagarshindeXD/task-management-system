const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  
  if (!status) {
    return next(new AppError('Status is required', 400));
  }

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  ).populate('assignedTo', 'name email')
   .populate('createdBy', 'name email');

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      task
    }
  });
});

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
    .populate('createdBy', 'name email');

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
  const validStatuses = ['todo', 'in-progress', 'completed'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  // Update status and save
  task.status = status;
  const updatedTask = await task.save({ validateBeforeSave: false });

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
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { assignedTo, ...taskData } = req.body;
    
    // Add current user as creator
    taskData.createdBy = req.user.id;
    
    // Process assigned users
    if (!assignedTo || (Array.isArray(assignedTo) && assignedTo.length === 0)) {
      throw new AppError('At least one assignee is required', 400);
    }

    // Convert to array if it's a single ID
    const assigneeIds = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    
    // Convert all IDs to strings for consistent comparison
    const assigneeIdStrings = assigneeIds.map(id => id.toString().trim());
    
    // Log the IDs for debugging
    console.log('Looking for users with IDs:', assigneeIdStrings);
    
    // Verify all users exist
    const users = await User.find({ 
      _id: { $in: assigneeIdStrings } 
    }).session(session);
    
    // Log found users for debugging
    console.log('Found users:', users.map(u => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email
    })));
    
    if (users.length !== assigneeIdStrings.length) {
      const foundIds = users.map(u => u._id.toString());
      const missingIds = assigneeIdStrings.filter(id => !foundIds.includes(id));
      
      throw new AppError(`One or more assigned users do not exist. Missing IDs: ${missingIds.join(', ')}`, 400);
    }
    
    // Use the user objects from the database to ensure we have the correct ObjectIds
    const assignedUsers = users.map(user => user._id);
    
    // Create task with assigned users
    const taskDataToSave = {
      ...taskData,
      assignedTo: assignedUsers,
      status: taskData.status || 'todo'
    };
    
    console.log('Creating task with data:', JSON.stringify(taskDataToSave, null, 2));
    
    const task = new Task(taskDataToSave);
    
    await task.save({ session });
    
    // Populate the task with user data
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .session(session);
    
    if (!populatedTask) {
      throw new AppError('Error creating task', 500);
    }
    
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: 'success',
      data: {
        task: populatedTask
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error in createTask:', error);
    
    if (error.name === 'ValidationError') {
      const messages = error.errors ? 
        Object.values(error.errors).map(val => val.message) : 
        [error.message];
      return next(new AppError(`Validation error: ${messages.join('. ')}`, 400));
    }
    
    next(new AppError(error.message || 'Failed to create task', error.statusCode || 500));
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
   .populate('createdBy', 'name email');

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

// @desc    Get tasks assigned to the current user
// @route   GET /api/tasks/assigned-to-me
// @access  Private
exports.getMyAssignedTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.find({ 
    assignedTo: req.user.id 
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
