const mongoose = require('mongoose');
const validator = require('validator');

// Function to generate task code
const generateTaskCode = async function() {
  const lastTask = await this.constructor.findOne({}, {}, { sort: { 'createdAt' : -1 } });
  const lastNumber = lastTask && lastTask.taskCode ? parseInt(lastTask.taskCode.substring(1)) : 0;
  return `T${(lastNumber + 1).toString().padStart(4, '0')}`;
};

const taskSchema = new mongoose.Schema({
  taskCode: {
    type: String,
    unique: true,
    required: true,
    default: 'T0001'
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'At least one assignee is required']
  }],
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Please select a client']
  },
  labels: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add text index for search functionality
taskSchema.index({ title: 'text', description: 'text' });

// Add a pre-save hook to generate task code and validate due date
taskSchema.pre('save', async function(next) {
  // Only generate task code for new documents
  if (this.isNew) {
    this.taskCode = await generateTaskCode.call(this);
  }
  
  // Validate due date
  if (this.dueDate && this.dueDate < Date.now()) {
    this.status = 'overdue';
  }
  
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
