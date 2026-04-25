@echo off
echo ========================================
echo Welleni - Environment Setup
echo ========================================
echo.

echo This script will help you set up your environment variables.
echo.

REM Check if env.js already exists
if exist env.js (
    echo WARNING: env.js already exists!
    echo.
    choice /C YN /M "Do you want to overwrite it"
    if errorlevel 2 goto :skip
)

echo Creating env.js from template...
copy env.example.js env.js >nul

echo.
echo ========================================
echo env.js created successfully!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Open env.js in a text editor
echo 2. Replace the placeholder values with your actual credentials:
echo.
echo    SUPABASE_URL: Get from https://app.supabase.com/project/_/settings/api
echo    SUPABASE_ANON_KEY: Get from https://app.supabase.com/project/_/settings/api
echo    RAZORPAY_KEY_ID: Get from https://dashboard.razorpay.com/app/keys
echo.
echo 3. Save the file
echo 4. Test your app locally
echo.
echo For deployment to Render:
echo - Add these as Environment Variables in Render Dashboard
echo - See ENV_SETUP.md for detailed instructions
echo.
goto :end

:skip
echo.
echo Skipped creating env.js (file already exists)
echo.

:end
echo Opening env.js in notepad...
timeout /t 2 >nul
notepad env.js

echo.
echo Opening ENV_SETUP.md for reference...
timeout /t 1 >nul
notepad ENV_SETUP.md

echo.
pause
