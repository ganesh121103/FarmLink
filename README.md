# FarmLink MERN Application

A full-stack Farmer-to-Customer platform featuring product listings, order management, secure payments, AI crop transparency reports, real-time chat, and push notifications.

## Project Structure

This project uses an industry-standard monorepo structure:
- `/frontend` - Vite React frontend application
- `/backend` - Node.js / Express backend API

## Quick Start

1. Install dependencies from the root directory:
   ```bash
   npm run install:all
   ```

2. Start the development servers (frontend + backend concurrently):
   ```bash
   npm run dev
   ```

   Alternatively, you can start them in separate terminals:
   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```

## Environment Variables

Ensure you have a `.env` file in both `/frontend` and `/backend` with the appropriate configurations (MongoDB, Firebase, Razorpay, SMTP, etc.).
