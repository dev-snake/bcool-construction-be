# 🐳 Docker & CI/CD Setup

## 📁 Files Structure

```
├── Dockerfile                  # Multi-stage build (dev + prod)
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
├── .dockerignore               # Optimize build context
├── .env.example                # Environment variables template
└── .github/
    └── workflows/
        └── ci-cd.yml           # GitHub Actions pipeline
```

---

## 🚀 Quick Start - Development

```bash
# Clone and setup
cp .env.example .env

# Start all services (API + PostgreSQL + Redis)
docker compose up -d

# View logs
docker compose logs -f api

# Stop all services
docker compose down
```

---

## 🏭 Production Deploy

### Option 1: Docker Compose on VPS

```bash
# 1. Create env file
cp .env.example .env.prod
# Edit .env.prod with production values

# 2. Deploy
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 3. View status
docker compose -f docker-compose.prod.yml ps
```

### Option 2: GitHub Container Registry

```bash
# Pull and run latest image
docker pull ghcr.io/YOUR_USERNAME/bcool-construction-be:latest

docker run -d \
  --name bcool-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-password \
  -e JWT_SECRET=your-jwt-secret \
  ghcr.io/YOUR_USERNAME/bcool-construction-be:latest
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Pipeline tự động chạy khi push/PR vào `main` hoặc `develop`:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Lint &    │    │             │    │   Docker    │    │             │
│    Test     │───►│    Build    │───►│  Push to    │───►│   Deploy    │
│             │    │             │    │    GHCR     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Pipeline Stages:

| Stage      | Trigger           | Actions                      |
| ---------- | ----------------- | ---------------------------- |
| **Test**   | All pushes/PRs    | Lint, Unit Tests, E2E Tests  |
| **Build**  | After Test passes | Compile TypeScript           |
| **Docker** | main/develop only | Build & Push to GHCR         |
| **Deploy** | main/develop only | Deploy to staging/production |

### Setup Required Secrets:

Go to **Settings → Secrets → Actions** và thêm:

- `GITHUB_TOKEN` - Auto-provided by GitHub
- `SSH_PRIVATE_KEY` - (Optional) For VPS deployment
- `DEPLOY_HOST` - (Optional) Production server IP
- `DEPLOY_USER` - (Optional) SSH username

---

## 🐳 Docker Commands Cheatsheet

```bash
# Build image locally
docker build -t bcool-api .

# Build for production
docker build --target production -t bcool-api:prod .

# Run single container
docker run -p 3000:3000 bcool-api

# View running containers
docker ps

# Execute command in container
docker exec -it bcool-api sh

# View container logs
docker logs -f bcool-api

# Clean up
docker system prune -a
```

---

## 📊 Health Checks

Production stack includes health checks:

| Service    | Endpoint             | Interval |
| ---------- | -------------------- | -------- |
| API        | `GET /api/v1/health` | 30s      |
| PostgreSQL | `pg_isready`         | 10s      |
| Redis      | `redis-cli ping`     | 10s      |

---

## 🔧 Environment Variables

See `.env.example` for full list. Required for production:

| Variable      | Description       | Example                |
| ------------- | ----------------- | ---------------------- |
| `NODE_ENV`    | Environment       | `production`           |
| `DB_PASSWORD` | Database password | `strong_password`      |
| `JWT_SECRET`  | JWT signing key   | `random_256_bit_key`   |
| `REDIS_HOST`  | Redis host        | `redis` or `localhost` |

---

## 💡 Tips

1. **Always use `.env.example`** as template
2. **Never commit `.env`** to git
3. **Use docker secrets** for sensitive data in production
4. **Tag images** by commit SHA for traceability
5. **Run migrations** before starting app in production
