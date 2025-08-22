# Mama Miracle Boutique - E-commerce Website

adjust the rare limiter before production

A full-stack e-commerce platform for Mama Miracle Boutique, offering a wide range of fashion and beauty products.

## Deployment Workflow

### Quick Deployment
Run the deployment script:
```bash
# On Windows
deploy.bat

# On Mac/Linux
./deploy.sh
```

### Manual Deployment
To deploy changes to Render:

1. Make changes in VS Code
2. Save files (Ctrl+S)
3. Run: `git status` (check what changed)
4. Run: `git add .` (stage all changes)
5. Run: `git commit -m "Your message"` (commit changes)
6. Run: `git push origin main` (push to GitHub)
7. Render will automatically detect changes and redeploy

### Detailed Deployment Guide
For complete deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## Environment Configuration

### Frontend Environment Variables
Create `frontend/.env.production` with:
```
REACT_APP_API_URL=https://judiths-haven-backend.onrender.com/api
```

### Backend Environment Variables
Set these in your Render dashboard:
- `FRONTEND_URL`: https://judiths-haven-frontend.onrender.com
- `NODE_ENV`: production
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

### Production URLs
- **Frontend**: https://judiths-haven-frontend.onrender.com
- **Backend**: https://judiths-haven-backend.onrender.com

## Features

- User authentication and authorization
- Product catalog with categories
- Shopping cart functionality
- Secure payment processing
- Admin dashboard
- Order management
- Product search and filtering
- Responsive design

## Tech Stack


### Frontend
- React.js with TypeScript
- Tailwind CSS
- Redux Toolkit
- React Router
- Axios

### Backend
- Node.js with Express
- MongoDB
- JWT Authentication
- Multer for file uploads

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Create a .env file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm start
   ```

## Project Structure

```
mama-miracle-boutique/
├── frontend/           # React frontend application
├── backend/           # Node.js backend server
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 