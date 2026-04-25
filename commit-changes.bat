@echo off
echo ========================================
echo Welleni - Commit Changes
echo ========================================
echo.

echo Checking for sensitive files...
if exist env.js (
    echo WARNING: env.js found!
    echo This file contains sensitive credentials and should NOT be committed.
    echo It is already in .gitignore and will be excluded.
    echo.
)

if exist .env (
    echo WARNING: .env found!
    echo This file contains sensitive credentials and should NOT be committed.
    echo It is already in .gitignore and will be excluded.
    echo.
)

echo Adding all files to Git...
git add -A

echo.
echo Committing changes...
git commit -m "Prepare for Render deployment with environment variables"

echo.
echo Checking status...
git status

echo.
echo ========================================
echo Changes committed successfully!
echo ========================================
echo.
echo IMPORTANT: Environment Variables
echo ========================================
echo.
echo Your env.js and .env files are NOT committed (protected by .gitignore)
echo.
echo Before deploying to Render:
echo 1. Push to GitHub: git push
echo 2. Add Environment Variables in Render Dashboard
echo 3. See ENVIRONMENT_VARIABLES.txt for instructions
echo.
echo Next steps:
echo 1. Run: git push
echo 2. Go to: https://dashboard.render.com/
echo 3. Add environment variables (see ENV_SETUP.md)
echo.
pause
