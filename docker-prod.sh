#!/bin/bash

# Production Docker script for Frontend
echo "Starting Frontend Production with Docker..."

# Create network if it doesn't exist
docker network create furniture-network 2>/dev/null || true

# Start production container
docker-compose up --build -d

echo "Frontend production server started at http://localhost:3000"
echo "Run 'docker-compose logs -f frontend' to view logs"
