class ImageLabelingTool {
    constructor() {
        this.canvas = document.getElementById('imageCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.imageContainer = document.getElementById('imageContainer');
        
        this.image = null;
        this.keypoints = [];
        this.isDragging = false;
        this.dragIndex = -1;
        this.isPanning = false;
        this.lastPanPoint = { x: 0, y: 0 };
        this.isCtrlPanning = false; // Add flag for Ctrl+click panning

        
        // New mode system
        this.mode = 'navigation'; // 'navigation' or 'keypoint'
        this.nextKeypointId = 1;
        this.selectedKeypointIndex = -1; // Track selected keypoint for highlighting
        
        // Zoom and pan properties
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.minScale = 0.1;
        this.maxScale = 10;
        
        // Image properties
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.displayWidth = 0;
        this.displayHeight = 0;

        this.uploadfilename = '';
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File upload
        document.getElementById('imageUpload').addEventListener('change', (e) => {
            this.uploadfilename = e.target.files[0].name;
            this.loadImage(e.target.files[0]);
        });

        // Label upload
        document.getElementById('labelUpload').addEventListener('change', (e) => {
            this.loadLabels(e.target.files[0]);
        });

        // Control buttons
        document.getElementById('addKeypointMode').addEventListener('click', () => {
            this.toggleKeypointMode();
        });

        document.getElementById('clearPoints').addEventListener('click', () => {
            this.clearAllPoints();
        });

        document.getElementById('downloadJson').addEventListener('click', () => {
            this.downloadLabels();
        });

        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoomIn();
        });

        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoomOut();
        });

        document.getElementById('resetZoom').addEventListener('click', () => {
            this.resetZoom();
        });

        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleRightClick(e));

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Window resize handler
        window.addEventListener('resize', () => {
            if (this.image) {
                // Delay resize to allow DOM to update
                setTimeout(() => {
                    this.setupCanvas();
                }, 100);
            }
        });

        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Drag and drop functionality
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    handleDragEnter(e) {
        e.preventDefault();
        document.getElementById('dragOverlay').classList.add('active');
    }

    handleDragLeave(e) {
        e.preventDefault();
        // Only hide if leaving the container entirely
        if (!this.imageContainer.contains(e.relatedTarget)) {
            document.getElementById('dragOverlay').classList.remove('active');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        document.getElementById('dragOverlay').classList.remove('active');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                this.uploadfilename = file.name;
                this.loadImage(file);
            } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
                this.loadLabels(file);
            } else {
                alert('Please drop an image file or JSON label file.');
            }
        }
    }

    // Mode management
    toggleKeypointMode() {
        if (this.mode === 'navigation') {
            this.mode = 'keypoint';
            document.getElementById('addKeypointMode').textContent = 'Navigation Mode';
            document.getElementById('addKeypointMode').classList.add('active');
            document.getElementById('currentMode').textContent = 'Add Keypoint Mode';
            document.getElementById('currentMode').classList.add('keypoint-mode');
            this.canvas.style.cursor = 'crosshair';
        } else {
            this.mode = 'navigation';
            document.getElementById('addKeypointMode').textContent = 'Add Keypoint Mode';
            document.getElementById('addKeypointMode').classList.remove('active');
            document.getElementById('currentMode').textContent = 'Navigation Mode';
            document.getElementById('currentMode').classList.remove('keypoint-mode');
            this.canvas.style.cursor = 'grab';
        }
    }

    loadLabels(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const labelData = JSON.parse(e.target.result);
                
                // Validate the JSON structure
                if (!labelData.keypoints || !Array.isArray(labelData.keypoints)) {
                    alert('Invalid label file format. Missing keypoints array.');
                    return;
                }

                // If there's image info in the labels, check if it matches current image
                if (labelData.image && this.image) {
                    if (labelData.image.width !== this.imageWidth || 
                        labelData.image.height !== this.imageHeight) {
                        const proceed = confirm(
                            `Label file image dimensions (${labelData.image.width}×${labelData.image.height}) ` +
                            `don't match current image (${this.imageWidth}×${this.imageHeight}). ` +
                            `Load labels anyway?`
                        );
                        if (!proceed) return;
                    }
                }

                // Load keypoints - store in original image coordinates
                this.keypoints = labelData.keypoints.map(point => {
                    return {
                        // Store in original image coordinates
                        originalX: point.x,
                        originalY: point.y,
                        name: point.name || `Point ${point.id || this.nextKeypointId++}`,
                        id: point.id || this.nextKeypointId++
                    };
                });

                // Update next ID
                if (this.keypoints.length > 0) {
                    this.nextKeypointId = Math.max(...this.keypoints.map(p => p.id)) + 1;
                }

                // Convert original coordinates to display coordinates for rendering
                this.updateKeypointDisplayCoordinates();
                
                this.draw();
                this.updateKeypointsList();
                
                alert(`Loaded ${this.keypoints.length} keypoints from ${file.name}`);

            } catch (error) {
                alert('Error reading label file. Please ensure it\'s a valid JSON file.');
                console.error('Label loading error:', error);
            }
        };
        reader.readAsText(file);
    }

    loadImage(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.image = new Image();
            this.image.onload = () => {
                this.imageWidth = this.image.width;
                this.imageHeight = this.image.height;
                this.setupCanvas();
                this.updateImageInfo(file);
                this.clearAllPoints();
                document.getElementById('noImageMessage').style.display = 'none';
            };
            this.image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    loadImageFromUrl(url) {
        if (!url) return;

        // Extract filename from URL
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1] || 'loaded_image.jpg';
        this.uploadfilename = filename;

        // Create image element and load from URL
        this.image = new Image();
        this.image.crossOrigin = 'anonymous'; // Handle CORS if needed
        
        this.image.onload = () => {
            this.imageWidth = this.image.width;
            this.imageHeight = this.image.height;
            this.setupCanvas();
            
            // Update image info with URL-loaded image
            const fakeFile = {
                name: filename,
                size: 0, // Size unknown for URL-loaded images
                type: 'image/jpeg'
            };
            this.updateImageInfo(fakeFile);
            this.clearAllPoints();
            document.getElementById('noImageMessage').style.display = 'none';
            
            console.log('Successfully loaded image from URL:', url);
        };
        
        this.image.onerror = () => {
            alert('Failed to load image from URL. Please check the image path and try again.');
            console.error('Failed to load image from URL:', url);
        };
        
        this.image.src = url;
    }

    setupCanvas() {
        const container = this.imageContainer;
        // Get the actual available space
        const containerWidth = container.clientWidth - 40; // Account for padding
        const containerHeight = container.clientHeight - 40;
        
        // Ensure minimum size
        const minWidth = Math.max(containerWidth, 200);
        const minHeight = Math.max(containerHeight, 200);

        // Calculate display size while maintaining aspect ratio
        const imageAspect = this.imageWidth / this.imageHeight;
        const containerAspect = minWidth / minHeight;

        if (imageAspect > containerAspect) {
            this.displayWidth = minWidth;
            this.displayHeight = minWidth / imageAspect;
        } else {
            this.displayHeight = minHeight;
            this.displayWidth = minHeight * imageAspect;
        }

        // Set canvas internal resolution
        this.canvas.width = this.displayWidth;
        this.canvas.height = this.displayHeight;
        
        // Ensure canvas CSS size matches internal size for 1:1 pixel ratio
        this.canvas.style.width = this.displayWidth + 'px';
        this.canvas.style.height = this.displayHeight + 'px';

        // Recalculate keypoint display positions after canvas resize
        this.updateKeypointDisplayCoordinates();

        // Only reset zoom if this is initial setup, not window resize
        if (!this.image.setupComplete) {
            this.resetZoom();
            this.image.setupComplete = true;
        }
        
        this.draw();
    }

    updateKeypointDisplayCoordinates() {
        // Update all keypoint display coordinates based on current canvas size
        // This is called when canvas is resized to keep keypoints in correct positions
        this.keypoints.forEach(point => {
            if (point.originalX !== undefined && point.originalY !== undefined) {
                // Use stored original coordinates
                const displayCoords = this.getDisplayCoordinates(point.originalX, point.originalY);
                point.x = displayCoords.x;
                point.y = displayCoords.y;
            } else if (point.x !== undefined && point.y !== undefined) {
                // Backwards compatibility: convert current display coordinates to original coordinates
                const originalCoords = this.getOriginalImageCoordinates(point.x, point.y);
                point.originalX = originalCoords.x;
                point.originalY = originalCoords.y;
                // Then recalculate display coordinates for new canvas size
                const newDisplayCoords = this.getDisplayCoordinates(point.originalX, point.originalY);
                point.x = newDisplayCoords.x;
                point.y = newDisplayCoords.y;
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.image) return;

        this.ctx.save();
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.scale, this.scale);

        // Draw image
        this.ctx.drawImage(this.image, 0, 0, this.displayWidth, this.displayHeight);

        // Draw keypoints
        this.keypoints.forEach((point, index) => {
            this.drawKeypoint(point.x, point.y, index);
        });

        this.ctx.restore();
    }

    drawKeypoint(x, y, index) {
        const radius = 6 / this.scale; // Maintain visual size regardless of zoom
        const isSelected = index === this.selectedKeypointIndex;
        
        // Different colors for selected vs normal keypoints
        if (isSelected) {
            this.ctx.fillStyle = '#ffa726'; // Orange for selected
            this.ctx.strokeStyle = '#ff9800';
            this.ctx.lineWidth = 3 / this.scale; // Thicker border for selected
        } else {
            this.ctx.fillStyle = '#ff4757'; // Red for normal
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2 / this.scale;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();

        // Add a glow effect for selected keypoint
        if (isSelected) {
            this.ctx.save();
            this.ctx.shadowColor = '#ff9800';
            this.ctx.shadowBlur = 10 / this.scale;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius + 2 / this.scale, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Draw point number
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `${12 / this.scale}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText((index + 1).toString(), x, y + 4 / this.scale);
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        // Get the device pixel ratio for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        
        // Calculate the actual scale factor between canvas size and display size
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        // Get mouse position relative to canvas element
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        // Convert to image coordinates accounting for pan and zoom
        const imageX = (mouseX - this.panX) / this.scale;
        const imageY = (mouseY - this.panY) / this.scale;

        return { x: imageX, y: imageY };
    }

    getOriginalImageCoordinates(displayX, displayY) {
        // Convert display coordinates to original image coordinates
        const originalX = (displayX / this.displayWidth) * this.imageWidth;
        const originalY = (displayY / this.displayHeight) * this.imageHeight;
        return { x: originalX, y: originalY };
    }

    getDisplayCoordinates(originalX, originalY) {
        // Convert original image coordinates to display coordinates
        const displayX = (originalX / this.imageWidth) * this.displayWidth;
        const displayY = (originalY / this.imageHeight) * this.displayHeight;
        return { x: displayX, y: displayY };
    }

    handleMouseDown(e) {
        if (!this.image) return;

        const pos = this.getMousePos(e);

        // Check for Ctrl+click panning in keypoint mode
        if (e.ctrlKey && e.button === 0 && this.mode === 'keypoint') {
            e.preventDefault();
            this.isCtrlPanning = true;
            this.lastPanPoint = { x: e.clientX, y: e.clientY };
            this.canvas.style.cursor = 'grabbing';
            return;
        }
        
        // Check if clicking on existing keypoint
        const clickedPointIndex = this.getKeypointAtPosition(pos.x, pos.y);
        
        if (clickedPointIndex !== -1) {
            // Select the clicked keypoint
            this.selectKeypoint(clickedPointIndex);
            this.isDragging = true;
            this.dragIndex = clickedPointIndex;
            this.canvas.style.cursor = 'grabbing';
        } else if (e.button === 0) { // Left click
            // Clear selection when clicking elsewhere
            if (this.selectedKeypointIndex !== -1) {
                this.selectedKeypointIndex = -1;
                this.updateKeypointsList();
                this.draw();
            }
            
            if (this.mode === 'keypoint' && this.isPointInImage(pos.x, pos.y)) {
                // Add new keypoint
                this.addKeypoint(pos.x, pos.y);
            } else if (this.mode === 'navigation') {
                // Start panning
                this.isPanning = true;
                this.lastPanPoint = { x: e.clientX, y: e.clientY };
                this.canvas.style.cursor = 'grabbing';
            }
        }
    }

    handleMouseMove(e) {
        const pos = this.getMousePos(e);
        this.updateMouseCoordinates(pos.x, pos.y);

        if (this.isDragging && this.dragIndex !== -1) {
            // Move keypoint
            if (this.isPointInImage(pos.x, pos.y)) {
                // Update both display and original coordinates
                this.keypoints[this.dragIndex].x = pos.x;
                this.keypoints[this.dragIndex].y = pos.y;
                
                // Update original coordinates for persistence
                const originalCoords = this.getOriginalImageCoordinates(pos.x, pos.y);
                this.keypoints[this.dragIndex].originalX = originalCoords.x;
                this.keypoints[this.dragIndex].originalY = originalCoords.y;
                
                this.draw();
                this.updateKeypointsList();
            }
        } else if (this.isPanning || this.isCtrlPanning) {
            // Pan image
            const deltaX = e.clientX - this.lastPanPoint.x;
            const deltaY = e.clientY - this.lastPanPoint.y;
            
            this.panX += deltaX;
            this.panY += deltaY;
            
            this.lastPanPoint = { x: e.clientX, y: e.clientY };
            this.draw();
        } else {
            // Update cursor based on what's under mouse
            const pointIndex = this.getKeypointAtPosition(pos.x, pos.y);
            if (pointIndex !== -1) {
                this.canvas.style.cursor = 'grab';
            } else if (this.mode === 'keypoint' && this.isPointInImage(pos.x, pos.y)) {
                this.canvas.style.cursor = 'crosshair';
            } else if (this.mode === 'navigation') {
                this.canvas.style.cursor = 'grab';
            }
        }
    }

    handleMouseUp(e) {
        this.isDragging = false;
        this.isPanning = false;
        this.dragIndex = -1;
        this.isCtrlPanning = false; // Reset Ctrl+click panning

        // Reset cursor based on mode
        if (this.mode === 'keypoint') {
            this.canvas.style.cursor = 'crosshair';
        } else {
            this.canvas.style.cursor = 'grab';
        }
    }

    handleRightClick(e) {
        e.preventDefault();
        if (!this.image) return;

        const pos = this.getMousePos(e);
        const clickedPointIndex = this.getKeypointAtPosition(pos.x, pos.y);
        
        if (clickedPointIndex !== -1) {
            this.removeKeypoint(clickedPointIndex);
        }
    }

    handleWheel(e) {
        e.preventDefault();
        if (!this.image) return;

        const rect = this.canvas.getBoundingClientRect();
        
        // Get the device pixel ratio for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        
        // Calculate the actual scale factor between canvas size and display size
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        // Get mouse position relative to canvas element
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        const wheel = e.deltaY < 0 ? 1 : -1;
        const zoomIntensity = 0.1;
        const zoom = Math.exp(wheel * zoomIntensity);

        const newScale = this.scale * zoom;
        if (newScale < this.minScale || newScale > this.maxScale) return;

        // Zoom towards mouse position
        this.panX = mouseX - (mouseX - this.panX) * zoom;
        this.panY = mouseY - (mouseY - this.panY) * zoom;
        this.scale = newScale;

        this.updateZoomDisplay();
        this.draw();
    }

    handleKeyDown(e) {
        if (!this.image) return;

        switch(e.key) {
            case '+':
            case '=':
                this.zoomIn();
                break;
            case '-':
                this.zoomOut();
                break;
            case '0':
                this.resetZoom();
                break;
            case 'Control':
                // Update cursor when Ctrl is pressed in keypoint mode
                if (this.mode === 'keypoint' && !this.isDragging && !this.isPanning && !this.isCtrlPanning) {
                    this.canvas.style.cursor = 'grab';
                }
                break;                
            case 'Escape':
                if (this.mode === 'keypoint') {
                    this.toggleKeypointMode();
                }
                break;
        }
    }

    // Add new method to handle key up events
    handleKeyUp(e) {
        if (!this.image) return;

        switch(e.key) {
            case 'Control':
                // Update cursor when Ctrl is released in keypoint mode
                if (this.mode === 'keypoint' && !this.isDragging && !this.isPanning && !this.isCtrlPanning) {
                    this.canvas.style.cursor = 'crosshair';
                }
                break;
        }
    }

    getKeypointAtPosition(x, y) {
        const threshold = 10 / this.scale; // Adjust for zoom level
        
        for (let i = this.keypoints.length - 1; i >= 0; i--) {
            const point = this.keypoints[i];
            const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
            if (distance <= threshold) {
                return i;
            }
        }
        return -1;
    }

    isPointInImage(x, y) {
        return x >= 0 && x <= this.displayWidth && y >= 0 && y <= this.displayHeight;
    }

    addKeypoint(x, y) {
        // Convert display coordinates to original image coordinates for storage
        const originalCoords = this.getOriginalImageCoordinates(x, y);
        
        const newPoint = {
            // Store both display and original coordinates
            x: x,  // Display coordinates for immediate use
            y: y,
            originalX: originalCoords.x,  // Original coordinates for persistence
            originalY: originalCoords.y,
            name: `Point ${this.nextKeypointId}`,
            id: this.nextKeypointId
        };
        this.keypoints.push(newPoint);
        this.nextKeypointId++;
        this.draw();
        this.updateKeypointsList();
    }

    removeKeypoint(index) {
        this.keypoints.splice(index, 1);
        
        // Adjust selection if needed
        if (this.selectedKeypointIndex === index) {
            this.selectedKeypointIndex = -1; // Deselect if removing selected keypoint
        } else if (this.selectedKeypointIndex > index) {
            this.selectedKeypointIndex--; // Adjust index if removing keypoint before selected
        }
        
        this.draw();
        this.updateKeypointsList();
    }

    clearAllPoints() {
        this.keypoints = [];
        this.nextKeypointId = 1;
        this.selectedKeypointIndex = -1; // Clear selection
        this.draw();
        this.updateKeypointsList();
    }

    zoomIn() {
        const newScale = this.scale * 1.2;
        if (newScale <= this.maxScale) {
            this.scale = newScale;
            this.updateZoomDisplay();
            this.draw();
        }
    }

    zoomOut() {
        const newScale = this.scale / 1.2;
        if (newScale >= this.minScale) {
            this.scale = newScale;
            this.updateZoomDisplay();
            this.draw();
        }
    }

    resetZoom() {
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateZoomDisplay();
        this.draw();
    }

    updateZoomDisplay() {
        document.getElementById('zoomDisplay').textContent = Math.round(this.scale * 100) + '%';
    }

    updateMouseCoordinates(x, y) {
        if (this.isPointInImage(x, y)) {
            const originalCoords = this.getOriginalImageCoordinates(x, y);
            document.getElementById('mouseCoords').textContent = 
                `Mouse: (${originalCoords.x.toFixed(2)}, ${originalCoords.y.toFixed(2)})`;
        } else {
            document.getElementById('mouseCoords').textContent = 'Mouse: (-, -)';
        }
    }

    updateImageInfo(file) {
        const imageDetails = document.getElementById('imageDetails');
        imageDetails.innerHTML = `
            <p><strong>File:</strong> ${file.name}</p>
            <p><strong>Size:</strong> ${this.imageWidth} × ${this.imageHeight}px</p>
            <p><strong>File Size:</strong> ${(file.size / 1024).toFixed(1)} KB</p>
        `;
    }

    updateKeypointsList() {
        const pointsList = document.getElementById('pointsList');
        const pointCount = document.getElementById('pointCount');
        
        pointCount.textContent = this.keypoints.length;
        
        if (this.keypoints.length === 0) {
            pointsList.innerHTML = '<p style="color: #6c757d; text-align: center;">No keypoints added</p>';
            return;
        }

        pointsList.innerHTML = this.keypoints.map((point, index) => {
            const isSelected = index === this.selectedKeypointIndex;
            const selectedClass = isSelected ? 'selected' : '';
            return `
                <div class="point-item ${selectedClass}" onclick="labelingTool.selectKeypoint(${index})">
                    <div class="point-index">
                        #${index + 1}
                    </div>
                    <div class="point-name">
                        <input type="text" value="${point.name}" 
                               onchange="labelingTool.updateKeypointName(${index}, this.value)"
                               onblur="this.blur()"
                               onclick="event.stopPropagation()">
                    </div>
                    <button class="delete-point" onclick="event.stopPropagation(); labelingTool.removeKeypoint(${index})">×</button>
                </div>
            `;
        }).join('');
    }

    selectKeypoint(index) {
        // Toggle selection - if already selected, deselect
        if (this.selectedKeypointIndex === index) {
            this.selectedKeypointIndex = -1;
        } else {
            this.selectedKeypointIndex = index;
        }
        
        // Update both list and canvas
        this.updateKeypointsList();
        this.draw();
    }

    updateKeypointName(index, newName) {
        if (index >= 0 && index < this.keypoints.length) {
            this.keypoints[index].name = newName || `Point ${this.keypoints[index].id}`;
        }
    }

    downloadLabels() {
        if (this.keypoints.length === 0) {
            alert('No keypoints to download!');
            return;
        }

        const labels = {
            image: {
                width: this.imageWidth,
                height: this.imageHeight,
                // filename: document.getElementById('imageUpload').files[0]?.name || 'unknown'
                filename: this.uploadfilename? this.uploadfilename : 'unknown'
            },
            keypoints: this.keypoints.map((point, index) => {
                // Use stored original coordinates if available, otherwise calculate from display coordinates
                const originalCoords = (point.originalX !== undefined && point.originalY !== undefined) ? 
                    { x: point.originalX, y: point.originalY } : 
                    this.getOriginalImageCoordinates(point.x, point.y);
                return {
                    id: point.id,
                    name: point.name,
                    x: parseFloat(originalCoords.x.toFixed(6)),
                    y: parseFloat(originalCoords.y.toFixed(6)),
                    coordinates_type: "original_image_pixels"
                };
            }),
            metadata: {
                created_at: new Date().toISOString(),
                tool_version: "2.0.0",
                total_keypoints: this.keypoints.length,
                features: ["named_keypoints", "drag_drop_support", "mode_switching"]
            }
        };

        const dataStr = JSON.stringify(labels, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = this.uploadfilename ?
            this.uploadfilename.replace(/\.[^/.]+$/, ".json") :
            `image_labels_${Date.now()}.json`;
        // link.download = `image_labels_${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }
}

// Initialize the tool when the page loads
let labelingTool;
let serverImageUrl = null;
let serverImagePath = null;

document.addEventListener('DOMContentLoaded', () => {
    labelingTool = new ImageLabelingTool();
    
    // Check for imageUrl and imagePath parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    const imageUrl = urlParams.get('imageUrl');
    const imagePath = urlParams.get('imagePath');
    
    if (imageUrl) {
        console.log('Auto-loading image from URL:', imageUrl);
        console.log('Image path:', imagePath);
        serverImageUrl = imageUrl;  // Store for later use
        serverImagePath = imagePath;  // Store original image path
        labelingTool.loadImageFromUrl(imageUrl);
        
        // Show the Save to Server button
        const saveToServerBtn = document.getElementById('saveToServer');
        if (saveToServerBtn) {
            saveToServerBtn.style.display = 'inline-block';
            
            // Add click handler for Save to Server button
            saveToServerBtn.addEventListener('click', () => {
                saveLabelsToServer();
            });
        }
    }
});

// Function to save labels to server
function saveLabelsToServer() {
    if (!serverImageUrl) {
        alert('No server image URL available');
        return;
    }
    
    // Get the labels data from the tool
    const labels = {
        image: {
            width: labelingTool.imageWidth,
            height: labelingTool.imageHeight,
            filename: labelingTool.uploadfilename || 'unknown'
        },
        keypoints: labelingTool.keypoints.map(point => {
            const originalCoords = (point.originalX !== undefined && point.originalY !== undefined) ? 
                { x: point.originalX, y: point.originalY } : 
                labelingTool.getOriginalImageCoordinates(point.x, point.y);
            return {
                id: point.id,
                name: point.name,
                x: parseFloat(originalCoords.x.toFixed(6)),
                y: parseFloat(originalCoords.y.toFixed(6)),
                coordinates_type: "original_image_pixels"
            };
        }),
        metadata: {
            created_at: new Date().toISOString(),
            tool_version: "2.0.0",
            total_keypoints: labelingTool.keypoints.length,
            features: ["named_keypoints", "drag_drop_support", "mode_switching", "server_save"]
        }
    };
    
    // Extract the server URL from the image URL
    const url = new URL(serverImageUrl);
    const serverBaseUrl = `${url.protocol}//${url.host}`;
    const saveUrl = `${serverBaseUrl}/save_labels`;
    
    console.log('Saving labels to server:', saveUrl);
    console.log('Image path:', serverImagePath);
    
    // Send the labels to the server with image path
    fetch(saveUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            labels: labels,
            image_path: serverImagePath  // Pass back the original image path
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Labels saved to server successfully!');
            console.log('Saved to:', data.path);
        } else {
            alert('Error saving labels: ' + data.message);
        }
    })
    .catch(error => {
        alert('Failed to save labels to server: ' + error);
        console.error('Save error:', error);
    });
}
