#!/usr/bin/env python3
"""
Image Labeling Tool Server
A Flask-based HTTP server to run the Image Labeling website locally.
"""

from flask import Flask, send_from_directory, send_file
import webbrowser
import os
import sys
import argparse
from pathlib import Path


class ImageLabelingServer:
    def __init__(self, port=8080, host='localhost'):
        self.port = port
        self.host = host
        self.server_dir = Path(__file__).parent
        self.app = self.create_app()
        
    def create_app(self):
        """Create and configure Flask application"""
        app = Flask(__name__, 
                   static_folder=str(self.server_dir),
                   static_url_path='')
        
        @app.route('/')
        def index():
            """Serve the main index.html"""
            index_file = self.server_dir / 'index.html'
            if index_file.exists():
                return send_file(str(index_file))
            else:
                return "Error: index.html not found", 404
        
        @app.route('/<path:path>')
        def serve_file(path):
            """Serve static files"""
            return send_from_directory(str(self.server_dir), path)
        
        return app
        
    def start_server(self, open_browser=True):
        """Start the Flask server and optionally open browser"""
        
        server_url = f"http://{self.host}:{self.port}"
        
        print("=" * 60)
        print("🎯 Image Labeling Tool Server (Flask)")
        print("=" * 60)
        print(f"Server running at: {server_url}")
        print(f"Serving files from: {self.server_dir}")
        print("=" * 60)
        print("Features available:")
        print("  • Upload and label images")
        print("  • Sub-pixel precision keypoints")
        print("  • Zoom and pan functionality")
        print("  • Export labels as JSON")
        print("=" * 60)
        print("Press Ctrl+C to stop the server")
        print("=" * 60)
        
        # Open browser if requested
        if open_browser:
            print("Opening browser...")
            webbrowser.open(server_url)
            print()
        
        try:
            # Start Flask server
            # Flask handles SIGTERM/SIGINT properly and cleans up sockets
            self.app.run(
                host=self.host,
                port=self.port,
                debug=False,
                use_reloader=False
            )
        except OSError as e:
            if e.errno == 98 or 'Address already in use' in str(e):
                print(f"❌ Error: Port {self.port} is already in use.")
                print(f"Try a different port: python launch_server.py --port {self.port + 1}")
            else:
                print(f"❌ Error starting server: {e}")
            sys.exit(1)
        except KeyboardInterrupt:
            print("\n\n🛑 Server stopped by user")
            print("Thank you for using the Image Labeling Tool!")
            sys.exit(0)


def main():
    parser = argparse.ArgumentParser(
        description="Launch the Image Labeling Tool web server",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python launch_server.py                    # Start on default port 8080
  python launch_server.py --port 8000       # Start on port 8000
  python launch_server.py --no-browser      # Don't open browser automatically
  python launch_server.py --host 0.0.0.0    # Allow external connections
        """
    )
    
    parser.add_argument(
        '--port', '-p',
        type=int,
        default=8080,
        help='Port to run the server on (default: 8080)'
    )
    
    parser.add_argument(
        '--host',
        default='localhost',
        help='Host to bind the server to (default: localhost)'
    )
    
    parser.add_argument(
        '--no-browser',
        action='store_true',
        help="Don't open browser automatically"
    )
    
    args = parser.parse_args()
    
    # Validate port range
    if not (1024 <= args.port <= 65535):
        print("❌ Error: Port must be between 1024 and 65535")
        sys.exit(1)
    
    # Create and start server
    server = ImageLabelingServer(port=args.port, host=args.host)
    server.start_server(open_browser=not args.no_browser)


if __name__ == "__main__":
    main()
