#!/bin/bash

# Script để xem logs
set -e

# Determine which environment
ENV=${1:-dev}
SERVICE=${2:-api}

if [ "$ENV" = "prod" ]; then
    docker compose -f docker-compose.prod.yml logs -f "$SERVICE"
elif [ "$ENV" = "dev" ]; then
    docker compose -f docker-compose.dev.yml logs -f "$SERVICE"
else
    echo "❌ Invalid environment: $ENV"
    echo "Usage: ./logs.sh [dev|prod] [service_name]"
    echo "Services: api, db, redis, nginx"
    exit 1
fi
