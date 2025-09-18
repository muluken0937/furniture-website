#!/bin/bash

# Development Docker script for Frontend
echo "Starting Frontend Development with Docker..."

# Create network if it doesn't exist
docker network create furniture-network 2>/dev/null || true

# Start development container
docker-compose -f docker-compose.dev.yml up --build

echo "Frontend development server started at http://localhost:3000"
