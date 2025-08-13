# 🎯 Image Labeling Tool

A comprehensive web-based image labeling tool designed for adding precise keypoints to images with advanced features for research, computer vision, and machine learning projects.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.6+-brightgreen.svg)

## ✨ Key Features

### 🖼️ Image Management
- **Multi-format Support**: JPEG, PNG, GIF, BMP, and WebP images
- **Drag & Drop Interface**: Simply drag images onto the canvas
- **Responsive Design**: Works on desktop and tablet devices
- **Real-time Image Info**: Displays dimensions and metadata

### 🎯 Precision Keypoint Labeling
- **Sub-pixel Precision**: Coordinates stored with 6 decimal places
- **Named Keypoints**: Each point can have a custom, editable name
- **Visual Highlighting**: Click keypoints in the list to highlight them on the image
- **Dual Coordinate Storage**: Original image coordinates preserved regardless of zoom/pan

### 🔧 Interactive Tools
- **Mode-based Operation**: 
  - **Navigation Mode**: Pan, zoom, and select keypoints
  - **Add Keypoint Mode**: Click to add new points
- **Smart Interaction**:
  - Drag keypoints to reposition them
  - Right-click to delete keypoints
  - Double-click names to edit them
  - Click list items to highlight corresponding points

### 🔍 Advanced Zoom & Pan
- **Mouse Wheel Zoom**: Smooth zooming with 10x magnification range (0.1x - 10x)
- **Pan Navigation**: Drag to move around zoomed images
- **Keyboard Shortcuts**: `+`/`-` for zoom, `0` to reset, `Esc` to exit modes
- **Zoom Controls**: Dedicated buttons with real-time zoom percentage display

### 💾 Data Management
- **JSON Export/Import**: Save and load label files with complete metadata
- **Drag & Drop Labels**: Drop JSON files to instantly load saved work
- **Format Validation**: Automatic validation of imported label files
- **Metadata Tracking**: Timestamps, tool version, and feature flags included

### 🎨 User Experience
- **Intuitive Interface**: Clean sidebar with organized controls
- **Real-time Feedback**: Live mouse coordinates and point counter
- **Visual Cues**: Mode indicators, hover effects, and selection highlighting
- **Cross-platform**: Works on Windows, macOS, and Linux

## 🚀 Quick Start

### Option 1: One-Click Launch (Recommended)

#### Windows Users
```bash
# Double-click this file in Explorer
start_server.bat
```

#### Linux/Mac Users
```bash
# Make executable and run
chmod +x start_server.sh
./start_server.sh
```

### Option 2: Python Command Line
```bash
# Basic usage (opens browser automatically)
python launch_server.py

# Custom port
python launch_server.py --port 8080

# Don't open browser automatically
python launch_server.py --no-browser

# Custom host and port
python launch_server.py --host 0.0.0.0 --port 8080
```

### Option 3: Direct Python
```bash
# Simple HTTP server
python -m http.server 8000
```

## 📋 How to Use

### 1. **Upload an Image**
- Click "Upload Image" button, or
- Drag and drop an image file onto the canvas

### 2. **Add Keypoints**
- Click "Add Keypoint Mode" to enable point addition
- Click anywhere on the image to add a keypoint
- Each point gets an automatic name (e.g., "Point 1")

### 3. **Manage Keypoints**
- **Move**: Drag any keypoint to a new position
- **Rename**: Double-click the name in the sidebar list
- **Delete**: Right-click on a keypoint
- **Select**: Click a keypoint name in the list to highlight it

### 4. **Navigate Large Images**
- **Zoom**: Use mouse wheel or +/- keys
- **Pan**: Drag the image when zoomed in
- **Reset**: Click "Reset Zoom" or press `0`

### 5. **Save Your Work**
- Click "Download Labels (JSON)" to export
- Save the JSON file for later use
- Drag the JSON file back to load previous work

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `+` or `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom to 100% |
| `Esc` | Exit Add Keypoint Mode |

## 📁 File Formats

### Supported Image Formats
- JPEG/JPG
- PNG
- GIF
- BMP
- WebP

### JSON Label Format
```json
{
  "image": {
    "width": 1920,
    "height": 1080,
    "filename": "example.jpg"
  },
  "keypoints": [
    {
      "id": 1,
      "name": "Left Eye",
      "x": 645.123456,
      "y": 432.987654,
      "coordinates_type": "original_image_pixels"
    }
  ],
  "metadata": {
    "created_at": "2025-08-13T18:12:08.123Z",
    "tool_version": "2.0.0",
    "total_keypoints": 1,
    "features": ["named_keypoints", "drag_drop_support", "mode_switching"]
  }
}
```

## 🛠️ Technical Details

### Architecture
- **Frontend**: Pure HTML5, CSS3, and JavaScript (ES6+)
- **Backend**: Python HTTP server (built-in `http.server`)
- **Canvas**: HTML5 Canvas API for high-performance rendering
- **No Dependencies**: Works out-of-the-box with Python 3.6+

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance
- Handles images up to 10K+ resolution
- Smooth zooming and panning
- Efficient memory usage with canvas optimization
- Responsive on devices with 4GB+ RAM

## 🔧 Server Configuration

### Command Line Options
```bash
python launch_server.py [OPTIONS]

Options:
  --port PORT          Server port (default: 8000)
  --host HOST          Server host (default: localhost)
  --no-browser         Don't open browser automatically
  --help              Show help message
```

### Port Management
The server automatically finds available ports if the default is busy:
- Tries ports 8000-8010
- Reports the actual port being used
- Handles port conflicts gracefully

## 📊 Use Cases

### Research & Academia
- **Computer Vision**: Facial landmarks, object keypoints
- **Medical Imaging**: Anatomical point annotation
- **Robotics**: Object pose estimation training data

### Industry Applications
- **Quality Control**: Product defect marking
- **Sports Analysis**: Athlete pose tracking
- **Manufacturing**: Precision measurement points

### Machine Learning
- **Training Data**: Ground truth keypoint generation
- **Data Augmentation**: Precise coordinate preservation
- **Model Validation**: Comparing predictions vs. labels

## 🐛 Troubleshooting

### Common Issues

**Image not loading?**
- Check file format is supported
- Ensure file size is reasonable (<50MB)
- Try refreshing the page

**Keypoints not appearing after loading JSON?**
- This was a known issue that has been fixed in v2.0.0
- Ensure you're using the latest version

**Zoom/pan not working?**
- Make sure you're in Navigation Mode (not Add Keypoint Mode)
- Try refreshing if behavior seems stuck

**Server won't start?**
- Check if Python is installed (`python --version`)
- Try a different port: `python launch_server.py --port 8080`
- Ensure no firewall is blocking the connection

### Getting Help
- Check the browser console for error messages (F12)
- Ensure JavaScript is enabled
- Try clearing browser cache
- Use latest version of a supported browser

## 🚀 Advanced Features

### Coordinate Precision
- All coordinates stored as floating-point numbers
- 6 decimal place precision (0.000001 pixel accuracy)
- Automatic scaling maintains precision across zoom levels

### Data Integrity
- Original image coordinates always preserved
- Display coordinates calculated dynamically
- Handles window resizing without data loss

### Export Metadata
- Creation timestamps for audit trails
- Tool version for compatibility tracking
- Feature flags for capability detection

## 📈 Version History

### v2.0.0 (Current)
- ✅ Visual keypoint highlighting system
- ✅ Fixed JSON label loading bug
- ✅ Enhanced coordinate precision
- ✅ Improved drag & drop interface
- ✅ Added comprehensive keyboard shortcuts

### v1.9.0
- ✅ Mode-based interaction system
- ✅ Named keypoint support
- ✅ Drag & drop functionality
- ✅ Enhanced UI with sidebar

### v1.0.0
- ✅ Basic keypoint labeling
- ✅ Zoom and pan functionality
- ✅ JSON export/import
- ✅ Python server integration

## 📄 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

This tool was built to be simple, effective, and extensible. Suggestions and improvements welcome!

---

**Happy Labeling! 🎯**
python launch_server.py --port 8080

# Don't open browser automatically
python launch_server.py --no-browser

# Allow external connections
python launch_server.py --host 0.0.0.0 --port 8080

# Help
python launch_server.py --help
```

## How to Use

### Getting Started

#### Option 1: Using Python Server (Recommended)
1. **Quick Start**: Double-click `start_server.bat` (Windows) or `start_server.sh` (Linux/Mac)
2. **Manual Start**: Open terminal/command prompt and run:
   ```bash
   python launch_server.py
   ```
3. The browser will open automatically at `http://localhost:8000`
4. Click "Upload Image" to select an image file
5. Start labeling by clicking on the image

#### Option 2: Direct File Opening
1. Open `index.html` directly in a web browser
2. Note: Some features may be limited due to browser security restrictions

### Python Server Features
- **Cross-platform**: Works on Windows, Mac, and Linux
- **No installation required**: Uses only Python standard library
- **Automatic browser opening**: Launches your default browser
- **Custom port support**: Use `--port` flag to change port
- **Command line options**: Run `python launch_server.py --help` for all options

### Adding Keypoints
- **Click "Add Keypoint Mode"** to enter keypoint placement mode
- **Left-click** anywhere on the image to add a new keypoint
- **Press Escape** or click "Navigation Mode" to return to navigation
- Keypoints are numbered automatically and have editable names

### Editing Keypoints
- **Drag** any keypoint to move it to a new location
- **Right-click** on a keypoint to delete it
- **Click** keypoint names in the sidebar list to edit them
- Use "Clear All Points" button to remove all keypoints

### Loading Labels
- **Drag & drop** JSON label files onto the interface
- **Click "Load Labels"** to browse and select a JSON file
- Automatic validation ensures proper file format
- Warning if image dimensions don't match current image

### Drag & Drop Support
- **Images**: Drag any image file onto the interface to load it
- **JSON Labels**: Drag JSON label files to load existing annotations
- **Visual feedback**: Overlay appears when dragging files over the interface

### Navigation
- **Mouse wheel**: Zoom in/out
- **Drag** (when not on a keypoint): Pan around the image
- **Zoom buttons**: Use the sidebar controls for precise zoom levels
- **Keyboard shortcuts**:
  - `+` or `=`: Zoom in
  - `-`: Zoom out
  - `0`: Reset zoom to 100%
  - `Escape`: Exit keypoint mode (return to navigation)

### Exporting Labels
1. Click "Download Labels (JSON)" when finished labeling
2. The JSON file contains:
   - Original image dimensions
   - Keypoint coordinates in original image pixels
   - Metadata including creation timestamp

## JSON Output Format

```json
{
  "image": {
    "width": 1920,
    "height": 1080,
    "filename": "example.jpg"
  },
  "keypoints": [
    {
      "id": 1,
      "name": "Left Eye",
      "x": 456.123456,
      "y": 789.654321,
      "coordinates_type": "original_image_pixels"
    },
    {
      "id": 2,
      "name": "Right Eye",
      "x": 678.987654,
      "y": 791.234567,
      "coordinates_type": "original_image_pixels"
    }
  ],
  "metadata": {
    "created_at": "2025-08-13T10:30:00.000Z",
    "tool_version": "2.0.0",
    "total_keypoints": 2,
    "features": ["named_keypoints", "drag_drop_support", "mode_switching"]
  }
}
```

## Technical Details

### Coordinate System
- Keypoints are stored in original image pixel coordinates
- Sub-pixel precision is maintained (6 decimal places)
- Coordinates are relative to the top-left corner (0,0)

### Browser Compatibility
- Modern browsers with HTML5 Canvas support
- Chrome, Firefox, Safari, Edge (latest versions)
- No external dependencies required

### File Structure
- `index.html`: Main HTML structure
- `styles.css`: Complete styling and responsive design
- `script.js`: Core functionality and interactions
- `launch_server.py`: Python HTTP server script
- `start_server.bat`: Windows quick-launch script
- `start_server.sh`: Linux/Mac quick-launch script
- `requirements.txt`: Python dependencies (standard library only)

## Features Overview

### User Interface
- **Header**: Upload controls, mode switcher, and action buttons
- **Sidebar**: Instructions, mode indicator, zoom controls, keypoint list, and image info
- **Main Canvas**: Interactive image display area with drag & drop support

### Mode System
- **Navigation Mode**: Default mode for panning, zooming, and moving keypoints
- **Add Keypoint Mode**: Dedicated mode for placing new keypoints
- **Visual indicators**: Mode display and button states show current mode

### Drag & Drop Interface
- **Universal support**: Works with images and JSON label files
- **Visual feedback**: Overlay indication when dragging files
- **Smart detection**: Automatically recognizes file types

### Named Keypoints
- **Editable names**: Each keypoint can have a custom name
- **Inline editing**: Double-click names in the sidebar to edit
- **Export support**: Names are preserved in JSON exports

### Responsive Design
- Adapts to different screen sizes
- Mobile-friendly interface
- Accessible controls and navigation

### Visual Feedback
- Keypoints change color on hover
- Mouse cursor changes based on context
- Real-time coordinate display
- Zoom level indicator

## Tips for Best Results

1. **High-Resolution Images**: Use high-quality images for better precision
2. **Zoom for Precision**: Zoom in when placing keypoints for sub-pixel accuracy
3. **Systematic Labeling**: Number keypoints consistently across similar images
4. **Regular Saves**: Download labels frequently to avoid data loss
5. **Browser Performance**: Close other tabs for better performance with large images

## Troubleshooting

### Common Issues
- **Image not loading**: Check file format (use JPG, PNG, GIF)
- **Slow performance**: Try smaller images or close other browser tabs
- **Keypoints not precise**: Zoom in more before placing points

### Browser Support
- Ensure JavaScript is enabled
- Use a modern browser with Canvas support
- Check if file access is allowed (some browsers block local files)

## Future Enhancements

Potential features for future versions:
- Keypoint categories/labels
- Batch processing multiple images
- Undo/redo functionality
- Custom keypoint colors
- Import existing JSON labels
- Export to other formats (CSV, XML)

## License

This tool is provided as-is for educational and research purposes.
