@echo off

REM Stop any existing containers
echo Stopping existing containers...
docker-compose -f docker-compose.dev.yml down

REM Remove any existing images to ensure clean build
echo Removing existing images...
docker-compose -f docker-compose.dev.yml down --rmi all

REM Build and start the application
echo Building and starting the application...
docker-compose -f docker-compose.dev.yml up --build

echo Application should be available at http://localhost:5173
