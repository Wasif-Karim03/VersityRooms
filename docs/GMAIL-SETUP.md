# Gmail SMTP Setup Guide

This guide explains how to configure Gmail SMTP to send verification codes and email notifications from your company email address.

## Step 1: Enable 2-Step Verification

Gmail requires 2-Step Verification to generate App Passwords. If you haven't enabled it:

1. Go to your Google Account: https://myaccount.google.com
2. Click **Security** on the left sidebar
3. Under "Signing in to Google", find **2-Step Verification**
4. Click it and follow the prompts to enable 2-Step Verification

## Step 2: Generate App Password

1. Go to your Google Account: https://myaccount.google.com
2. Click **Security** on the left sidebar
3. Under "Signing in to Google", find **App passwords**
   - If you don't see this option, make sure 2-Step Verification is enabled first
4. Select **Mail** as the app
5. Select **Other (Custom name)** as the device
6. Enter a name like "Room Booking System"
7. Click **Generate**
8. **Copy the 16-character password** that appears (you won't see it again!)
   - It will look like: `abcd efgh ijkl mnop`

## Step 3: Set Environment Variables

Create or update your `.env` file in the project root with:

```env
# Gmail SMTP Configuration
GMAIL_EMAIL=your-company-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Important Notes:**
- `GMAIL_EMAIL`: Your full Gmail address (the company email)
- `GMAIL_APP_PASSWORD`: The 16-character App Password from Step 2 (remove spaces if any)
- Never commit these credentials to git! The `.env` file is already in `.gitignore`

## Step 4: Restart Your Development Server

After adding the environment variables:

```bash
# Stop your current server (Ctrl+C)
# Then restart it
npm run dev
```

## Testing

1. Go to the login page: http://localhost:3000/login
2. Enter an email address and select a role
3. Click "Send Verification Code"
4. Check the email inbox for the verification code
5. Check your server console - you should see: `✅ Email sent successfully to [email]`

## Troubleshooting

### "Gmail credentials not configured" warning
- Make sure `.env` file exists in the project root
- Verify `GMAIL_EMAIL` and `GMAIL_APP_PASSWORD` are set correctly
- Restart the development server after adding environment variables

### "Invalid login" error
- Double-check your App Password (copy it again from Google Account)
- Make sure you're using the App Password, not your regular Gmail password
- Verify 2-Step Verification is enabled

### "Less secure app access" error
- This shouldn't happen with App Passwords, but if it does:
  - Make sure you're using an App Password, not your regular password
  - Verify 2-Step Verification is enabled

### Emails going to spam
- This is common with Gmail SMTP from applications
- Users should check their spam folder
- For production, consider using a service like SendGrid or AWS SES for better deliverability

## Production Considerations

For production deployment (Vercel, Railway, etc.):

1. Add the same environment variables in your hosting platform's dashboard
2. Make sure `GMAIL_EMAIL` and `GMAIL_APP_PASSWORD` are set in the environment variables section
3. Restart/redeploy your application

**Note:** Gmail has sending limits:
- 500 emails per day for free Gmail accounts
- 2000 emails per day for Google Workspace accounts

For higher volumes, consider using a professional email service like SendGrid, AWS SES, or Mailgun.

