# Deployment Guide (Docker)

This project uses a single production-ready Docker setup.

## Prerequisites

- Docker and Docker Compose installed
- Optional: Gemini API key for AI features

## 1) Configure Environment

Create a `.env` file in the project root (optional):

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## 2) Build and Run

Use the single Compose file for production-like builds:

```bash
docker-compose up --build

# Or run detached
docker-compose up --build -d
```

The app will be available at `http://localhost:3000`.

## 3) Stop and Clean Up

```bash
docker-compose down
```

## Troubleshooting

- Port in use: change the left-hand port in `docker-compose.yml` (e.g. `8080:80`).
- Rebuild clean:
  ```bash
  docker-compose build --no-cache
  ```
- Clear Docker cache (aggressive):
  ```bash
  docker system prune -a
  ```
