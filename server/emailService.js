import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';


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
                This email was sent from your Gaurav Singh portfolio contact form
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
                Gaurav Singh
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


export async function sendContactEmail({ name, email, message }) {
  const ownerEmail = process.env.MY_EMAIL || process.env.OWNER_EMAIL || process.env.SMTP_USER;
  
  if (!ownerEmail) {
    console.warn('MY_EMAIL not configured, using a fallback for contact email (might fail if not verified).');
  }

  return resend.emails.send({
    from: `"Gaurav Singh Portfolio" <${fromEmail}>`,
    to: [ownerEmail || fromEmail],
    subject: `New Contact Form: ${name} (${email})`,
    html: getOwnerEmailTemplate({ name, email, message }),
  });
}


export async function sendConfirmationEmail({ name, email }) {
  return resend.emails.send({
    from: `"Gaurav Singh" <${fromEmail}>`,
    to: [email],
    subject: 'Message Received - Gaurav Singh',
    html: getConfirmationEmailTemplate({ name }),
  });
}


export async function sendPasswordResetEmail(email, resetLink) {
  return resend.emails.send({
    from: `"Portfolio Admin" <${fromEmail}>`,
    to: [email],
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

