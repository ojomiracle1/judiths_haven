#!/bin/bash

echo "🚀 Judith's Haven - Deployment Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting deployment process..."

# Step 1: Update environment files
print_status "Step 1: Updating environment files..."
if [ -f "update-env.js" ]; then
    node update-env.js
    print_success "Environment files updated"
else
    print_warning "update-env.js not found, skipping environment file update"
fi

# Step 2: Check git status
print_status "Step 2: Checking git status..."
if [ -d ".git" ]; then
    git_status=$(git status --porcelain)
    if [ -n "$git_status" ]; then
        print_status "Changes detected:"
        echo "$git_status"
        
        # Ask user if they want to proceed
        read -p "Do you want to commit and push these changes? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Git operations
            print_status "Staging changes..."
            git add .
            
            print_status "Committing changes..."
            git commit -m "Deploy: Update production URLs and configuration - $(date)"
            
            print_status "Pushing to GitHub..."
            git push origin main
            
            print_success "Changes pushed to GitHub"
        else
            print_warning "Skipping git operations"
        fi
    else
        print_success "No changes to commit"
    fi
else
    print_warning "Not a git repository, skipping git operations"
fi

# Step 3: Display deployment information
echo
print_status "Step 3: Deployment Information"
echo "====================================="
echo
print_status "Production URLs:"
echo "  Frontend: https://judiths-haven-frontend.onrender.com"
echo "  Backend:  https://judiths-haven-backend.onrender.com"
echo

print_status "Next Steps:"
echo "1. Go to Render Dashboard: https://dashboard.render.com/"
echo "2. Check your services are deploying automatically"
echo "3. Verify environment variables are set correctly:"
echo
echo "Backend Environment Variables:"
echo "  NODE_ENV=production"
echo "  FRONTEND_URL=https://judiths-haven-frontend.onrender.com"
echo "  MONGODB_URI=your_mongodb_connection_string"
echo "  JWT_SECRET=your_jwt_secret"
echo "  GOOGLE_CLIENT_ID=your_google_oauth_client_id"
echo "  GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret"
echo
echo "Frontend Environment Variables:"
echo "  REACT_APP_API_URL=https://judiths-haven-backend.onrender.com/api"
echo

print_status "Testing Commands:"
echo "  Test Backend: curl https://judiths-haven-backend.onrender.com/api/health"
echo "  Test Frontend: open https://judiths-haven-frontend.onrender.com"
echo

print_success "Deployment script completed!"
print_status "Check Render Dashboard for deployment progress."
