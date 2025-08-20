import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'manager', 'editor'],
      default: 'editor',
    },
    permissions: {
      themeManagement: { type: Boolean, default: false },
      addonManagement: { type: Boolean, default: false },
      userManagement: { type: Boolean, default: false },
      storeManagement: { type: Boolean, default: false },
      analyticsAccess: { type: Boolean, default: false },
      systemSettings: { type: Boolean, default: false },
    },
    uniqueUrl: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    lastLogin: { type: Date },
    resetTokenHash: { type: String },
    resetTokenExpiry: { type: Date },
    invitationToken: { type: String },
    invitationExpiry: { type: Date },
    isInvitationAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
AdminSchema.index({ email: 1 });
AdminSchema.index({ uniqueUrl: 1 });
AdminSchema.index({ role: 1 });
AdminSchema.index({ isActive: 1 });

export default mongoose.model('Admin', AdminSchema);
