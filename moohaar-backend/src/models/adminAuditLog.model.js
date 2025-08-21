import mongoose from 'mongoose';

const AdminAuditLogSchema = new mongoose.Schema(
  {
    adminId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'AdminRole', 
      required: true 
    },
    action: { type: String, required: true }, // e.g., 'THEME_UPLOAD', 'USER_DELETE', 'ADMIN_CREATE'
    category: {
      type: String,
      enum: ['THEME', 'USER', 'STORE', 'ADMIN', 'SYSTEM', 'ADDON', 'AUTH'],
      required: true
    },
    description: { type: String, required: true },
    
    // Target information (what was affected)
    target: {
      type: { type: String }, // 'user', 'store', 'theme', 'admin', etc.
      id: { type: String }, // ID of the affected resource
      name: { type: String }, // Name/title of the affected resource
    },
    
    // Additional metadata
    metadata: { type: mongoose.Schema.Types.Mixed },
    
    // Request information
    ipAddress: { type: String },
    userAgent: { type: String },
    
    // Status of the action
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'SUCCESS'
    },
    
    // Error information if action failed
    error: { type: String },
    
    // Severity level
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
  },
  { 
    timestamps: { createdAt: true, updatedAt: false },
    indexes: [
      { adminId: 1, createdAt: -1 },
      { category: 1, createdAt: -1 },
      { action: 1, createdAt: -1 },
      { 'target.type': 1, 'target.id': 1 },
      { severity: 1, createdAt: -1 },
    ]
  }
);

// TTL index to automatically remove old audit logs after 2 years
AdminAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

export default mongoose.model('AdminAuditLog', AdminAuditLogSchema);