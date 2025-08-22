# 🚀 Complete Deployment Guide for Render

This guide will help you deploy both your backend and frontend to Render.

## 📋 Prerequisites

1. **GitHub Account** (free)
2. **Render Account** (free) - [Sign up here](https://render.com)
3. **MongoDB Atlas Account** (free) - [Sign up here](https://mongodb.com/atlas)

## 🔧 Step 1: Set Up MongoDB Atlas Database

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose "Free" tier (M0)

### 1.2 Create Database Cluster
1. Click "Build a Database"
2. Choose "FREE" tier
3. Select your preferred cloud provider (AWS/Google Cloud/Azure)
4. Choose a region close to you
5. Click "Create"

### 1.3 Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Username: `admin`
4. Password: Create a strong password (save it!)
5. Role: "Atlas admin"
6. Click "Add User"

### 1.4 Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for now)
4. Click "Confirm"

### 1.5 Get Your Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string (it looks like: `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
5. Replace `<password>` with your actual password

## 🎯 Step 2: Prepare Your Code for Deployment

### 2.1 Push Your Code to GitHub
1. Create a new repository on GitHub
2. Push your current code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

## 🚀 Step 3: Deploy Backend to Render

### 3.1 Create Backend Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `judiths-haven-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: `Free`

### 3.2 Set Environment Variables
In your Render backend service, go to "Environment" tab and add:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/judiths-haven?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://your-frontend-url.onrender.com
```

**Important**: Replace `YOUR_PASSWORD` with your actual MongoDB password and `your-frontend-url` with your actual frontend URL (you'll get this after deploying the frontend).

### 3.3 Deploy Backend
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://judiths-haven-backend.onrender.com`)

## 🎨 Step 4: Deploy Frontend to Render

### 4.1 Create Frontend Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `judiths-haven-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Plan**: `Free`

### 4.2 Set Environment Variables
In your Render frontend service, go to "Environment" tab and add:

```
REACT_APP_API_URL=https://judiths-haven-backend.onrender.com
```

### 4.3 Deploy Frontend
1. Click "Create Static Site"
2. Wait for deployment to complete
3. Copy your frontend URL (e.g., `https://judiths-haven-frontend.onrender.com`)

## 🔄 Step 5: Update Backend with Frontend URL

### 5.1 Update Backend Environment Variables
1. Go back to your backend service on Render
2. Go to "Environment" tab
3. Update `FRONTEND_URL` with your actual frontend URL:
   ```
   FRONTEND_URL=https://judiths-haven-frontend.onrender.com
   ```
4. Click "Save Changes"
5. Your backend will automatically redeploy

## ✅ Step 6: Test Your Deployment

### 6.1 Test Backend
1. Visit your backend URL: `https://judiths-haven-backend.onrender.com`
2. You should see your API response or a welcome message

### 6.2 Test Frontend
1. Visit your frontend URL: `https://judiths-haven-frontend.onrender.com`
2. Your React app should load and connect to the backend

## 🔧 Troubleshooting

### Common Issues:

1. **Backend won't start**: Check your environment variables are set correctly
2. **Frontend can't connect to backend**: Make sure `REACT_APP_API_URL` is set correctly
3. **Database connection issues**: Verify your MongoDB URI is correct
4. **Build fails**: Check the build logs in Render dashboard

### Useful Commands:
- **View logs**: Go to your service → "Logs" tab
- **Redeploy**: Go to your service → "Manual Deploy" → "Deploy latest commit"

## 🎉 Congratulations!

Your full-stack application is now deployed on Render! Both your backend and frontend are live and connected.

**Your URLs:**
- Backend: `https://judiths-haven-backend.onrender.com`
- Frontend: `https://judiths-haven-frontend.onrender.com`

## 📝 Notes

- **Free tier limitations**: Render free tier has some limitations but is perfect for development and small projects
- **Auto-deploy**: Every time you push to GitHub, your services will automatically redeploy
- **Environment variables**: Keep your secrets safe and never commit them to GitHub
- **Monitoring**: Use Render's dashboard to monitor your services and view logs 