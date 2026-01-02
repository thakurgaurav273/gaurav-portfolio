# Lumina Studio Backend

Backend server for handling email notifications from the contact form.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

3. Configure your settings in `.env`:
   - **Email Settings:**
     - `MY_EMAIL`: Your email address (e.g., your-email@gmail.com)
     - `MY_PASSWORD`: Your email app password (for Gmail, generate an App Password)
     - For Gmail: Google Account → Security → 2-Step Verification → App passwords
   - **reCAPTCHA Settings:**
     - `SITE_KEY`: Your reCAPTCHA v3 site key (from Google reCAPTCHA console)
     - `SITE_SECRET_KEY`: Your reCAPTCHA v3 secret key
     - Get keys from: https://www.google.com/recaptcha/admin

4. Start the server:
```bash
npm run dev  # Development mode with auto-reload
# or
npm start    # Production mode
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `MY_EMAIL`: Your email address (used for sending emails)
- `MY_PASSWORD`: Your email app password
- `SITE_KEY`: reCAPTCHA v3 site key (for frontend)
- `SITE_SECRET_KEY`: reCAPTCHA v3 secret key (for backend verification)
- `SMTP_HOST`: SMTP server hostname (optional, defaults to smtp.gmail.com)
- `SMTP_PORT`: SMTP server port (optional, defaults to 587)
- `SMTP_SECURE`: Use secure connection (optional, defaults to false)

## API Endpoints

- `GET /health` - Health check
- `POST /api/contact` - Submit contact form
  - Body: `{ name: string, email: string, message: string }`

