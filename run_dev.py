#!/usr/bin/env python3
"""
Development server runner for Wild Wolf Guild App
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == '__main__':
    # Set environment to development
    os.environ['FLASK_ENV'] = 'development'
    os.environ['FLASK_DEBUG'] = '1'
    
    # Import and run the app
    from app import app, socketio
    
    print("🚀 Starting Wild Wolf Guild Backend Server...")
    print("📡 Backend API: http://localhost:5000")
    print("🔄 WebSocket: ws://localhost:5000")
    print("💾 Database: MySQL")
    print("📝 Environment: Development")
    print("⚡ Real-time features enabled")
    
    # Run with SocketIO
    socketio.run(
        app, 
        debug=True, 
        host='0.0.0.0', 
        port=5000,
        use_reloader=True,
        log_output=True
    )