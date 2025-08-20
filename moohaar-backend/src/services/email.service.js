import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: config.RESET_EMAIL,
      pass: config.RESET_PASS,
    },
  });
};

// Send email function
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!config.RESET_EMAIL || !config.RESET_PASS) {
      logger.warn({ message: 'Email service not configured' });
      return false;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Moohaar Admin" <${config.RESET_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const result = await transporter.sendMail(mailOptions);
    
    logger.info({ 
      message: 'Email sent successfully', 
      to, 
      subject,
      messageId: result.messageId 
    });
    
    return true;
  } catch (error) {
    logger.error({ 
      message: 'Failed to send email', 
      to, 
      subject,
      error: error.message 
    });
    return false;
  }
};

// Send admin invitation email
export const sendAdminInvitation = async (adminData, invitationToken, generatedPassword) => {
  const invitationLink = `${config.FRONTEND_URL}/admin/invitation/${invitationToken}`;
  const adminLoginUrl = `${config.FRONTEND_URL}/admin/${adminData.uniqueUrl}`;
  
  return sendEmail({
    to: adminData.email,
    subject: 'Welcome to Moohaar Admin Panel',
    html: `
      <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1C2B64 0%, #5272F2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #FBECB2; margin: 0; font-size: 28px; font-weight: 700;">
            Welcome to Moohaar
          </h1>
          <p style="color: #E2E9ED; margin: 10px 0 0 0; font-size: 16px;">
            Admin Panel Invitation
          </p>
        </div>
        
        <div style="padding: 40px 30px;">
          <p style="color: #072541; font-size: 16px; margin-bottom: 20px;">
            Hello <strong>${adminData.name}</strong>,
          </p>
          
          <p style="color: #072541; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            You have been invited to join the Moohaar admin team as a <strong style="color: #1C2B64;">${adminData.role}</strong>. 
            You now have access to manage various aspects of the platform.
          </p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #1C2B64; padding: 25px; margin: 30px 0; border-radius: 6px;">
            <h3 style="color: #1C2B64; margin: 0 0 15px 0; font-size: 18px;">Your Login Credentials:</h3>
            <p style="margin: 8px 0; color: #072541;"><strong>Email:</strong> ${adminData.email}</p>
            <p style="margin: 8px 0; color: #072541;"><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${generatedPassword}</code></p>
            <p style="margin: 8px 0; color: #072541;"><strong>Your Admin URL:</strong></p>
            <a href="${adminLoginUrl}" style="color: #1C2B64; text-decoration: none; font-weight: 600; word-break: break-all;">${adminLoginUrl}</a>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${invitationLink}" style="background: linear-gradient(135deg, #1C2B64 0%, #5272F2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(28, 43, 100, 0.3);">
              Accept Invitation & Setup Account
            </a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; margin: 30px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">
              <strong>⚠️ Important Security Notice:</strong><br>
              • This invitation expires in 24 hours<br>
              • Please change your password after first login<br>
              • Keep your admin URL private and secure<br>
              • Contact support if you encounter any issues
            </p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px 30px; border-top: 1px solid #e9ecef;">
          <p style="color: #6c757d; font-size: 12px; margin: 0; text-align: center;">
            This email was sent from the Moohaar Admin System. If you did not expect this invitation, please ignore this email or contact our support team.
          </p>
        </div>
      </div>
    `,
  });
};

export default { sendEmail, sendAdminInvitation };