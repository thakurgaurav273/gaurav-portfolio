# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Email Backend Setup

This project includes a backend server for handling email notifications from the contact form.

### Setup Steps:

1. **Navigate to the server directory:**
   ```sh
   cd server
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   ```sh
   cp env.example .env
   ```
   
   Edit `.env` and add your configuration:
   - **Email Settings:**
     - `MY_EMAIL`: Your email address (e.g., your-email@gmail.com)
     - `MY_PASSWORD`: Your email app password (for Gmail, generate an App Password)
     - Generate App Password: Google Account → Security → 2-Step Verification → App passwords
   - **reCAPTCHA Settings:**
     - `SITE_KEY`: Your reCAPTCHA v3 site key
     - `SITE_SECRET_KEY`: Your reCAPTCHA v3 secret key
     - Get keys from: https://www.google.com/recaptcha/admin

4. **Configure frontend reCAPTCHA:**
   
   Create a `.env` file in the root directory with:
   ```env
   VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
   VITE_API_URL=http://localhost:3001  # Optional: for production use your deployed backend URL
   ```

5. **Start the backend server:**
   ```sh
   npm run dev  # Development mode with auto-reload
   # or
   npm start    # Production mode
   ```

The backend will run on `http://localhost:3001` by default. The frontend is configured to proxy API requests to this server in development.

**Note:** Make sure to set `VITE_RECAPTCHA_SITE_KEY` in your frontend `.env` file for reCAPTCHA to work. For production, also set `VITE_API_URL` to your deployed backend URL.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
