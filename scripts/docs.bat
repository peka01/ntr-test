@echo off
echo Training Management System - Documentation Tools
echo ================================================

if "%1"=="serve" (
    echo Starting MkDocs development server...
    mkdocs serve
) else if "%1"=="build" (
    echo Building documentation site...
    mkdocs build
) else if "%1"=="deploy" (
    echo Deploying to GitHub Pages...
    mkdocs gh-deploy
) else if "%1"=="install" (
    echo Installing MkDocs and dependencies...
    pip install -r requirements.txt
) else (
    echo Usage: docs.bat [command]
    echo.
    echo Commands:
    echo   serve   - Start development server (http://127.0.0.1:8000)
    echo   build   - Build static site to 'site' directory
    echo   deploy  - Deploy to GitHub Pages
    echo   install - Install Python dependencies
    echo.
    echo Examples:
    echo   docs.bat install
    echo   docs.bat serve
    echo   docs.bat build
    echo   docs.bat deploy
)


