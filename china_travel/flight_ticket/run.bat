@echo off
title Flight Monitor — Loop Mode
cd /d "%~dp0"
echo ========================================
echo   Flight Monitor - NZ ^<-^> China
echo   Loop Mode — runs every 4 hours
echo   Close this window to stop
echo   %date% %time%
echo ========================================
echo.

C:/Users/chenc/AppData/Local/Python/pythoncore-3.14-64/python.exe main.py --loop

echo.
echo Press any key to exit...
pause >nul
