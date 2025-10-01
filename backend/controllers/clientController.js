const Client = require('../models/Client');
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
  const clients = await Client.find({ createdBy: req.user._id })
    .sort({ name: 1 });

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
  const client = await Client.findOne({ 
    _id: req.params.id,
    createdBy: req.user._id 
  });

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
  const client = await Client.findOneAndUpdate(
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
  const client = await Client.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user._id
  });

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

  const clients = await Client.find({
    $text: { $search: query },
    createdBy: req.user._id
  });

  res.status(200).json({
    status: 'success',
    results: clients.length,
    data: {
      clients
    }
  });
});
