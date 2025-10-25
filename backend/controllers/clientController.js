const Client = require('../models/Client');
const Task = require('../models/Task');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private
exports.createClient = catchAsync(async (req, res, next) => {
  const client = await Client.create({
    ...req.body,
    createdBy: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: {
      client
    }
  });
});

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
exports.getAllClients = catchAsync(async (req, res, next) => {
  let clients;

  if (req.user.role === 'admin') {
    // Admin users can see all clients
    clients = await Client.find({})
      .sort({ name: 1 });
  } else {
    // Regular users can only see their own clients
    clients = await Client.find({
      createdBy: req.user._id
    })
      .sort({ name: 1 });
  }

  res.status(200).json({
    status: 'success',
    results: clients.length,
    data: {
      clients
    }
  });
});

// @desc    Get a single client
// @route   GET /api/clients/:id
// @access  Private
exports.getClient = catchAsync(async (req, res, next) => {
  let client;

  if (req.user.role === 'admin') {
    // Admin users can access any client
    client = await Client.findById(req.params.id);
  } else {
    // Regular users can only access their own clients
    client = await Client.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
  }

  if (!client) {
    return next(new AppError('No client found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      client
    }
  });
});

// @desc    Update a client
// @route   PATCH /api/clients/:id
// @access  Private
exports.updateClient = catchAsync(async (req, res, next) => {
  let client;

  if (req.user.role === 'admin') {
    // Admin users can update any client
    client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
  } else {
    // Regular users can only update their own clients
    client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
  }

  if (!client) {
    return next(new AppError('No client found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      client
    }
  });
});

// @desc    Delete a client
// @route   DELETE /api/clients/:id
// @access  Private
exports.deleteClient = catchAsync(async (req, res, next) => {
  // First, check if there are any tasks associated with this client
  const tasksCount = await Task.countDocuments({ client: req.params.id });

  if (tasksCount > 0) {
    return next(new AppError(
      `Cannot delete client because it has ${tasksCount} associated task${tasksCount > 1 ? 's' : ''}. Please delete or reassign these tasks first.`,
      400
    ));
  }

  let client;

  if (req.user.role === 'admin') {
    // Admin users can delete any client
    client = await Client.findByIdAndDelete(req.params.id);
  } else {
    // Regular users can only delete their own clients
    client = await Client.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });
  }

  if (!client) {
    return next(new AppError('No client found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Search clients
// @route   GET /api/clients/search
// @access  Private
exports.searchClients = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new AppError('Please provide a search query', 400));
  }

  let clients;

  if (req.user.role === 'admin') {
    // Admin users can search all clients
    clients = await Client.find({
      $text: { $search: query }
    });
  } else {
    // Regular users can only search their own clients
    clients = await Client.find({
      createdBy: req.user._id,
      $text: { $search: query }
    });
  }

  res.status(200).json({
    status: 'success',
    results: clients.length,
    data: {
      clients
    }
  });
});

// @desc    Update client status
// @route   PATCH /api/clients/:id/status
// @access  Private
exports.updateClientStatus = catchAsync(async (req, res, next) => {
  const { isActive } = req.body;

  let client;

  if (req.user.role === 'admin') {
    // Admin users can update any client's status
    client = await Client.findByIdAndUpdate(
      req.params.id,
      { isActive },
      {
        new: true,
        runValidators: true
      }
    );
  } else {
    // Regular users can only update their own clients' status
    client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id
      },
      { isActive },
      {
        new: true,
        runValidators: true
      }
    );
  }

  if (!client) {
    return next(new AppError('No client found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      client
    }
  });
});
