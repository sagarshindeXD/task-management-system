# Task Management System

A comprehensive task management system with admin panel, email notifications, color coding, and advanced backend features.

## 🚀 Features

### ✅ Admin Panel & Management
- **Admin Panel Access**: Admin users can access a dedicated admin panel from the main sidebar
- **User Management**: Full CRUD operations for user accounts with role-based access
- **Client Management**: Complete client management system with status tracking
- **Admin Dashboard**: Overview dashboard with statistics, quick actions, and recent activity
- **Shared Client System**: Clients are visible to all users but can only be managed by their creators

### 🎨 Color Coding & Visual Improvements
- **Priority-based Color Coding**: Tasks are color-coded based on priority (High=Red, Medium=Orange, Low=Green)
- **Overdue Task Highlighting**: Tasks past their due date are highlighted in red
- **Status-based Styling**: Different visual styling for different task statuses
- **Interactive Elements**: Hover effects and visual feedback throughout the UI

### 📋 Enhanced Task Details
- **Priority Management**: High, Medium, Low priority levels with visual indicators
- **Deadline Tracking**: Due dates with automatic overdue detection
- **Status Management**: Todo, In Progress, Completed, and Overdue status options
- **Rich Task Information**: Comprehensive task details with assignee information, client details, and timestamps

### 📧 Email Notifications
- **Task Assignment Emails**: Automatic emails when tasks are assigned
- **Task Update Notifications**: Email alerts when tasks are updated
- **Completion Notifications**: Celebration emails when tasks are completed
- **Deadline Reminders**: Automated reminders for upcoming deadlines
- **Scheduled Notifications**: Cron jobs for daily and hourly deadline checks

### 🔧 Backend Improvements
- **Advanced Security**: Helmet.js protection, rate limiting, CORS configuration
- **Request Logging**: Detailed logging of all API requests and responses
- **Error Handling**: Comprehensive error handling with detailed logging
- **Response Formatting**: Consistent API response structure
- **Database Optimization**: Efficient queries and proper indexing

## 🛠️ Installation

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:
   ```env
   # Database Configuration
   MONGODB_URI=your-mongodb-connection-string

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Email Configuration (for notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Frontend URL (for email links)
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start Backend Server**
   ```bash
   npm run dev  # Development mode with nodemon
   # or
   npm start    # Production mode
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend Server**
   ```bash
   npm start  # Development mode
   # or
   npm run build  # Production build
   ```

## 🔐 Authentication & Authorization

- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin and regular user roles
- **Session Management**: Automatic session timeout and activity tracking
- **Protected Routes**: Route-level protection based on authentication and roles

## 📊 Admin Features

### Dashboard Overview
- Real-time statistics (users, clients, tasks, overdue items)
- Quick action buttons for common admin tasks
- Recent users and clients tables
- Task status overview with visual indicators

### User Management
- View all users in the system
- Delete users (with safety checks)
- Role management (admin/regular users)
- User activity tracking

### Client Management
- Add, edit, and delete clients
- Client status management (active/inactive)
- Shared client visibility across all users
- Client creation tracking

## 🎯 Task Management

### Color Coding System
- **Red Background**: Overdue tasks (past due date)
- **Priority Colors**:
  - 🔴 High Priority: Red background
  - 🟠 Medium Priority: Orange background
  - 🟢 Low Priority: Green background
- **Status Indicators**: Visual chips for task status

### Email Notifications
- **Assignment**: Email sent to assignees when tasks are created
- **Updates**: Notifications when tasks are modified
- **Completion**: Celebration emails when tasks are completed
- **Reminders**: Daily reminders for upcoming deadlines
- **Overdue Alerts**: Hourly checks for newly overdue tasks

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse (5 auth attempts per 15 minutes, 100 general requests per 15 minutes)
- **Helmet.js Protection**: Security headers and XSS protection
- **CORS Configuration**: Secure cross-origin resource sharing
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses without information leakage

## 📱 Responsive Design

- **Mobile-friendly**: Optimized for all device sizes
- **Adaptive Layouts**: Responsive admin and main layouts
- **Touch-friendly**: Large touch targets and proper spacing
- **Cross-browser**: Compatible with modern browsers

## 🚀 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Efficient Loading**: Lazy loading and pagination
- **Caching**: Response caching and optimization
- **Code Splitting**: Optimized bundle sizes

## 📧 Email Configuration

For email notifications to work, you need to:

1. **Enable Gmail App Passwords** (if using Gmail):
   - Go to Google Account settings
   - Enable 2-factor authentication
   - Generate an app password
   - Use the app password in EMAIL_PASS

2. **Alternative Email Providers**:
   - Configure EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
   - Supports any SMTP provider

3. **Email Templates**:
   - Professional HTML templates
   - Responsive design
   - Consistent branding

## 🔄 Cron Jobs

The system includes automated cron jobs:
- **Daily Reminders**: 9 AM daily for upcoming deadlines
- **Hourly Checks**: Every hour for newly overdue tasks
- **Email Delivery**: Automatic email sending for all task events

## 📚 API Documentation

### Task Endpoints
- `GET /api/tasks` - Get all tasks (filtered by user permissions)
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### User Endpoints
- `GET /api/users` - Get all users (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Client Endpoints
- `GET /api/clients` - Get all clients (shared visibility)
- `POST /api/clients` - Create client
- `PATCH /api/clients/:id` - Update client
- `PATCH /api/clients/:id/status` - Update client status
- `DELETE /api/clients/:id` - Delete client

## 🛠️ Development

### Backend Development
- **Nodemon**: Automatic server restart on changes
- **Morgan**: Request logging
- **Advanced Middleware**: Security, rate limiting, error handling
- **Environment-based Configuration**: Development vs production settings

### Frontend Development
- **React with TypeScript**: Type-safe development
- **Material-UI**: Modern UI components
- **Redux Toolkit**: State management
- **React Router**: Navigation
- **Formik + Yup**: Form handling and validation

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support or questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for efficient task management**
