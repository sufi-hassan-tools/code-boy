import mongoose from 'mongoose';

const BlockedIpSchema = new mongoose.Schema(
  {
    ipAddress: { type: String, required: true, unique: true },
    reason: { type: String, required: true },
    blockedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'AdminRole', 
      required: true 
    },
    // Auto-block or manual block
    blockType: {
      type: String,
      enum: ['AUTO', 'MANUAL'],
      default: 'AUTO'
    },
    // Number of failed login attempts that led to this block
    failedAttempts: { type: Number, default: 0 },
    // Last failed attempt details
    lastAttempt: {
      email: { type: String },
      userAgent: { type: String },
      timestamp: { type: Date },
    },
    // Block status
    isActive: { type: Boolean, default: true },
    // Unblock information
    unblocked: {
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminRole' },
      at: { type: Date },
      reason: { type: String },
    },
  },
  { 
    timestamps: true,
    indexes: [
      { ipAddress: 1, isActive: 1 },
      { blockedBy: 1 },
    ]
  }
);

export default mongoose.model('BlockedIp', BlockedIpSchema);