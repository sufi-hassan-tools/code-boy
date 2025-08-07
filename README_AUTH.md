# Authentication System Documentation

This document describes the full authentication system that has been added to the Code Boy repository.

## Overview

The authentication system provides:
- User registration (signup) with email and password
- User login with JWT token authentication
- Protected dashboard area
- Store creation functionality
- Forgot password with email reset links
- Password reset functionality

## Backend Implementation

### Models

#### User Model (`server/models/User.js`)
- `email`: Unique email address
- `password`: Bcrypt hashed password
- `storeCreated`: Boolean flag for store creation status

#### Store Model (`server/models/Store.js`)
- `user`: Reference to User model
- `storeName`: Name of the store
- `storeEmail`: Store contact email
- `storePhone`: Store phone number
- `storeWhatsapp`: WhatsApp number
- `storeCity`: Store location
- `storeAddress`: Full store address
- `businessCategory`: Category of business

### API Routes

#### Authentication Routes (`/api/auth`)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

#### Store Routes (`/api/store`)
- `POST /api/store/create` - Create new store (protected)

#### Password Reset Routes (`/api/password`)
- `POST /api/password/forgot-password` - Send reset email
- `POST /api/password/reset-password/:token` - Reset password with token

### Middleware

- JWT authentication middleware for protecting routes
- CORS enabled for frontend-backend communication

## Frontend Implementation

### Pages Created

1. **Login Page** (`/login`)
   - Email and password form
   - Links to signup and forgot password
   - JWT token storage on successful login

2. **Signup Page** (`/signup`)
   - Email, password, and confirm password form
   - Password validation
   - Automatic login after successful registration

3. **Dashboard Page** (`/dashboard`)
   - Protected route requiring authentication
   - User welcome message
   - Navigation to store creation
   - Logout functionality

4. **Create Store Page** (`/create-store`)
   - Comprehensive store information form
   - Protected route
   - Form validation and submission

5. **Forgot Password Page** (`/forgot-password`)
   - Email input for password reset
   - Success/error message display

6. **Reset Password Page** (`/reset-password/:token`)
   - New password form with confirmation
   - Token validation
   - Redirect to login on success

### Authentication Flow

1. User visits login/signup pages
2. On successful authentication, JWT token is stored in localStorage
3. Protected routes check for valid token
4. Dashboard provides access to store creation and other features
5. Logout clears token and redirects to login

## Environment Variables

The authentication server relies on environment variables for its
configuration. For local development you can create a `server/.env` file (not
tracked by git) containing:

```env
MONGODB_URI=mongodb://localhost:27017/codeboy
JWT_PRIVATE_KEY_BASE64=base64_encoded_private_key_here
JWT_PUBLIC_KEY_BASE64=base64_encoded_public_key_here
RESET_EMAIL=your_email@gmail.com
RESET_PASS=your_email_password
PORT=5000
```

Do not commit this file. In production, supply these values via environment
variables or your platform's secrets manager.

## Installation and Setup

### Server Setup
```bash
cd server
npm install
# Create .env file with required variables
npm start
```

### Client Setup
```bash
cd client
npm install
npm run dev
```

## Security Features

- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens expire after 7 days
- Protected routes require valid JWT tokens
- CORS configured for secure cross-origin requests
- Input validation on both frontend and backend

## Testing

The system has been tested locally with:
- ✅ Login page functionality
- ✅ Signup page functionality
- ✅ Dashboard protection (redirects to login when not authenticated)
- ✅ Store creation form
- ✅ Forgot password page
- ✅ Password reset page structure

## Next Steps

1. Set up MongoDB database
2. Configure email service for password reset
3. Add form validation feedback
4. Implement user profile management
5. Add store management features
6. Deploy to production environment

## File Structure

```
server/
├── models/
│   ├── User.js
│   └── Store.js
├── routes/
│   ├── auth.js
│   ├── store.js
│   └── forgot.js
├── config/
│   └── db.js
├── server.js
├── package.json
└── .env.example

client/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CreateStore.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   └── App.jsx
└── package.json
```

