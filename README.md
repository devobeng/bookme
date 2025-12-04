# BookMe Backend API

A comprehensive booking platform backend built with Node.js, Express, TypeScript, and MongoDB. This API powers a full-featured Airbnb-like application with advanced search, payments, messaging, and safety features.

## 🚀 Features

### Core Features
- ✅ **User Authentication & Authorization** - JWT-based auth with role management (user, host, admin)
- ✅ **Social Login** - Google, Facebook, Apple integration
- ✅ **Multi-Factor Authentication** - TOTP-based MFA for enhanced security
- ✅ **Phone Verification** - OTP-based phone number verification
- ✅ **Advanced Search & Filters** - Location, dates, price, amenities, ratings, and more
- ✅ **Map-Based Search** - Geospatial queries with clustering and price markers
- ✅ **Booking System** - Instant booking and request-to-book workflows
- ✅ **Payment Processing** - Paystack integration for card and mobile money
- ✅ **Reviews & Ratings** - 6-category rating system with host replies
- ✅ **Messaging System** - Real-time chat between guests and hosts
- ✅ **Notifications** - Email, push, and in-app notifications
- ✅ **Host Dashboard** - Earnings, analytics, and property management
- ✅ **Admin Panel** - User management, verification, reports, and analytics
- ✅ **Safety & Trust** - ID verification, trust scores, emergency support

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Features Deep Dive](#features-deep-dive)
- [Testing](#testing)
- [Deployment](#deployment)

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Passport.js
- **Payment**: Paystack
- **Email**: Nodemailer
- **Push Notifications**: Firebase Cloud Messaging
- **Real-time**: Socket.IO (ready)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## 📦 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm or yarn
- Paystack account (for payments)
- Firebase account (for push notifications)
- SMTP server (for emails)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd bookme/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Build the project**
```bash
npm run build
```

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/bookme

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=90d

# Frontend
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=BookMe <noreply@bookme.com>

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Social Login (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

See `SETUP_GUIDE.md` for detailed configuration instructions.

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Testing
```bash
npm test
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Social Login
```http
POST /api/v1/auth/google
POST /api/v1/auth/facebook
POST /api/v1/auth/apple
```

### Listings Endpoints

#### Search Listings
```http
GET /api/v1/listings/search?location=Accra&checkIn=2025-12-20&checkOut=2025-12-25&guests=2&minPrice=50&maxPrice=500
```

#### Get Listing Details
```http
GET /api/v1/listings/:id
```

#### Create Listing (Host only)
```http
POST /api/v1/listings
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Beautiful Beach House",
  "description": "...",
  "propertyType": "entire-home",
  "price": 200,
  "location": {
    "type": "Point",
    "coordinates": [-0.1870, 5.6037]
  },
  "amenities": ["wifi", "pool", "parking"],
  "guestCapacity": 4
}
```

### Booking Endpoints

#### Calculate Price
```http
POST /api/v1/bookings/calculate-price
Authorization: Bearer <token>

{
  "listingId": "...",
  "startDate": "2025-12-20",
  "endDate": "2025-12-25",
  "guests": { "adults": 2, "children": 0, "infants": 0 }
}
```

#### Create Booking
```http
POST /api/v1/bookings
Authorization: Bearer <token>

{
  "listing": "...",
  "startDate": "2025-12-20",
  "endDate": "2025-12-25",
  "guests": { "adults": 2, "children": 0, "infants": 0 }
}
```

### Payment Endpoints

#### Initialize Payment
```http
POST /api/v1/payments/initialize
Authorization: Bearer <token>

{
  "bookingId": "...",
  "amount": 1275.50,
  "currency": "GHS",
  "paymentMethod": "card"
}
```

#### Verify Payment
```http
GET /api/v1/payments/verify?reference=xyz123
```

### Map & Geospatial Endpoints

#### Get Map Markers
```http
GET /api/v1/listings/map/markers?neLat=5.6&neLng=-0.1&swLat=5.5&swLng=-0.2
```

#### Get Clustered Markers
```http
GET /api/v1/listings/map/clusters?neLat=5.6&neLng=-0.1&swLat=5.5&swLng=-0.2&zoom=12
```

#### Get Neighborhood Info
```http
GET /api/v1/listings/map/neighborhood?lat=5.55&lng=-0.15&radius=2
```

### Review Endpoints

#### Create Review
```http
POST /api/v1/reviews
Authorization: Bearer <token>

{
  "booking": "...",
  "ratings": {
    "cleanliness": 5,
    "accuracy": 4,
    "checkIn": 5,
    "communication": 5,
    "location": 4,
    "value": 4
  },
  "comment": "Great stay!"
}
```

#### Host Reply to Review
```http
POST /api/v1/reviews/:id/reply
Authorization: Bearer <token>

{
  "reply": "Thank you for your feedback!"
}
```

### Admin Endpoints

#### Get All Users
```http
GET /api/v1/admin/users
Authorization: Bearer <admin-token>
```

#### Approve Listing
```http
PATCH /api/v1/admin/listings/:id/approve
Authorization: Bearer <admin-token>
```

#### Get Financial Stats
```http
GET /api/v1/admin/financial/stats?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer <admin-token>
```

For complete API documentation, see the [API Reference](./docs/API.md).

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── env.ts
│   │   └── firebase.ts
│   ├── controllers/     # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── listing.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── payment.controller.ts
│   │   └── ...
│   ├── middleware/      # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   ├── models/          # Mongoose models
│   │   ├── User.ts
│   │   ├── Listing.ts
│   │   ├── Booking.ts
│   │   └── ...
│   ├── routes/          # API routes
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── listings.routes.ts
│   │   └── ...
│   ├── services/        # Business logic
│   │   ├── auth.service.ts
│   │   ├── listing.service.ts
│   │   ├── payment.service.ts
│   │   └── ...
│   ├── utils/           # Utility functions
│   │   ├── AppError.ts
│   │   ├── catchAsync.ts
│   │   └── searchFeatures.ts
│   ├── validation/      # Input validation
│   │   └── listing.validation.ts
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── tests/              # Test files
├── .env               # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Features Deep Dive

### 1. Authentication & Authorization

- **JWT-based authentication** with refresh tokens
- **Role-based access control** (user, host, admin)
- **Social login** via Google, Facebook, Apple
- **Multi-factor authentication** (TOTP)
- **Phone verification** with OTP
- **Password reset** via email

### 2. Advanced Search

- **Location search** with autocomplete
- **Date-based availability** filtering
- **Price range** filtering
- **Property type** filtering
- **Amenities** filtering (wifi, pool, parking, etc.)
- **Guest capacity** filtering
- **Ratings** filtering
- **Sorting** by price, rating, distance

### 3. Map Features

- **Bounding box search** for map viewport
- **Price markers** on map
- **Marker clustering** based on zoom level
- **Neighborhood statistics** (avg price, ratings)
- **Distance calculations** to landmarks

### 4. Booking System

- **Instant booking** for approved listings
- **Request-to-book** workflow
- **Price calculation** with fees and taxes
- **Cancellation policies** (flexible, moderate, strict)
- **Automatic refunds** based on policy
- **Guest and host perspectives**

### 5. Payment Processing

- **Paystack integration** (PCI-compliant)
- **Card payments** (Visa, Mastercard)
- **Mobile money** (MTN, Vodafone, AirtelTigo)
- **Multi-currency support** (GHS, USD, EUR, GBP, NGN)
- **Automatic refunds**
- **Host payouts** (97% of booking total)
- **Transaction history**

### 6. Reviews & Ratings

- **6-category ratings** (cleanliness, accuracy, check-in, communication, location, value)
- **Written reviews**
- **Host replies**
- **Automatic rating calculations**
- **Review deletion** (48-hour window)
- **Verified bookings only**

### 7. Messaging System

- **Real-time chat** (Socket.IO ready)
- **Conversation management**
- **Unread counts**
- **Read receipts**
- **Saved replies** for hosts
- **Automated messages** (booking confirmations, check-in instructions)

### 8. Notifications

- **Email notifications** (Nodemailer)
- **Push notifications** (Firebase FCM)
- **In-app notifications**
- **Multi-channel delivery**
- **Notification preferences**

### 9. Host Dashboard

- **Earnings reports** with platform fees
- **Performance insights** (occupancy rate, revenue)
- **Payout management** (bank transfer, MOMO)
- **Reservation inbox**
- **Review management**
- **Pricing tools** (smart pricing, discounts)

### 10. Admin Panel

- **User management** (suspend, reactivate, roles)
- **Host verification**
- **Listing approvals**
- **Reports & disputes**
- **Financial dashboard**
- **Platform analytics**
- **Fraud prevention**
- **Manual refunds**

### 11. Safety & Trust

- **ID verification** with document upload
- **Trust score** calculation (0-100)
- **Secure payment** validation
- **Emergency support** hotline
- **Priority-based routing**
- **PCI-DSS compliance**

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚢 Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up production email service (SendGrid recommended)
4. Configure Paystack production keys
5. Set up Firebase for push notifications

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

### Recommended Hosting

- **API**: Heroku, Railway, Render, DigitalOcean
- **Database**: MongoDB Atlas
- **File Storage**: AWS S3, Cloudinary

## 📝 License

MIT

## 👥 Support

For support, email dev.obeng.bismark@gmail.com or create an issue in the repository.

## 🙏 Acknowledgments

- Express.js team
- MongoDB team
- Paystack
- Firebase
- All open-source contributors
