@echo off
cd /d "%~dp0"
echo ========================================
echo   🚀 Publishing China Explorer...
echo ========================================
echo.
echo Step 1: Starting HTTP server on port 8080...
start "Python Server" cmd /c "python -m http.server 8080 & echo. & echo Press any key to stop server... & pause >nul"
timeout /t 3 /nobreak >nul
echo.
echo Step 2: Launching ngrok tunnel...
echo.
echo When ngrok loads, copy the "Forwarding" URL (https://xxxx.ngrok-free.dev)
echo and open it in your browser.
echo.
echo Your site will be at: https://YOUR-URL.ngrok-free.dev/html/index.html
echo.
ngrok http http://localhost:8080
