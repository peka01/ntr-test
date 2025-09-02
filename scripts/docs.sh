#!/bin/bash

echo "Training Management System - Documentation Tools"
echo "================================================"

case "$1" in
    "serve")
        echo "Starting MkDocs development server..."
        mkdocs serve
        ;;
    "build")
        echo "Building documentation site..."
        mkdocs build
        ;;
    "deploy")
        echo "Deploying to GitHub Pages..."
        mkdocs gh-deploy
        ;;
    "install")
        echo "Installing MkDocs and dependencies..."
        pip install -r requirements.txt
        ;;
    *)
        echo "Usage: ./docs.sh [command]"
        echo ""
        echo "Commands:"
        echo "  serve   - Start development server (http://127.0.0.1:8000)"
        echo "  build   - Build static site to 'site' directory"
        echo "  deploy  - Deploy to GitHub Pages"
        echo "  install - Install Python dependencies"
        echo ""
        echo "Examples:"
        echo "  ./docs.sh install"
        echo "  ./docs.sh serve"
        echo "  ./docs.sh build"
        echo "  ./docs.sh deploy"
        ;;
esac


