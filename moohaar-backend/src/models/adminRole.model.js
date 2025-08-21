import mongoose from 'mongoose';

const AdminRoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['owner_admin', 'super_admin', 'admin', 'manager', 'editor'],
      required: true,
    },
    // Unique URL for login (e.g., /ahmed/admin/hhf2703hg25)
    uniqueUrl: { type: String, unique: true, sparse: true },
    // Status for super admin approval
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended', 'blocked'],
      default: 'pending',
    },
    // Creator reference (who created this admin)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminRole' },
    // Approved by reference (which owner/super admin approved)
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminRole' },
    approvedAt: { type: Date },
    
    // Custom permissions system
    permissions: {
      // Theme Management
      themes: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        publish: { type: Boolean, default: false },
      },
      // User Management
      users: {
        view: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        suspend: { type: Boolean, default: false },
      },
      // Store Management
      stores: {
        view: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        suspend: { type: Boolean, default: false },
      },
      // Analytics
      analytics: {
        view: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
        advanced: { type: Boolean, default: false },
      },
      // Admin Management
      adminManagement: {
        viewAdmins: { type: Boolean, default: false },
        createAdmins: { type: Boolean, default: false },
        editAdmins: { type: Boolean, default: false },
        deleteAdmins: { type: Boolean, default: false },
        manageRoles: { type: Boolean, default: false },
        approveAdmins: { type: Boolean, default: false },
      },
      // System Settings
      system: {
        viewSettings: { type: Boolean, default: false },
        editSettings: { type: Boolean, default: false },
        viewAuditLogs: { type: Boolean, default: false },
        manageBlacklist: { type: Boolean, default: false },
      },
      // Add-ons Management
      addons: {
        view: { type: Boolean, default: false },
        upload: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
      },
    },
    
    // 2FA Settings
    twoFactorAuth: {
      enabled: { type: Boolean, default: false },
      secret: { type: String },
      lastOtpUsed: { type: String },
      otpExpiry: { type: Date },
    },
    
    // Session Management
    sessionTimeout: { type: Number, default: 7200000 }, // 2 hours in milliseconds
    lastLogin: { type: Date },
    lastActivity: { type: Date },
    isOnline: { type: Boolean, default: false },
    
    // Security
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    ipAddresses: [{ type: String }], // Track login IPs
    
    // Reset tokens
    resetTokenHash: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { 
    timestamps: true,
    // Add indexes for performance
    indexes: [
      { email: 1 },
      { uniqueUrl: 1 },
      { role: 1, status: 1 },
      { createdBy: 1 },
    ]
  }
);

// Virtual for checking if account is locked
AdminRoleSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to handle owner admin logic
AdminRoleSchema.pre('save', async function(next) {
  // If this is the first owner admin (SUFI Hassan ms), auto-approve
  if (this.role === 'owner_admin' && this.name === 'SUFI Hassan ms') {
    const ownerCount = await this.constructor.countDocuments({ role: 'owner_admin', status: 'approved' });
    if (ownerCount === 0) {
      this.status = 'approved';
      this.approvedAt = new Date();
      this.approvedBy = this._id;
    }
  }
  next();
});

// Methods for account locking
AdminRoleSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts (permanent lock)
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)) }; // Lock for 1 year (permanent)
  }
  
  return this.updateOne(updates);
};

// Generate unique URL for admin login
AdminRoleSchema.methods.generateUniqueUrl = function() {
  const name = this.name.toLowerCase().replace(/\s+/g, '');
  const role = this.role.replace('_', '');
  const random = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15) +
                 Math.random().toString(16).substring(2, 8);
  
  return `${name}/${role}/${random}`;
};

export default mongoose.model('AdminRole', AdminRoleSchema);