# 🔐 Moohaar Super Admin Authentication System

A comprehensive, enterprise-grade admin authentication and management system for the Moohaar platform.

## 🏗️ System Architecture

### Role Hierarchy
```
Owner Admin (SUFI Hassan ms)
    ├── Super Admin (up to 5 total)
    ├── Admin
    ├── Manager
    └── Editor
```

### Key Features
- **Hierarchical Role System**: 5-tier admin structure with granular permissions
- **Two-Factor Authentication**: Email-based OTP for all admin access
- **Unique URL Generation**: Each admin gets a unique, secure login URL
- **IP Blocking & Security**: Permanent IP blocks with owner admin override
- **Real-time Activity Monitoring**: 30-day timeline + live activity tracking
- **Session Management**: Role-based timeouts with force logout capability
- **Comprehensive Audit Logging**: All admin actions logged with metadata

## 🚀 Getting Started

### 1. Owner Admin Registration
**URL**: `https://moohaar.com/sufimoohaaradmin`

- Only "SUFI Hassan ms" can register as owner admin
- One-time registration process
- Automatically gets full permissions
- First owner admin auto-approved

### 2. Super Admin Registration
**URL**: `https://moohaar.com/sufimoohaaradmin`

- Up to 5 super admins total (including owner admin)
- Requires owner admin approval
- Email notification sent to owner admin
- Custom permissions can be set during approval

### 3. Admin Login Process
1. Enter email and password
2. Receive 8-character OTP via email
3. Enter OTP within 10 minutes
4. Redirected to role-specific dashboard

## 🔧 Technical Implementation

### Database Models

#### AdminRole Model
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  role: ['owner_admin', 'super_admin', 'admin', 'manager', 'editor'],
  uniqueUrl: String (unique),
  status: ['pending', 'approved', 'suspended', 'blocked'],
  permissions: {
    themes: { view, create, edit, delete, publish },
    users: { view, edit, delete, suspend },
    stores: { view, edit, delete, suspend },
    analytics: { view, export, advanced },
    adminManagement: { viewAdmins, createAdmins, editAdmins, deleteAdmins, manageRoles, approveAdmins },
    system: { viewSettings, editSettings, viewAuditLogs, manageBlacklist },
    addons: { view, upload, edit, delete, approve }
  },
  twoFactorAuth: {
    enabled: Boolean,
    secret: String,
    lastOtpUsed: String,
    otpExpiry: Date
  },
  sessionTimeout: Number,
  lastLogin: Date,
  lastActivity: Date,
  isOnline: Boolean
}
```

#### AdminSession Model
```javascript
{
  adminId: ObjectId,
  sessionToken: String (unique),
  ipAddress: String,
  userAgent: String,
  isActive: Boolean,
  lastActivity: Date,
  expiresAt: Date,
  forcedLogout: {
    by: ObjectId,
    reason: String,
    at: Date
  }
}
```

#### AdminAuditLog Model
```javascript
{
  adminId: ObjectId,
  action: String,
  category: ['THEME', 'USER', 'STORE', 'ADMIN', 'SYSTEM', 'ADDON', 'AUTH'],
  description: String,
  target: {
    type: String,
    id: String,
    name: String
  },
  metadata: Mixed,
  ipAddress: String,
  userAgent: String,
  status: ['SUCCESS', 'FAILED', 'PENDING'],
  severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
}
```

#### BlockedIp Model
```javascript
{
  ipAddress: String (unique),
  reason: String,
  blockedBy: ObjectId,
  blockType: ['AUTO', 'MANUAL'],
  failedAttempts: Number,
  isActive: Boolean,
  unblocked: {
    by: ObjectId,
    at: Date,
    reason: String
  }
}
```

### API Endpoints

#### Authentication
```
POST /api/super-admin/auth/owner-admin/register  # Owner admin registration
POST /api/super-admin/auth/super-admin/register  # Super admin registration
POST /api/super-admin/auth/login                 # Admin login with 2FA
GET  /api/super-admin/auth/me                    # Get current admin info
POST /api/super-admin/auth/logout                # Admin logout
```

#### Admin Management
```
POST /api/super-admin/management/approve/:adminId      # Approve super admin
GET  /api/super-admin/management/pending-approvals    # Get pending approvals
POST /api/super-admin/management/create               # Create new admin
GET  /api/super-admin/management/all                  # Get all admins
PUT  /api/super-admin/management/permissions/:adminId # Update permissions
POST /api/super-admin/management/force-logout/:adminId # Force logout
DELETE /api/super-admin/management/:adminId           # Delete/suspend admin
GET  /api/super-admin/management/activity/:adminId    # Get admin activity
```

#### Security Management
```
GET  /api/super-admin/security/blocked-ips        # Get blocked IPs
POST /api/super-admin/security/block-ip           # Block IP address
POST /api/super-admin/security/unblock-ip/:ipId   # Unblock IP (owner only)
GET  /api/super-admin/security/audit-logs         # Get audit logs
GET  /api/super-admin/security/stats              # Get system statistics
GET  /api/super-admin/security/real-time-activity # Get real-time activity
```

## 🔐 Security Features

### Two-Factor Authentication
- Email-based OTP system
- 8-character alphanumeric codes
- 10-minute expiry
- One-time use only
- Automatic resend capability

### IP Blocking
- Automatic blocking after 5 failed login attempts
- Permanent blocks (requires owner admin to unblock)
- Manual IP blocking by authorized admins
- Real-time session termination for blocked IPs

### Session Management
- Role-based session timeouts:
  - Owner Admin: 4 hours
  - Super Admin: 2 hours
  - Admin: 2 hours
  - Manager: 2 hours
  - Editor: 2 hours
- Force logout capability
- Session activity tracking
- Automatic cleanup of expired sessions

### Audit Logging
- All admin actions logged with:
  - Timestamp and duration
  - IP address and user agent
  - Target resource information
  - Metadata and context
  - Success/failure status
  - Severity level
- 2-year retention policy
- Real-time activity monitoring
- Comprehensive search and filtering

## 🎛️ Permission System

### Categories
1. **Theme Management**: Upload, edit, delete, publish themes
2. **User Management**: View, edit, delete, suspend user accounts
3. **Store Management**: View, edit, delete, suspend merchant stores
4. **Analytics**: View reports, export data, advanced analytics
5. **Admin Management**: Create, edit, delete admins, manage roles
6. **System Settings**: View/edit settings, audit logs, IP management
7. **Add-ons Management**: Upload, edit, approve platform add-ons

### Permission Matrix
Each permission category has granular controls:
- **View**: Read-only access
- **Create/Upload**: Add new items
- **Edit**: Modify existing items
- **Delete**: Remove items
- **Advanced**: Special permissions (publish, suspend, etc.)

### Role Presets
- **Super Admin**: Full access except owner-only functions
- **Admin**: Most permissions, limited delete/suspend rights
- **Manager**: Content management, limited user access
- **Editor**: Content editing only, no administrative access

## 🌐 Frontend Components

### Pages
- `OwnerAdminRegister.jsx`: Owner admin registration
- `OwnerAdminLogin.jsx`: Two-step login with OTP
- `OwnerAdminDashboard.jsx`: Main dashboard with all features

### Components
- `PermissionMatrix.jsx`: Interactive permission management
- `ActivityTimeline.jsx`: Real-time activity monitoring

### Features
- Responsive design with Tailwind CSS
- Real-time updates every 30 seconds
- Progressive loading with React.Suspense
- Form validation and error handling
- Success/error notifications

## 🔧 Environment Variables

Add these to your `.env` file:

```env
# Email Configuration (for OTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@moohaar.com

# Frontend URL (for email links)
FRONTEND_URL=https://moohaar.com

# JWT Secret (ensure it's secure)
JWT_SECRET=your_super_secure_jwt_secret

# MongoDB URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moohaar

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

## 📊 Monitoring & Analytics

### System Statistics
- Total admins by role
- Online/offline status
- Login success/failure rates
- IP blocking statistics
- Session activity metrics

### Real-time Monitoring
- Live admin activity feed
- Current online admins
- Recent login attempts
- System security events
- Performance metrics

### Audit Trail
- Complete action history
- Admin behavior patterns
- Security incident tracking
- Compliance reporting
- Data export capabilities

## 🚀 Deployment

### Production Checklist
- [ ] Set secure JWT_SECRET
- [ ] Configure email SMTP settings
- [ ] Set up MongoDB with proper indexes
- [ ] Configure Redis for session storage
- [ ] Set up SSL certificates
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts
- [ ] Test all security features
- [ ] Backup and recovery procedures
- [ ] Documentation for operations team

### Scaling Considerations
- Horizontal scaling with load balancers
- Database sharding for large datasets
- Redis clustering for session storage
- CDN for static assets
- Monitoring and alerting systems
- Automated backup strategies

## 🔍 Troubleshooting

### Common Issues

**OTP Not Received**
- Check email configuration
- Verify SMTP settings
- Check spam folder
- Ensure email service is running

**Login Failures**
- Check IP blocking status
- Verify account approval status
- Check session timeout settings
- Review audit logs for errors

**Permission Issues**
- Verify role hierarchy
- Check permission matrix
- Review admin creation process
- Validate JWT token

### Support Commands

```bash
# Check admin status
db.adminroles.find({email: "admin@example.com"})

# Unblock IP manually
db.blockedips.updateOne({ipAddress: "192.168.1.1"}, {$set: {isActive: false}})

# Reset admin password (requires manual hash)
db.adminroles.updateOne({email: "admin@example.com"}, {$set: {passwordHash: "new_hash"}})

# View recent activity
db.adminauditlogs.find().sort({createdAt: -1}).limit(10)
```

## 📝 License

This super admin system is part of the Moohaar platform and follows the same licensing terms.

---

**🔒 Security Notice**: This system handles sensitive administrative functions. Always follow security best practices, keep dependencies updated, and monitor for security vulnerabilities.

**📞 Support**: For technical support or security concerns, contact the development team immediately.