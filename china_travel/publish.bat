@echo off
cd /d "%~dp0"
echo ========================================
echo   🚀 Publishing China Explorer...
echo ========================================
echo.
echo Step 1: Starting price + site server on port 8080...
start "Python Server" cmd /c "python serve_prices.py 8080 & echo. & echo Press any key to stop server... & pause >nul"
timeout /t 4 /nobreak >nul
echo.
echo Step 2: Launching ngrok tunnel...
echo.
echo When ngrok loads, copy the "Forwarding" URL (https://xxxx.ngrok-free.dev)
echo and open it in your browser — the home page loads at the root.
echo.
echo Prices page + Refresh button work too (served by serve_prices.py).
echo.
ngrok http http://localhost:8080
