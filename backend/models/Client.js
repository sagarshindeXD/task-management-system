const mongoose = require('mongoose');
const validator = require('validator');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Client name cannot be more than 100 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a virtual field for the client's full address
clientSchema.virtual('fullAddress').get(function() {
  return [
    this.address?.street,
    this.address?.city,
    this.address?.state,
    this.address?.postalCode,
    this.address?.country
  ].filter(Boolean).join(', ');
});

// Add text index for search
clientSchema.index({ 
  name: 'text', 
  email: 'text',
  'address.street': 'text',
  'address.city': 'text',
  'address.state': 'text',
  'address.country': 'text'
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
