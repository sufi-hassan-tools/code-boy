# Email Configuration Setup Instructions

## For Gmail App Password Setup

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the steps to enable 2FA if not already enabled

### Step 2: Generate App Password
1. In Google Account settings, go to "Security"
2. Under "Signing in to Google", click on "App passwords"
3. Select "Mail" for the app type
4. Select "Other (custom name)" for device type
5. Enter "Moohaar Backend" as the custom name
6. Click "Generate"
7. Copy the 16-character app password (format: xxxx xxxx xxxx xxxx)

### Step 3: Configure Environment Variables

#### For moohaar-backend (.env file):
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env file with your details:
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=noreply@moohaar.com
```

#### For server (.env file):
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env file with your details:
RESET_EMAIL=your-gmail-address@gmail.com
RESET_PASS=your-16-character-app-password
```

### Step 4: Test Email Functionality
1. Start both servers
2. Try the forgot password functionality
3. Check if OTP emails are being sent for admin login

## Registration URLs

### Owner Admin Registration (SUFI Hassan ms only):
- URL: `http://localhost:5173/sufimoohaaradmin`
- This is for the platform owner only

### Super Admin Registration (requires approval):
- URL: `http://localhost:5173/super-admin/register`
- Requires approval from Owner Admin

### Regular Admin Registration (unique URL):
- URL: `http://localhost:5173/admin/register/{secret}`
- Replace `{secret}` with the generated admin secret
- Current secret: `ab1301f5dd512ac85a1d344d672f8de7bf472c718c55e34d`
- Full URL: `http://localhost:5173/admin/register/ab1301f5dd512ac85a1d344d672f8de7bf472c718c55e34d`

## Troubleshooting

### Email Not Sending:
1. Verify app password is correct (16 characters, no spaces)
2. Check that 2FA is enabled on your Google account
3. Ensure EMAIL_USER is the full Gmail address
4. Check server logs for specific error messages

### Registration Form Not Showing:
1. Verify you're using the correct URL with the secret
2. Check browser console for any JavaScript errors
3. Ensure the backend server is running

### Common Issues:
- **535 Authentication failed**: Wrong app password or 2FA not enabled
- **Invalid URL**: Check that the secret matches the generated one
- **Registration failed**: Check backend logs for specific validation errors