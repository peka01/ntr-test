# Docker Deployment Guide

This guide will help you build and deploy the Training Management System using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- Gemini API key (optional, for AI features)

## Quick Start

### 1. Set up Environment Variables

Create a `.env` file in the root directory:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Production Deployment

Build and run the production version:

```bash
# Standard build (slower but more reliable)
docker-compose up --build

# Fast build (optimized for speed)
docker build -f Dockerfile.fast -t training-management-app:fast .
docker run -p 3000:80 training-management-app:fast

# Or run in detached mode
docker-compose up --build -d
```

The app will be available at `http://localhost:3000`

### 3. Development Mode

For development with hot reloading:

```bash
# Standard development build
docker-compose -f docker-compose.dev.yml up --build

# Quick development (no build required, fastest startup)
docker-compose -f docker-compose.quick.yml up

# Or run in detached mode
docker-compose -f docker-compose.quick.yml up -d
```

The development server will be available at `http://localhost:5173`

## Docker Commands

### Build the Image

```bash
# Production build
docker build -t training-management-app .

# Development build
docker build -f Dockerfile.dev -t training-management-app:dev .
```

### Run the Container

```bash
# Production
docker run -p 3000:80 -e GEMINI_API_KEY=your_key training-management-app

# Development
docker run -p 5173:5173 -v $(pwd):/app -e GEMINI_API_KEY=your_key training-management-app:dev
```

### Stop the Application

```bash
# Stop docker-compose services
docker-compose down

# Stop development services
docker-compose -f docker-compose.dev.yml down
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | No | - |
| `NODE_ENV` | Node.js environment | No | production |

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use, modify the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Change 3000 to 8080
```

### Build Issues

If you encounter build issues:

1. Clear Docker cache:
   ```bash
   docker system prune -a
   ```

2. Rebuild without cache:
   ```bash
   docker-compose build --no-cache
   ```

### Permission Issues

On Linux/macOS, you might need to run Docker commands with sudo:

```bash
sudo docker-compose up --build
```

## Production Considerations

1. **Environment Variables**: Always use environment variables for sensitive data
2. **HTTPS**: Configure SSL/TLS for production deployments
3. **Load Balancing**: Consider using a reverse proxy like Traefik or Nginx
4. **Monitoring**: Add health checks and monitoring
5. **Backup**: Implement backup strategies for your data

## Scaling

To scale the application:

```bash
# Scale to multiple instances
docker-compose up --scale training-management-app=3
```

## Cleanup

To remove all containers and images:

```bash
# Stop and remove containers
docker-compose down

# Remove images
docker rmi training-management-app

# Clean up unused resources
docker system prune
```
