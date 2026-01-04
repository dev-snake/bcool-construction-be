#!/bin/bash

# Script để start development environment
set -e

echo "🚀 Starting Bcool Construction Backend (Development)..."

# Check if .env exists in root folder
if [ ! -f ../.env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from .env.example..."
    cp ../.env.example ../.env
    echo "✅ .env file created. Please update it with your values."
    exit 1
fi

# Start docker compose
echo "🐳 Starting Docker containers..."
docker compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check services status
echo ""
echo "📊 Services Status:"
docker compose -f docker-compose.dev.yml ps

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "📡 API URL: http://localhost:8080/api/v1"
echo "📚 API Docs: http://localhost:8080/api/docs"
echo "🗄️  Database: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📝 View logs: docker compose -f docker/docker-compose.dev.yml logs -f api"
echo "🛑 Stop services: docker compose -f docker/docker-compose.dev.yml down"
