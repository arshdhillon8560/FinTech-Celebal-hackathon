const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendAlertEmail = async (email, userName, alert) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured, skipping notification');
      return;
    }

    const transporter = createTransporter();

    const severityEmoji = {
      low: '🔵',
      medium: '🟡',
      high: '🔴',
      critical: '⚠️',
    };

    const typeNames = {
      spending_limit: 'Spending Limit',
      large_transaction: 'Large Transaction',
      unusual_activity: 'Unusual Activity',
      account_security: 'Account Security',
    };

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">SmartPay Alert</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-size: 48px;">${severityEmoji[alert.severity]}</span>
            <h2 style="color: #333; margin: 10px 0;">${typeNames[alert.type]} Alert</h2>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi ${userName},
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p style="color: #333; font-size: 16px; margin: 0; font-weight: 500;">
              ${alert.message}
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This alert was triggered on ${new Date(alert.createdAt).toLocaleDateString()} at ${new Date(alert.createdAt).toLocaleTimeString()}.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `SmartPay Alert: ${typeNames[alert.type]} Notification`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Alert email sent to ${email}`);
  } catch (error) {
    console.error('Email sending error:', error);
  }
};

const sendWelcomeEmail = async (email, userName) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured, skipping welcome email');
      return;
    }

    const transporter = createTransporter();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to SmartPay!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi ${userName},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Welcome to SmartPay! Your account has been successfully created with a starting balance of $1,000.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to SmartPay - Your Account is Ready!',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Welcome email sending error:', error);
  }
};

module.exports = {
  sendAlertEmail,
  sendWelcomeEmail,
};
