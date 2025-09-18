# Frontend Docker Setup

This directory contains Docker configuration for the Next.js frontend application.

## Files Created

### Docker Files
- `Dockerfile` - Production Docker image
- `Dockerfile.dev` - Development Docker image
- `.dockerignore` - Files to exclude from Docker build
- `next.config.ts` - Updated with standalone output for Docker

### Docker Compose Files
- `docker-compose.yml` - Production frontend only
- `docker-compose.dev.yml` - Development frontend only
- `docker-compose.full.yml` - Full stack (frontend + backend)

### Scripts
- `docker-dev.sh` - Start development environment
- `docker-prod.sh` - Start production environment
- `docker-full.sh` - Start full stack environment

## Quick Start

### Development Mode
```bash
# Start frontend development with Docker
./docker-dev.sh

# Or manually
docker-compose -f docker-compose.dev.yml up --build
```

### Production Mode
```bash
# Start frontend production with Docker
./docker-prod.sh

# Or manually
docker-compose up --build -d
```

### Full Stack Mode
```bash
# Start both frontend and backend with Docker
./docker-full.sh

# Or manually
docker-compose -f docker-compose.full.yml up --build -d
```

## URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:3000/admin/login

## Environment Variables

The following environment variables are configured:

- `NODE_ENV` - Set to 'production' or 'development'
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## Docker Commands

### Build Images
```bash
# Build frontend only
docker build -t furniture-frontend .

# Build development image
docker build -f Dockerfile.dev -t furniture-frontend-dev .
```

### Run Containers
```bash
# Run frontend only
docker run -p 3000:3000 furniture-frontend

# Run with environment variables
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://backend:8000 furniture-frontend
```

### View Logs
```bash
# View frontend logs
docker-compose logs -f frontend

# View all logs (full stack)
docker-compose -f docker-compose.full.yml logs -f
```

### Stop Services
```bash
# Stop frontend only
docker-compose down

# Stop full stack
docker-compose -f docker-compose.full.yml down
```

## Network Configuration

All services use the `furniture-network` Docker network for communication:
- Frontend can reach backend at `http://backend:8000`
- Backend can reach database at `db:5432`

## Troubleshooting

### Port Conflicts
If ports 3000 or 8000 are already in use:
```bash
# Check what's using the ports
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :8000

# Stop conflicting services or change ports in docker-compose files
```

### Build Issues
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Permission Issues
```bash
# Make scripts executable
chmod +x docker-*.sh
```

## Development vs Production

### Development
- Hot reload enabled
- Source code mounted as volume
- Faster startup
- Debug-friendly

### Production
- Optimized build
- Standalone output
- Smaller image size
- Security hardened
