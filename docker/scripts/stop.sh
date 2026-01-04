#!/bin/bash

# Script để stop services
set -e

echo "🛑 Stopping Bcool Construction Backend..."

# Determine which environment to stop
ENV=${1:-dev}

if [ "$ENV" = "prod" ]; then
    echo "Stopping production environment..."
    docker compose -f docker-compose.prod.yml down
elif [ "$ENV" = "dev" ]; then
    echo "Stopping development environment..."
    docker compose -f docker-compose.dev.yml down
else
    echo "❌ Invalid environment: $ENV"
    echo "Usage: ./stop.sh [dev|prod]"
    exit 1
fi

echo "✅ Services stopped!"
