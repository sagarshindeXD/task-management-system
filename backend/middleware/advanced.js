const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const express = require('express');
const AppError = require('../utils/AppError');

// Rate limiting middleware
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: 'error',
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Security middleware
const securityMiddleware = [
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  }),
];

// Rate limiting configurations
const rateLimits = {
  auth: createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts, please try again after 15 minutes.'), // 5 attempts per 15 minutes
  general: createRateLimit(15 * 60 * 1000, 100, 'Too many requests, please try again after 15 minutes.'), // 100 requests per 15 minutes
  strict: createRateLimit(15 * 60 * 1000, 20, 'Too many requests, please try again after 15 minutes.'), // 20 requests per 15 minutes
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Log request
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusColor = statusCode >= 400 ? '\x1b[31m' : statusCode >= 300 ? '\x1b[33m' : '\x1b[32m';
    const resetColor = '\x1b[0m';

    console.log(`[${timestamp}] ${req.method} ${req.url} - ${statusColor}${statusCode}${resetColor} - ${duration}ms`);
  });

  next();
};

// Enhanced error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Handle different types of errors
  let statusCode = 500;
  let message = 'Internal server error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join('. ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
  } else if (err.message && err.message.includes('Not allowed by CORS')) {
    statusCode = 403;
    message = 'CORS policy violation';
  } else if (err.message) {
    message = err.message;
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Something went wrong!';
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }
    next();
  };
};

// API response formatter middleware
const responseFormatter = (req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    // Add request metadata to response
    const responseData = {
      status: 'success',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      ...data
    };

    originalJson.call(this, responseData);
  };
  next();
};

module.exports = {
  securityMiddleware,
  rateLimits,
  requestLogger,
  errorHandler,
  validateRequest,
  responseFormatter,
};
