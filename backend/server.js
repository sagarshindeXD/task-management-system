require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const clientRoutes = require('./routes/clients');

// Import cron jobs (optional - only if email is configured)
let startCronJobs;
try {
  const cronJobs = require('./utils/cronJobs');
  startCronJobs = cronJobs.startCronJobs;
} catch (error) {
  console.log('Cron jobs not available (email service not configured)');
  startCronJobs = () => console.log('Email notifications disabled');
}

// Initialize express
const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://task-management-system-five-theta.vercel.app',
  'https://task-management-system-4me42h9no-sagarshindexds-projects.vercel.app',
  'https://task-management-system-rimh.onrender.com',
  'https://task-management-system-git-main-sagarshindexds-projects.vercel.app',
  'https://task-management-system-2itvh436w-sagarshindexds-projects.vercel.app',
  'https://task-management-system-ox9ac1006-sagarshindexds-projects.vercel.app',
  // Add regex patterns for all Vercel deployments
  /^https:\/\/task-management-system-.*-sagarshindexds-projects\.vercel\.app$/,
  /^https:\/\/task-management-system(-[a-z0-9]+)*\.vercel\.app$/,
  // Also allow any subdomain of vercel.app for development
  /^https:\/\/.*\.vercel\.app$/
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }

    // Check if origin matches any of the allowed origins
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      console.log(`CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`CORS: Blocking origin: ${origin}`);
      console.log('Allowed origins:', allowedOrigins.map(o => typeof o === 'string' ? o : o.toString()));
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'Expires',
    'X-XSRF-TOKEN'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200
};

// Enable preflight for all routes
app.options('*', cors(corsOptions));

// Basic middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Add CORS headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Check if origin is allowed
  const isAllowed = !origin || allowedOrigins.some(allowedOrigin => {
    if (typeof allowedOrigin === 'string') {
      return allowedOrigin === origin;
    } else if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin);
    }
    return false;
  });

  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires, X-XSRF-TOKEN');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`CORS: Handling preflight request from origin: ${origin}`);
    return res.sendStatus(200);
  }

  next();
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  // Start cron jobs for email notifications (only if configured)
  startCronJobs();
})
.catch(err => console.error('MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Task Management System API',
    documentation: 'https://github.com/sagarshindeXD/task-management-system#readme',
    endpoints: {
      tasks: '/api/tasks',
      users: '/api/users'
    }
  });
});

// Health check route for debugging
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    routes: {
      'GET /api/users': 'Available',
      'POST /api/users/login': 'Available',
      'POST /api/users/register': 'Available'
    }
  });
});

// API Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/users - Get all users (admin only)');
  console.log('  POST /api/users/login - User login');
  console.log('  POST /api/users/register - User registration');
  console.log('  GET  /api/tasks - Get tasks');
  console.log('  POST /api/tasks - Create task');
  console.log('  GET  /api/clients - Get clients');
  console.log('  POST /api/clients - Create client');
});
