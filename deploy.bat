@echo off
echo 🚀 Judith's Haven - Deployment Script
echo =====================================

REM Check if we're in the right directory
if not exist "package.json" if not exist "frontend" if not exist "backend" (
    echo [ERROR] Please run this script from the project root directory
    pause
    exit /b 1
)

echo [INFO] Starting deployment process...

REM Step 1: Update environment files
echo [INFO] Step 1: Updating environment files...
if exist "update-env.js" (
    node update-env.js
    echo [SUCCESS] Environment files updated
) else (
    echo [WARNING] update-env.js not found, skipping environment file update
)

REM Step 2: Check git status
echo [INFO] Step 2: Checking git status...
if exist ".git" (
    git status --porcelain > temp_git_status.txt
    set /p git_status=<temp_git_status.txt
    del temp_git_status.txt
    
    if not "%git_status%"=="" (
        echo [INFO] Changes detected:
        git status --short
        
        set /p proceed="Do you want to commit and push these changes? (y/n): "
        if /i "%proceed%"=="y" (
            echo [INFO] Staging changes...
            git add .
            
            echo [INFO] Committing changes...
            git commit -m "Deploy: Update production URLs and configuration"
            
            echo [INFO] Pushing to GitHub...
            git push origin main
            
            echo [SUCCESS] Changes pushed to GitHub
        ) else (
            echo [WARNING] Skipping git operations
        )
    ) else (
        echo [SUCCESS] No changes to commit
    )
) else (
    echo [WARNING] Not a git repository, skipping git operations
)

REM Step 3: Display deployment information
echo.
echo [INFO] Step 3: Deployment Information
echo =====================================
echo.
echo [INFO] Production URLs:
echo   Frontend: https://judiths-haven-frontend.onrender.com
echo   Backend:  https://judiths-haven-backend.onrender.com
echo.

echo [INFO] Next Steps:
echo 1. Go to Render Dashboard: https://dashboard.render.com/
echo 2. Check your services are deploying automatically
echo 3. Verify environment variables are set correctly:
echo.
echo Backend Environment Variables:
echo   NODE_ENV=production
echo   FRONTEND_URL=https://judiths-haven-frontend.onrender.com
echo   MONGODB_URI=your_mongodb_connection_string
echo   JWT_SECRET=your_jwt_secret
echo   GOOGLE_CLIENT_ID=your_google_oauth_client_id
echo   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
echo.
echo Frontend Environment Variables:
echo   REACT_APP_API_URL=https://judiths-haven-backend.onrender.com/api
echo.

echo [INFO] Testing Commands:
echo   Test Backend: curl https://judiths-haven-backend.onrender.com/api/health
echo   Test Frontend: start https://judiths-haven-frontend.onrender.com
echo.

echo [SUCCESS] Deployment script completed!
echo [INFO] Check Render Dashboard for deployment progress.
pause
