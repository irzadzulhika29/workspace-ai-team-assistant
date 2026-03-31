# Team Assistant Workspace

A comprehensive team collaboration platform that integrates AI-powered assistance, workflow automation, and various workplace tools into a unified workspace. The application features Google authentication, document management, calendar integration, and n8n workflow automation capabilities.

## Features

- 🔐 **Google OAuth 2.0 Authentication** - Secure authentication using Google accounts
- 🤖 **AI-Powered Assistants** - Supervisor and Knowledge chat interfaces
- 📁 **File Workspace** - Document management and collaboration tools
- 📅 **Calendar Integration** - Google Calendar synchronization and management
- 🧩 **n8n Workflow Automation** - Integration with n8n for workflow automation
- 🌐 **JIRA Integration** - Project management and issue tracking
- 🛠 **Integration Hub** - Centralized platform for various workplace tools
- 📊 **Dashboard Analytics** - Comprehensive workspace overview

## Tech Stack

### Frontend
- React 18.3+
- Vite 5+ (build tool)
- Tailwind CSS (styling)
- React Router DOM (navigation)
- Zustand (state management)
- Lucide React (icons)
- React Markdown (content rendering)
- React Dropzone (file uploads)

### Backend
- Node.js (runtime)
- Express.js (web framework)
- Prisma ORM (database management)
- PostgreSQL (database)
- Passport.js (authentication)
- Google APIs (Google services integration)

### Development Tools
- ESLint (linting)
- Husky (git hooks)
- lint-staged (pre-commit hooks)
- Concurrently (running multiple processes)
- Nodemon (development server)

## Project Structure

```
team-workspace/
├── public/                    # Static assets
├── server/                    # Backend server code
│   ├── config/               # Configuration files
│   ├── middleware/           # Request processing middleware
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic modules
│   └── index.js              # Main server file
├── src/                      # Frontend source code
│   ├── components/           # Reusable UI components
│   ├── context/              # React context providers
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Page components
│   ├── services/             # API service wrappers
│   ├── store/                # Global state management
│   ├── utils/                # Utility functions
│   ├── App.jsx               # Main application router
│   ├── main.jsx              # React root setup
│   └── index.css             # Global styles
├── prisma/                   # Database schema and migrations
├── docs/                     # Documentation files
└── server/README.md          # Detailed backend setup guide
```

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** database server
- **Google Cloud Console** account for OAuth setup
- **n8n** instance (optional, for workflow automation)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd team-workspace
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/team_workspace"
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
N8N_API_URL="https://your-n8n-instance.com/api/v1"
N8N_API_KEY="your-n8n-api-key"
SESSION_SECRET="generate-a-strong-random-secret-here"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

## Database Setup

1. Generate Prisma client:
```bash
npm run prisma:generate
```

2. Run database migrations:
```bash
npm run prisma:migrate
```

## Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google Sheets API** and other required Google APIs
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
7. Copy Client ID and Client Secret to your `.env` file

## Running the Application

### Development Mode

Start both frontend and backend simultaneously:
```bash
npm run dev
```

Or run them separately:
```bash
# Terminal 1 - Frontend
npm run dev:client

# Terminal 2 - Backend
npm run dev:server
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Production Build

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

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

### Protected Routes
- Various endpoints under `/api/` require authentication

## Key Features Overview

### Dashboard
Main application overview with quick access to all features and analytics.

### Supervisor Chat
AI-powered assistant for supervision and workflow oversight.

### Knowledge Chat
AI-powered knowledge management and search assistant.

### File Workspace
Document management system with upload, sharing, and collaboration features.

### Calendar Page
Google Calendar integration for scheduling and time management.

### JIRA Page
Project management and issue tracking integration.

### Integrations Page
Central hub for managing all third-party integrations.

## Database Schema

### User Table
- `id` - Unique identifier
- `googleId` - Google account ID
- `email` - User email
- `name` - User name
- `picture` - Profile picture URL
- `n8nCredentialId` - Associated n8n credential ID

### GoogleToken Table
- `id` - Unique identifier
- `userId` - Foreign key to User
- `accessToken` - Google access token
- `refreshToken` - Google refresh token
- `expiresAt` - Token expiration time

## Development Scripts

Available npm scripts:
```bash
# Development
npm run dev                # Start both frontend & backend
npm run dev:client         # Start frontend only
npm run dev:server         # Start backend only
npm run preview            # Preview production build

# Building
npm run build              # Build frontend for production

# Linting
npm run lint               # Lint all files

# Database (via Prisma)
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio for data management

# Git Hooks Preparation
npm run prepare            # Setup husky git hooks
```

## Environment Variables

Key environment variables to configure:
- `DATABASE_URL` - PostgreSQL database connection string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - OAuth callback URL (production)
- `N8N_API_URL` - n8n API URL
- `N8N_API_KEY` - n8n API key
- `SESSION_SECRET` - Express session secret
- `FRONTEND_URL` - Frontend application URL
- `NODE_ENV` - Environment mode ('development' or 'production')
- `PORT` - Backend server port (default: 3001)

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3001
npx kill-port 3001
```

#### Database Connection Error
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running on the specified host and port
- Verify database credentials are correct

#### Google OAuth Error
- Check that redirect URI matches exactly in Google Console
- Ensure OAuth consent screen is properly configured
- Verify Client ID and Secret are correctly entered in environment variables

#### n8n Credential Creation Fails
- Verify `N8N_API_URL` and `N8N_API_KEY` are correct
- Check that n8n Public API is enabled
- Ensure n8n instance is accessible from your server

### Debugging Tips
- Check browser console for frontend issues
- Check server logs for backend errors
- Verify all environment variables are set correctly
- Ensure all required services (database, n8n) are running

## Production Deployment

### Environment Configuration
Set these environment variables in production:
```env
NODE_ENV="production"
DATABASE_URL="your-production-db-url"
GOOGLE_CALLBACK_URL="https://yourdomain.com/api/auth/google/callback"
FRONTEND_URL="https://yourdomain.com"
SESSION_SECRET="strong-random-secret"
```

### Build and Deploy Process
1. Run `npm run build` to create production build
2. Set production environment variables
3. Start the application with `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Additional Notes

- The application uses modern React patterns and best practices
- Security is implemented with Passport.js and OAuth 2.0
- The code follows modular architecture patterns for maintainability
- Proper error handling is implemented throughout the application
- The UI is designed to be responsive and user-friendly

For detailed backend setup instructions, refer to the [server/README.md](./server/README.md) file.