#!/bin/bash

# Full stack Docker script (Frontend + Backend)
echo "Starting Full Stack with Docker..."

# Create network if it doesn't exist
docker network create furniture-network 2>/dev/null || true

# Start all services
docker-compose -f docker-compose.full.yml up --build -d

echo "Full stack started:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- Admin Panel: http://localhost:3000/admin/login"
echo ""
echo "Run 'docker-compose -f docker-compose.full.yml logs -f' to view all logs"
