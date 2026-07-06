@echo off
echo ==========================================
echo Gwent Git Initializer
echo ==========================================
cd /d "%~dp0"
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed on this system!
    echo Please download and install Git from: https://git-scm.com/
    echo After installing, restart this script.
    pause
    exit /b
)
echo [1/4] Initializing git repository...
git init

echo [2/4] Setting temporary local git author identity...
git config --local user.email "gwent-player@example.com"
git config --local user.name "Gwent Player"

echo [3/4] Adding files to git...
git add .

echo [4/4] Committing files...
git commit -m "Initial commit for Render deployment"

echo ==========================================
echo Step 1 completed successfully!
echo Local Git repository is created.
echo You can now proceed to Step 2 on GitHub.
echo ==========================================
pause
