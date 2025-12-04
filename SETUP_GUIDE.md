# Environment Configuration Guide

This guide will help you set up all the required environment variables for the BookMe application.

## 1. Email SMTP Configuration

### Option A: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication**:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "BookMe Backend"
   - Copy the 16-character password

3. **Update .env**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # The app password
   EMAIL_FROM=BookMe <noreply@bookme.com>
   ```

### Option B: SendGrid (Recommended for Production)

1. **Create SendGrid Account**: https://signup.sendgrid.com/
2. **Create API Key**:
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permissions
3. **Update .env**:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=SG.your-api-key-here
   ```

### Option C: Mailgun

1. **Create Mailgun Account**: https://signup.mailgun.com/
2. **Get SMTP Credentials**:
   - Go to Sending → Domain Settings → SMTP Credentials
3. **Update .env**:
   ```env
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_USER=postmaster@your-domain.mailgun.org
   EMAIL_PASSWORD=your-password
   ```

## 2. Firebase Cloud Messaging (Push Notifications)

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name (e.g., "bookme-app")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Cloud Messaging

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Go to **Cloud Messaging** tab
3. Note your **Sender ID** (you'll need this)

### Step 3: Generate Service Account Key

1. In Firebase Console, go to **Project Settings**
2. Go to **Service Accounts** tab
3. Click **Generate New Private Key**
4. Download the JSON file
5. Open the JSON file and extract:
   - `project_id`
   - `private_key`
   - `client_email`

### Step 4: Update .env

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Important**: The private key must be in quotes and include `\n` for line breaks.

### Step 5: Initialize Firebase Admin SDK

Create `src/config/firebase.ts`:

```typescript
import admin from 'firebase-admin';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

export default admin;
```

### Step 6: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### Step 7: Update Push Service

Update `src/services/push.service.ts` to use Firebase Admin:

```typescript
import admin from '../config/firebase.js';

export const sendPushNotification = async (
  deviceToken: string,
  payload: PushNotificationPayload
) => {
  try {
    const message = {
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data || {},
      token: deviceToken
    };
    
    await admin.messaging().send(message);
    return true;
  } catch (error) {
    console.error('Push notification failed:', error);
    return false;
  }
};
```

## 3. Paystack Configuration

1. **Create Paystack Account**: https://paystack.com/
2. **Get API Keys**:
   - Go to Settings → API Keys & Webhooks
   - Copy your **Secret Key** and **Public Key**
3. **Update .env**:
   ```env
   PAYSTACK_SECRET_KEY=sk_test_your_key_here
   PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
   ```

## 4. Database Configuration

### Local MongoDB

```env
MONGO_URI=mongodb://localhost:27017/bookme
```

### MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update .env:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bookme?retryWrites=true&w=majority
   ```

## 5. Testing Email Configuration

Run this test script to verify email setup:

```bash
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

transporter.sendMail({
  from: 'BookMe <noreply@bookme.com>',
  to: 'your-email@gmail.com',
  subject: 'Test Email',
  text: 'If you receive this, email is configured correctly!'
}).then(() => console.log('✓ Email sent successfully!'))
  .catch(err => console.error('✗ Email failed:', err));
"
```

## 6. Security Best Practices

1. **Never commit .env to Git**:
   - Ensure `.env` is in `.gitignore`
   
2. **Use different keys for development and production**

3. **Rotate keys regularly**

4. **Use environment-specific .env files**:
   - `.env.development`
   - `.env.production`
   - `.env.test`

## 7. Verification Checklist

- [ ] Email sending works (test with registration)
- [ ] Push notifications work (test with booking)
- [ ] Paystack payments work (test with test cards)
- [ ] MongoDB connection successful
- [ ] All environment variables loaded correctly

## Troubleshooting

### Email Issues

- **"Invalid login"**: Check app password, not regular password
- **"Connection timeout"**: Check firewall/antivirus
- **"TLS error"**: Try `secure: true` with port 465

### Firebase Issues

- **"Invalid credentials"**: Check private key formatting
- **"Project not found"**: Verify project ID
- **"Permission denied"**: Enable Cloud Messaging API

### Paystack Issues

- **"Invalid API key"**: Use test keys for development
- **"Webhook failed"**: Check webhook URL configuration
