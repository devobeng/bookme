# BookMe Backend

Backend for the BookMe Airbnb clone application.

## Tech Stack
- Node.js
- Express
- MongoDB (Mongoose)
- Socket.io (Real-time communication)
- Stripe (Payments)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and update the values.

3. Run the server:
   ```bash
   npm run dev
   ```

## Folder Structure
- `src/config`: Configuration files (DB, env)
- `src/controllers`: Request handlers
- `src/models`: Database models
- `src/routes`: API routes
- `src/services`: Business logic
- `src/middleware`: Custom middleware
- `src/utils`: Utility functions
- `src/validation`: Input validation schemas
- `src/sockets`: Socket.io handlers
- `src/jobs`: Background jobs
