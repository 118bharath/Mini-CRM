const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer / company name is required'],
      trim: true,
      maxlength: [200, 'Customer name cannot exceed 200 characters'],
    },
    contactName: {
      type: String,
      trim: true,
      maxlength: [100, 'Contact name cannot exceed 100 characters'],
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid contact email'],
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      maxlength: [30, 'Phone number cannot exceed 30 characters'],
      default: '',
    },
    requirement: {
      type: String,
      required: [true, 'Requirement summary is required'],
      trim: true,
      maxlength: [1000, 'Requirement summary cannot exceed 1000 characters'],
    },
    estimatedValue: {
      type: Number,
      min: [0, 'Estimated value must be non-negative'],
      default: 0,
    },
    stage: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'],
        message: 'Stage must be one of: New, Contacted, Qualified, Proposal Sent, Won, Lost',
      },
      default: 'New',
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be one of: Low, Medium, High',
      },
      default: 'Medium',
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Index for performance on common queries
opportunitySchema.index({ owner: 1, createdAt: -1 });
opportunitySchema.index({ stage: 1 });
opportunitySchema.index({ priority: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
