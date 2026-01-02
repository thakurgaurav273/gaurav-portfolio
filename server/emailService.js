import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.MY_EMAIL || process.env.SMTP_USER,
    pass: process.env.MY_PASSWORD || process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Email templates
const getOwnerEmailTemplate = ({ name, email, message }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); border: 1px solid rgba(132, 87, 234, 0.2);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);">
                💬 New Contact Form Submission
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; background: #1a1a2e;">
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                  You received a new message from your portfolio
                </h2>
                
                <div style="background: #252541; border-left: 4px solid #7c3aed; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                  <p style="margin: 0 0 12px 0; color: #a0a0c0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                    FROM
                  </p>
                  <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                    ${escapeHtml(name)}
                  </p>
                  <p style="margin: 8px 0 0 0; color: #7c3aed; font-size: 16px;">
                    ${escapeHtml(email)}
                  </p>
                </div>
                
                <div style="background: #252541; border-left: 4px solid #a855f7; padding: 20px; border-radius: 8px;">
                  <p style="margin: 0 0 12px 0; color: #a0a0c0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                    MESSAGE
                  </p>
                  <p style="margin: 0; color: #e0e0e0; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
                    ${escapeHtml(message)}
                  </p>
                </div>
              </div>
              
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid rgba(132, 87, 234, 0.2);">
                <a href="mailto:${escapeHtml(email)}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);">
                  Reply via Email
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background: #141428; text-align: center; border-top: 1px solid rgba(132, 87, 234, 0.1);">
              <p style="margin: 0; color: #6b7280; font-size: 13px;">
                This email was sent from your Lumina Studio portfolio contact form
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getConfirmationEmailTemplate = ({ name }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); border: 1px solid rgba(132, 87, 234, 0.2);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);">
                ✨ Message Received!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; background: #1a1a2e;">
              <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 22px; font-weight: 600;">
                Hi ${escapeHtml(name)},
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
                Thank you for reaching out! I've received your message and will get back to you within 24 hours.
              </p>
              
              <p style="margin: 0 0 30px 0; color: #a0a0c0; font-size: 15px; line-height: 1.6;">
                I'm excited to hear about your project or ideas. In the meantime, feel free to explore more of my work on my portfolio.
              </p>
              
              <div style="background: #252541; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; margin-bottom: 30px;">
                <p style="margin: 0; color: #7c3aed; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                  What's Next?
                </p>
                <p style="margin: 0; color: #e0e0e0; font-size: 15px; line-height: 1.6;">
                  I typically respond within 24 hours. If your inquiry is urgent, please don't hesitate to reach out directly via email.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background: #141428; text-align: center; border-top: 1px solid rgba(132, 87, 234, 0.1);">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 15px; font-weight: 600;">
                Lumina Studio
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 13px;">
                Building amazing experiences, one project at a time
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Send email to owner
export async function sendContactEmail({ name, email, message }) {
  const ownerEmail = process.env.MY_EMAIL || process.env.OWNER_EMAIL || process.env.SMTP_USER;
  const fromEmail = process.env.MY_EMAIL || process.env.SMTP_USER;
  
  if (!ownerEmail) {
    throw new Error('MY_EMAIL or OWNER_EMAIL not configured');
  }

  const mailOptions = {
    from: `"Lumina Studio Portfolio" <${fromEmail}>`,
    to: ownerEmail,
    subject: `New Contact Form: ${name} (${email})`,
    html: getOwnerEmailTemplate({ name, email, message }),
    text: `New Contact Form Submission\n\nFrom: ${name} (${email})\n\nMessage:\n${message}`,
  };

  return transporter.sendMail(mailOptions);
}

// Send confirmation email to sender
export async function sendConfirmationEmail({ name, email }) {
  const fromEmail = process.env.MY_EMAIL || process.env.SMTP_USER;
  
  const mailOptions = {
    from: `"Lumina Studio" <${fromEmail}>`,
    to: email,
    subject: 'Message Received - Lumina Studio',
    html: getConfirmationEmailTemplate({ name }),
    text: `Hi ${name},\n\nThank you for reaching out! I've received your message and will get back to you within 24 hours.\n\nBest regards,\nLumina Studio`,
  };

  return transporter.sendMail(mailOptions);
}

