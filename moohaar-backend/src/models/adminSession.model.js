import mongoose from 'mongoose';

const AdminSessionSchema = new mongoose.Schema(
  {
    adminId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'AdminRole', 
      required: true 
    },
    sessionToken: { type: String, required: true, unique: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    isActive: { type: Boolean, default: true },
    lastActivity: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    // Track if session was force logged out
    forcedLogout: {
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminRole' },
      reason: { type: String },
      at: { type: Date },
    },
  },
  { 
    timestamps: true,
    indexes: [
      { sessionToken: 1 },
      { adminId: 1, isActive: 1 },
      { expiresAt: 1 }, // For automatic cleanup
    ]
  }
);

// Automatically remove expired sessions
AdminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('AdminSession', AdminSessionSchema);