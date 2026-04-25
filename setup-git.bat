@echo off
echo ========================================
echo Welleni - Git Setup for Render Deployment
echo ========================================
echo.

echo Initializing Git repository...
git init

echo.
echo Adding all files...
git add .

echo.
echo Creating initial commit...
git commit -m "Initial commit - Welleni healthcare platform"

echo.
echo Setting default branch to main...
git branch -M main

echo.
echo ========================================
echo Git Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create a repository on GitHub
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_REPO_URL
echo 4. Run: git push -u origin main
echo 5. Go to https://dashboard.render.com/
echo 6. Click "New +" and select "Static Site"
echo 7. Connect your GitHub repository
echo.
echo Or simply run: deploy-render.bat
echo.
pause
