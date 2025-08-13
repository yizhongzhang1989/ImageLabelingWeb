@echo off
REM Image Labeling Tool - Quick Launch Script for Windows
REM This script launches the Python server for the Image Labeling Tool

echo.
echo ========================================
echo   Image Labeling Tool - Quick Launch
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.6+ from https://python.org
    echo.
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "index.html" (
    echo ERROR: index.html not found
    echo Please run this script from the ImageLabelingWeb directory
    echo.
    pause
    exit /b 1
)

echo Starting Image Labeling Tool server...
echo.
echo The browser will open automatically.
echo Press Ctrl+C in this window to stop the server.
echo.

REM Launch the Python server
python launch_server.py

pause
