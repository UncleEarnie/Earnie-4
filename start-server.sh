#!/bin/bash

# Uncle Earnie - Start Email Server
# This script installs dependencies and starts the Node.js server

echo ""
echo "============================================"
echo "  Uncle Earnie Email Server Starter"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please install Node.js from: https://nodejs.org"
    echo "Then come back and run this script again."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo ""
    echo "WARNING: .env file not found!"
    echo ""
    echo "Please create a .env file with:"
    echo "  SENDGRID_API_KEY=your_api_key_here"
    echo "  SENDGRID_FROM_EMAIL=your_email@example.com"
    echo "  PORT=3001"
    echo ""
    echo "See SENDGRID_SETUP.md for details."
    echo ""
    read -p "Press Enter to continue..."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies (this may take a minute)..."
    echo ""
    npm install
    echo ""
fi

# Start the server
echo ""
echo "Starting Uncle Earnie Email Server..."
echo ""
echo "✓ Server running on http://localhost:3001"
echo "✓ Open your site and test email verification"
echo "✓ Press Ctrl+C to stop the server"
echo ""

node server.js
