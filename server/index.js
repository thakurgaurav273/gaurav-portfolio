import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendContactEmail, sendConfirmationEmail } from './emailService.js';
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import { prisma } from './lib/prisma.js';
import { ContactRejected, clientIp, markSubmission, pruneSubmissions, recordSubmission, screenContact } from './lib/contactGuard.js';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
// Behind Vercel's proxy; needed so req.ip is the visitor, not the proxy.
app.set('trust proxy', true);
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);


app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Touches the database so Neon's compute stays awake; pinged on a schedule by .github/workflows/keep-db-warm.yml.
app.get('/api/health/db', async (req, res) => {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.set('Cache-Control', 'no-store').json({ status: 'ok', ms: Date.now() - started });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({ status: 'error' });
  }
});

app.post('/api/contact', async (req, res) => {
  let submission;
  try {
    submission = await screenContact(req.body, clientIp(req));
  } catch (error) {
    if (!(error instanceof ContactRejected)) {
      console.error('Contact screening error:', error);
      return res.status(500).json({ success: false, error: 'Something went wrong. Please try again later.' });
    }
    // Bots tripping the honeypot or time trap get a normal-looking success.
    if (error.silent) return res.json({ success: true, message: 'Email sent successfully' });
    return res.status(error.status).json({ success: false, error: error.message });
  }

  const { sendConfirmation, ...data } = submission;
  const record = await recordSubmission(data);
  pruneSubmissions().catch(() => {});

  try {
    await sendContactEmail(data);
    await markSubmission(record.id, { emailSent: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ success: false, error: 'Failed to send email. Please try again later.' });
  }

  if (sendConfirmation) {
    try {
      await sendConfirmationEmail(data);
      await markSubmission(record.id, { confirmationSent: true });
    } catch (error) {
      // The owner already has the message; a failed courtesy email shouldn't fail the request.
      console.error('Error sending confirmation email:', error);
    }
  }

  res.json({ success: true, message: 'Email sent successfully' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
