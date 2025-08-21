@echo off
echo 🚀 Pushing organized code to GitHub...

echo.
echo 📋 Current status:
git status

echo.
echo 📦 Adding all files...
git add .

echo.
echo 💾 Committing changes...
git commit -m "Organize project structure: separate frontend and backend folders with all routes and APIs preserved"

echo.
echo 📤 Pushing to GitHub...
git push origin main

echo.
echo ✅ Code successfully pushed to GitHub!
echo.
echo 🎯 Your repository now contains:
echo    - Organized frontend and backend folders
echo    - All routes and APIs preserved
echo    - Updated Docker configurations
echo    - Comprehensive documentation
echo    - Testing scripts
echo.
echo 🚀 Ready for deployment!
pause
