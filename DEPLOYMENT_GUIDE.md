# Complete Deployment Guide - Judith's Haven

## Overview
This guide covers deploying both frontend and backend to Render, including updating existing deployments with the correct URLs.

## Production URLs
- **Frontend**: https://judiths-haven-frontend.onrender.com
- **Backend**: https://judiths-haven-backend.onrender.com

---

## 🚀 Backend Deployment (Node.js/Express)

### Step 1: Prepare Backend for Deployment

1. **Ensure your backend directory structure is correct:**
   ```
   backend/
   ├── server.js (main entry point)
   ├── package.json
   ├── config/
   ├── routes/
   ├── models/
   ├── middleware/
   └── uploads/
   ```

2. **Verify your `backend/package.json` has the correct scripts:**
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

### Step 2: Deploy Backend to Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your project

3. **Configure the Web Service:**
   - **Name**: `judiths-haven-backend`
   - **Root Directory**: `backend` (if your backend is in a subdirectory)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose appropriate plan (Free tier works for testing)

4. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret_key
   JWT_REFRESH_SECRET=your_secure_refresh_secret_key
   SESSION_SECRET=your_session_secret_key
   FRONTEND_URL=https://judiths-haven-frontend.onrender.com
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   ```

5. **Advanced Settings:**
   - **Auto-Deploy**: Yes
   - **Branch**: `main` (or your default branch)

6. **Click "Create Web Service"**

### Step 3: Update Existing Backend Deployment

If you already have a backend deployed:

1. **Go to your existing backend service in Render Dashboard**

2. **Update Environment Variables:**
   - Go to "Environment" tab
   - Add/Update these variables:
     ```
     NODE_ENV=production
     FRONTEND_URL=https://judiths-haven-frontend.onrender.com
     ```
   - Ensure all other environment variables are set correctly

3. **Redeploy:**
   - Go to "Manual Deploy" tab
   - Click "Deploy latest commit"

---

## 🎨 Frontend Deployment (React)

### Step 1: Prepare Frontend for Deployment

1. **Ensure your frontend directory structure is correct:**
   ```
   frontend/
   ├── package.json
   ├── public/
   ├── src/
   └── .env.production
   ```

2. **Verify your `frontend/package.json` has the correct scripts:**
   ```json
   {
     "scripts": {
       "start": "react-scripts start",
       "build": "react-scripts build",
       "test": "react-scripts test",
       "eject": "react-scripts eject"
     }
   }
   ```

3. **Create/Update `.env.production` file:**
   ```bash
   # In frontend directory
   echo "REACT_APP_API_URL=https://judiths-haven-backend.onrender.com/api" > .env.production
   ```

### Step 2: Deploy Frontend to Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Create New Static Site:**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select the repository containing your project

3. **Configure the Static Site:**
   - **Name**: `judiths-haven-frontend`
   - **Root Directory**: `frontend` (if your frontend is in a subdirectory)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: Choose appropriate plan (Free tier works for testing)

4. **Set Environment Variables:**
   ```
   REACT_APP_API_URL=https://judiths-haven-backend.onrender.com/api
   ```

5. **Advanced Settings:**
   - **Auto-Deploy**: Yes
   - **Branch**: `main` (or your default branch)

6. **Click "Create Static Site"**

### Step 3: Update Existing Frontend Deployment

If you already have a frontend deployed:

1. **Go to your existing frontend service in Render Dashboard**

2. **Update Environment Variables:**
   - Go to "Environment" tab
   - Add/Update:
     ```
     REACT_APP_API_URL=https://judiths-haven-backend.onrender.com/api
     ```

3. **Redeploy:**
   - Go to "Manual Deploy" tab
   - Click "Deploy latest commit"

---

## 🔧 Post-Deployment Configuration

### Step 1: Verify Backend is Working

1. **Test your backend API:**
   ```bash
   curl https://judiths-haven-backend.onrender.com/api/health
   # or visit in browser: https://judiths-haven-backend.onrender.com/api/health
   ```

2. **Check backend logs in Render Dashboard:**
   - Go to your backend service
   - Click "Logs" tab
   - Look for any errors

### Step 2: Verify Frontend is Working

1. **Visit your frontend URL:**
   ```
   https://judiths-haven-frontend.onrender.com
   ```

2. **Test key functionality:**
   - User registration/login
   - Product browsing
   - Cart functionality
   - Admin features (if applicable)

### Step 3: Configure Custom Domains (Optional)

1. **In Render Dashboard:**
   - Go to your service
   - Click "Settings" tab
   - Scroll to "Custom Domains"
   - Add your custom domain

2. **Update DNS records with your domain provider**

---

## 🔍 Troubleshooting Common Issues

### Backend Issues

1. **CORS Errors:**
   - Ensure `FRONTEND_URL` is set correctly in backend environment variables
   - Check that CORS configuration in `server.js` is correct

2. **Database Connection Issues:**
   - Verify `MONGODB_URI` is correct
   - Ensure MongoDB Atlas (if using) allows connections from Render's IP ranges

3. **Environment Variables Not Loading:**
   - Check that all required environment variables are set in Render
   - Verify variable names match what's expected in code

### Frontend Issues

1. **API Calls Failing:**
   - Verify `REACT_APP_API_URL` is set correctly
   - Check browser console for CORS errors
   - Ensure backend is running and accessible

2. **Build Failures:**
   - Check build logs in Render Dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

3. **Static Assets Not Loading:**
   - Check that `public` directory is properly configured
   - Verify build output in `build` directory

---

## 📋 Environment Variables Checklist

### Backend Environment Variables
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_REFRESH_SECRET=your_very_secure_refresh_secret_key_here
SESSION_SECRET=your_session_secret_key_here
FRONTEND_URL=https://judiths-haven-frontend.onrender.com
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

### Frontend Environment Variables
```bash
REACT_APP_API_URL=https://judiths-haven-backend.onrender.com/api
```

---

## 🚀 Deployment Commands

### Quick Deployment Script
Create a `deploy.sh` file in your project root:

```bash
#!/bin/bash

echo "🚀 Starting deployment process..."

# Update environment files
echo "📝 Updating environment files..."
node update-env.js

# Git operations
echo "📦 Staging changes..."
git add .

echo "💾 Committing changes..."
git commit -m "Deploy: Update production URLs and configuration"

echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Deployment initiated! Check Render Dashboard for progress."
echo "🌐 Frontend: https://judiths-haven-frontend.onrender.com"
echo "🔧 Backend: https://judiths-haven-backend.onrender.com"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Render
      env:
        RENDER_TOKEN: ${{ secrets.RENDER_TOKEN }}
        RENDER_SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }}
      run: |
        curl -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
          -H "Authorization: Bearer $RENDER_TOKEN" \
          -H "Content-Type: application/json"
```

---

## 📞 Support

If you encounter issues:

1. **Check Render Dashboard logs** for both services
2. **Verify environment variables** are set correctly
3. **Test API endpoints** directly using tools like Postman
4. **Check browser console** for frontend errors
5. **Review this guide** for common solutions

---

## ✅ Final Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured correctly
- [ ] CORS settings working
- [ ] Database connection established
- [ ] User authentication working
- [ ] Core functionality tested
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates working
- [ ] Performance monitoring set up

Your application should now be fully deployed and accessible at the production URLs!
