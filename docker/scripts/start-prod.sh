#!/bin/bash

# Script để start production environment
set -e

echo "🚀 Starting Bcool Construction Backend (Production)..."

# Check if .env.production exists
if [ ! -f ../.env.production ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production file with production values."
    exit 1
fi

# Pull latest images
echo "📥 Pulling latest images..."
docker compose -f docker-compose.prod.yml pull

# Build production image
echo "🔨 Building production image..."
docker compose -f docker-compose.prod.yml build --no-cache

# Start docker compose
echo "🐳 Starting Docker containers..."
docker compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check services status
echo ""
echo "📊 Services Status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Production environment is ready!"
echo ""
echo "📡 API URL: http://localhost/api/v1"
echo "📚 API Docs: http://localhost/api/docs"
echo ""
echo "📝 View logs: docker compose -f docker/docker-compose.prod.yml logs -f api"
echo "🛑 Stop services: docker compose -f docker/docker-compose.prod.yml down"
