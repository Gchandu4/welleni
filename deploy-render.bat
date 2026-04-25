@echo off
echo ========================================
echo Welleni - Render Deployment Helper
echo ========================================
echo.

echo This script will help you deploy to Render.
echo.
echo Prerequisites:
echo - Git installed
echo - GitHub account
echo - Render account (free at https://render.com)
echo.
pause

echo.
echo Step 1: Checking Git...
git --version
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo.
echo Step 2: Initialize Git repository (if needed)...
if not exist .git (
    git init
    git add .
    git commit -m "Initial commit - Welleni healthcare platform"
    git branch -M main
    echo Git repository initialized!
) else (
    echo Git repository already exists.
)

echo.
echo Step 3: Add and commit any changes...
git add .
git commit -m "Update for Render deployment" 2>nul
if %errorlevel% equ 0 (
    echo Changes committed!
) else (
    echo No changes to commit.
)

echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. CREATE GITHUB REPOSITORY
echo    - Go to: https://github.com/new
echo    - Name: welleni
echo    - Click "Create repository"
echo.
echo 2. PUSH TO GITHUB
echo    Run these commands:
echo    git remote add origin https://github.com/YOUR_USERNAME/welleni.git
echo    git push -u origin main
echo.
echo 3. DEPLOY ON RENDER
echo    - Go to: https://dashboard.render.com/
echo    - Click "New +" button
echo    - Select "Static Site"
echo    - Connect your GitHub account
echo    - Select "welleni" repository
echo    - Configure:
echo      * Build Command: (leave empty)
echo      * Publish Directory: .
echo    - Click "Create Static Site"
echo.
echo 4. WAIT FOR DEPLOYMENT
echo    Your site will be live at: https://welleni.onrender.com
echo.
echo ========================================
echo.
echo Opening Render dashboard in browser...
timeout /t 3 >nul
start https://dashboard.render.com/
echo.
echo Opening GitHub in browser...
timeout /t 2 >nul
start https://github.com/new
echo.
pause
