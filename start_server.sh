#!/bin/bash

# Image Labeling Tool - Quick Launch Script for Linux/Mac
# This script launches the Python server for the Image Labeling Tool

echo ""
echo "========================================"
echo "  Image Labeling Tool - Quick Launch"
echo "========================================"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "ERROR: Python is not installed or not in PATH"
        echo "Please install Python 3.6+ from https://python.org"
        echo ""
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "ERROR: index.html not found"
    echo "Please run this script from the ImageLabelingWeb directory"
    echo ""
    exit 1
fi

echo "Starting Image Labeling Tool server..."
echo ""
echo "The browser will open automatically."
echo "Press Ctrl+C in this terminal to stop the server."
echo ""

# Launch the Python server
$PYTHON_CMD launch_server.py
