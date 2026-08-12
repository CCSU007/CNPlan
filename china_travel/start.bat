@echo off
cd /d "%~dp0"
title China Explorer - Price Server
echo ============================================
echo   China Explorer - one-click start
echo ============================================
echo.
REM Prefer the project venv Python, else system python
set "PY=python"
if exist "..\.venv\Scripts\python.exe" set "PY=..\.venv\Scripts\python.exe"
if exist ".venv\Scripts\python.exe" set "PY=.venv\Scripts\python.exe"
echo   Starting server on http://localhost:8765/
echo   Prices are regenerated automatically, then your browser opens.
echo   Keep this window open - close it to stop the server.
echo.
"%PY%" serve_prices.py
echo.
echo   Server stopped.
pause
