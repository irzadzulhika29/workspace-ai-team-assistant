# Backend Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database
3. **Google Cloud Console** account
4. **n8n** instance (optional for testing)

---

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/team_workspace"
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
N8N_API_URL="https://your-n8n.com/api/v1"
N8N_API_KEY="your-n8n-api-key"
SESSION_SECRET="generate-random-secret-here"
```

### 3. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google Sheets API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
7. Copy Client ID and Client Secret to `.env`

### 4. Setup Database

Generate Prisma client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

### 5. Start Development Server

Start both frontend and backend:

```bash
npm run dev
```

Or start separately:

```bash
# Terminal 1 - Frontend
npm run dev:client

# Terminal 2 - Backend
npm run dev:server
```

---

## API Endpoints

### Authentication

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/google/status` - Check connection status
- `POST /api/auth/google/disconnect` - Disconnect Google account
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Health Check

- `GET /api/health` - Server health check

---

## Project Structure

```
team-workspace/
├── server/
│   ├── config/
│   │   └── passport.js          # Passport Google OAuth config
│   ├── middleware/
│   │   ├── auth.js              # Auth middleware
│   │   └── errorHandler.js      # Error handler
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   └── api.js               # API routes
│   ├── services/
│   │   └── n8nService.js        # n8n integration
│   └── index.js                 # Express server
├── prisma/
│   └── schema.prisma            # Database schema
├── src/                         # Frontend (React)
└── .env                         # Environment variables
```

---

## Database Schema

### User Table
- `id` - Unique identifier
- `googleId` - Google account ID
- `email` - User email
- `name` - User name
- `picture` - Profile picture URL
- `n8nCredentialId` - n8n credential ID

### GoogleToken Table
- `id` - Unique identifier
- `userId` - Foreign key to User
- `accessToken` - Google access token
- `refreshToken` - Google refresh token
- `expiresAt` - Token expiration time

---

## Troubleshooting

### Port already in use

```bash
# Kill process on port 3001
npx kill-port 3001
```

### Database connection error

Check your `DATABASE_URL` in `.env` and ensure PostgreSQL is running.

### Google OAuth error

1. Check redirect URI matches exactly in Google Console
2. Ensure OAuth consent screen is configured
3. Check Client ID and Secret are correct

### n8n credential creation fails

1. Verify `N8N_API_URL` and `N8N_API_KEY`
2. Check n8n Public API is enabled
3. Ensure n8n is accessible from your server

---

## Production Deployment

### Environment Variables

Set these in your production environment:

```env
NODE_ENV="production"
DATABASE_URL="your-production-db-url"
GOOGLE_CALLBACK_URL="https://yourdomain.com/api/auth/google/callback"
FRONTEND_URL="https://yourdomain.com"
SESSION_SECRET="strong-random-secret"
```

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

---

## Useful Commands

```bash
# Prisma
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio

# Development
npm run dev                # Start both frontend & backend
npm run dev:client         # Start frontend only
npm run dev:server         # Start backend only

# Production
npm run build              # Build frontend
npm start                  # Start production server
```
