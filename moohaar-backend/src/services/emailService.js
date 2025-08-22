import nodemailer from 'nodemailer';
import config from '../config/index.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // or your preferred email service
      auth: {
        user: config.EMAIL_USER || process.env.EMAIL_USER,
        pass: config.EMAIL_PASS || process.env.EMAIL_PASS,
      },
    });
  }

  // Generate 8-character OTP
  generateOTP() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let otp = '';
    for (let i = 0; i < 8; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return otp;
  }

  // Send OTP email for 2FA
  async sendOTP(email, otp, adminName) {
    const mailOptions = {
      from: config.EMAIL_FROM || process.env.EMAIL_FROM || 'noreply@moohaar.com',
      to: email,
      subject: 'Moohaar Admin - Your Login OTP',
      html: `
        <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #1C2B64; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🟦 Moohaar Admin</h1>
            <p style="margin: 10px 0 0 0; color: #FBECB2; font-size: 16px;">Secure Admin Access</p>
          </div>
          
          <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1C2B64; margin-top: 0;">Hello ${adminName},</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Your One-Time Password (OTP) for secure login to Moohaar Admin Panel:
            </p>
            
            <div style="background-color: #f8f9fa; border: 2px solid #1C2B64; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; font-weight: 700; color: #1C2B64; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong><br>
                • This OTP is valid for 10 minutes only<br>
                • Never share this code with anyone<br>
                • If you didn't request this, contact the Owner Admin immediately
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This is an automated message from Moohaar Admin Security System.<br>
              Generated on: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      // Removed console.error for production
      return { success: false, error: error.message };
    }
  }

  // Send super admin approval notification
  async sendApprovalNotification(ownerEmail, newAdminName, newAdminEmail, newAdminRole) {
    const mailOptions = {
      from: config.EMAIL_FROM || process.env.EMAIL_FROM || 'noreply@moohaar.com',
      to: ownerEmail,
      subject: 'Moohaar Admin - New Super Admin Approval Required',
      html: `
        <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #1C2B64; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🟦 Moohaar Admin</h1>
            <p style="margin: 10px 0 0 0; color: #FBECB2; font-size: 16px;">Approval Required</p>
          </div>
          
          <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1C2B64; margin-top: 0;">New Super Admin Registration</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              A new super admin has registered and requires your approval:
            </p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #1C2B64; padding: 20px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #333;"><strong>Name:</strong> ${newAdminName}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Email:</strong> ${newAdminEmail}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Role:</strong> ${newAdminRole}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; margin-bottom: 20px;">Please log in to your Owner Admin dashboard to approve or reject this request.</p>
              <a href="${config.FRONTEND_URL || 'https://moohaar.com'}/sufimoohaaradmin" 
                 style="background-color: #1C2B64; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Review Request
              </a>
            </div>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      // Removed console.error for production
      return { success: false, error: error.message };
    }
  }

  // Send admin credentials to new admin
  async sendAdminCredentials(adminEmail, adminName, uniqueUrl, temporaryPassword) {
    const loginUrl = `${config.FRONTEND_URL || 'https://moohaar.com'}/${uniqueUrl}`;
    
    const mailOptions = {
      from: config.EMAIL_FROM || process.env.EMAIL_FROM || 'noreply@moohaar.com',
      to: adminEmail,
      subject: 'Welcome to Moohaar Admin - Your Access Details',
      html: `
        <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #1C2B64; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🟦 Welcome to Moohaar Admin</h1>
            <p style="margin: 10px 0 0 0; color: #FBECB2; font-size: 16px;">Your Admin Access is Ready</p>
          </div>
          
          <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1C2B64; margin-top: 0;">Hello ${adminName},</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              You have been granted admin access to the Moohaar platform. Here are your login details:
            </p>
            
            <div style="background-color: #f8f9fa; border: 2px solid #1C2B64; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #333;"><strong>Your Unique Login URL:</strong></p>
              <a href="${loginUrl}" style="color: #1C2B64; font-weight: 600; word-break: break-all;">${loginUrl}</a>
              
              <p style="margin: 15px 0 5px 0; color: #333;"><strong>Email:</strong> ${adminEmail}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 2px 4px; border-radius: 3px;">${temporaryPassword}</code></p>
            </div>
            
            <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460; font-size: 14px;">
                <strong>🔐 Important Security Steps:</strong><br>
                1. Change your password immediately after first login<br>
                2. Enable two-factor authentication<br>
                3. Keep your unique login URL secure and private<br>
                4. Never share your credentials with anyone
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background-color: #1C2B64; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Login Now
              </a>
            </div>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      // Removed console.error for production
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();