# 📊 Sơ Đồ Setup Docker - Bcool Construction Backend

## 🏗️ Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOST MACHINE                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Docker Network                           │ │
│  │                   (backend-net)                             │ │
│  │                                                              │ │
│  │  ┌──────────┐      ┌──────────┐      ┌──────────┐         │ │
│  │  │  Nginx   │      │   API    │      │   DB     │         │ │
│  │  │  :8080   │─────▶│  :3000   │─────▶│  :5432   │         │ │
│  │  │  :8443   │      │ (NestJS) │      │(Postgres)│         │ │
│  │  └──────────┘      └─────┬────┘      └──────────┘         │ │
│  │                          │                                  │ │
│  │                          │                                  │ │
│  │                          ▼                                  │ │
│  │                    ┌──────────┐                            │ │
│  │                    │  Redis   │                            │ │
│  │                    │  :6379   │                            │ │
│  │                    │ (Cache)  │                            │ │
│  │                    └──────────┘                            │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Volumes:                                                        │
│  • postgres_data      → /var/lib/postgresql/data               │
│  • redis_data         → /data                                   │
│  • api_node_modules   → /usr/src/app/node_modules              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
        ▲                                    ▲
        │                                    │
   Port 8080                            Port 8443
   (HTTP)                               (HTTPS)
```

## 🔄 Flow Hoạt Động

```
┌─────────┐
│ Browser │
└────┬────┘
     │ HTTP Request
     │ http://localhost:8080/api/v1
     ▼
┌─────────────┐
│   Nginx     │  • Reverse Proxy
│             │  • Rate Limiting (10 req/s)
│   :8080     │  • Gzip Compression
│   :8443     │  • Security Headers
└─────┬───────┘
      │ Proxy to api:3000
      ▼
┌─────────────┐
│  API        │  • NestJS Application
│  Container  │  • Hot Reload (Dev)
│             │  • TypeORM
│   :3000     │  • Business Logic
└─┬─────────┬─┘
  │         │
  │         │ Cache/Session
  │         ▼
  │    ┌─────────┐
  │    │  Redis  │  • Cache Layer
  │    │  :6379  │  • Session Store
  │    └─────────┘
  │
  │ Database Queries
  ▼
┌─────────────┐
│ PostgreSQL  │  • Main Database
│             │  • Data Persistence
│   :5432     │  • Relations
└─────────────┘
```

## 📂 Cấu Trúc Files

```
bcool-construction-be/
│
├── .env                           ← Environment Variables
│
├── docker/                        ← Docker Configuration
│   │
│   ├── Dockerfile.dev             ← Development Image
│   │   └── Build: npm install + hot reload
│   │
│   ├── Dockerfile.prod            ← Production Image  
│   │   └── Multi-stage: Build → Production (optimized)
│   │
│   ├── docker-compose.dev.yml     ← Dev Services
│   │   ├── nginx  (8080:80, 8443:443)
│   │   ├── api    (3000) + volumes
│   │   ├── db     (5432)
│   │   └── redis  (6379)
│   │
│   ├── docker-compose.prod.yml    ← Prod Services
│   │   └── Same structure + optimizations
│   │
│   ├── nginx/
│   │   ├── nginx.conf             ← Nginx Config
│   │   └── ssl/                   ← SSL Certificates
│   │
│   └── scripts/
│       ├── start-dev.sh           ← 🚀 Khởi động
│       ├── start-prod.sh
│       ├── stop.sh                ← Dừng services
│       └── logs.sh                ← Xem logs
│
└── src/                           ← Application Code
```

## 🔧 Chi Tiết Services

### 1️⃣ Nginx (Reverse Proxy)
```
Container: bcool-nginx-dev
Image:     nginx:alpine
Ports:     8080:80, 8443:443
Config:    ./nginx/nginx.conf
Features:
  ✓ Reverse proxy to API
  ✓ Rate limiting (10 req/s)
  ✓ Gzip compression
  ✓ Security headers
  ✓ SSL/TLS support
```

### 2️⃣ API (NestJS)
```
Container: bcool-api-dev
Build:     ./Dockerfile.dev
Port:      3000 (internal only)
Volumes:
  • .:/usr/src/app                    (code sync)
  • api_node_modules:/usr/.../node_modules  (persist)
Env:
  • DB_HOST=db
  • REDIS_HOST=redis
  • NODE_ENV=development
Features:
  ✓ Hot reload (nodemon)
  ✓ TypeScript compilation
  ✓ Auto restart on changes
```

### 3️⃣ PostgreSQL (Database)
```
Container: bcool-db-dev
Image:     postgres:15-alpine
Port:      5432:5432
Volume:    postgres_data:/var/lib/postgresql/data
Env:
  • POSTGRES_USER=postgres
  • POSTGRES_PASSWORD=123456789
  • POSTGRES_DB=bcool_construction
Health:    pg_isready check every 10s
```

### 4️⃣ Redis (Cache)
```
Container: bcool-redis-dev
Image:     redis:7-alpine
Port:      6379:6379
Volume:    redis_data:/data
Command:   redis-server --appendonly yes
Health:    redis-cli ping every 10s
```

## 🚀 Workflow Setup

### Lần Đầu Tiên:
```
┌─────────────────┐
│  1. Clone Repo  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Setup .env   │
│  cp .env.example│
│     .env        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. cd docker/   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Run Script   │
│ ./scripts/      │
│  start-dev.sh   │
└────────┬────────┘
         │
         ├─── Build Docker Images
         ├─── Create Network
         ├─── Create Volumes
         ├─── Start Containers
         │      ├── DB (wait for healthy)
         │      ├── Redis (wait for healthy)
         │      ├── API (wait for DB + Redis)
         │      └── Nginx
         │
         ▼
┌─────────────────┐
│ 5. API Ready    │
│ localhost:8080  │
└─────────────────┘
```

### Lần Sau:
```
cd docker/
docker compose -f docker-compose.dev.yml up -d
```

## 🔀 Data Flow Chi Tiết

### Request Flow:
```
Client
  │
  │ GET http://localhost:8080/api/v1/users
  ▼
Nginx Container (:80)
  │ 1. Rate limit check
  │ 2. Gzip compression
  │ 3. Add security headers
  │
  │ proxy_pass http://api:3000
  ▼
API Container (:3000)
  │ 1. Route matching
  │ 2. Middleware (auth, validation)
  │ 3. Controller → Service → Repository
  │
  ├─── Need Cache? ────▶ Redis (:6379)
  │                      │ GET/SET cache
  │                      └──────────┘
  │
  ├─── Need Data? ─────▶ PostgreSQL (:5432)
  │                      │ SQL Query
  │                      │ TypeORM
  │                      └──────────┘
  │
  │ 4. Transform response
  ▼
Response to Nginx
  │
  │ Gzip if needed
  ▼
Response to Client
```

## 🔐 Environment Variables Flow

```
Host Machine
  │
  ├── .env (root)
  │    ├── DB_HOST=localhost        (for local dev)
  │    ├── DB_PASSWORD=123456789
  │    └── REDIS_HOST=localhost
  │
  ▼
Docker Compose reads .env
  │
  ├── Override DB_HOST=db           (in compose)
  ├── Override REDIS_HOST=redis
  │
  ▼
Containers receive correct values
  │
  ├── API sees: DB_HOST=db
  ├── DB sees: POSTGRES_PASSWORD=123456789
  └── All services connected via Docker network
```

## 📊 Port Mapping

```
Host Machine          Container           Service
─────────────────────────────────────────────────────
localhost:8080   →    80        →    Nginx (HTTP)
localhost:8443   →    443       →    Nginx (HTTPS)
localhost:5432   →    5432      →    PostgreSQL
localhost:6379   →    6379      →    Redis
                      3000      →    API (internal only)
```

## 🔄 Container Dependencies

```
Nginx
  │
  └─ depends_on: api
                  │
                  ├─ depends_on: db
                  │              │
                  │              └─ healthy (health check)
                  │
                  └─ depends_on: redis
                                 │
                                 └─ healthy (health check)
```

## 💾 Volume Persistence

```
Docker Volumes (Named)
│
├── postgres_data (bcool_postgres_data_dev)
│   └── Persist: Database files
│   └── Location: /var/lib/postgresql/data
│   └── Survives: docker-compose down
│
├── redis_data (bcool_redis_data_dev)
│   └── Persist: Redis snapshots
│   └── Location: /data
│   └── Survives: docker-compose down
│
└── api_node_modules (bcool_api_node_modules_dev)
    └── Persist: Node packages
    └── Location: /usr/src/app/node_modules
    └── Avoid conflict with host
```

## 🌐 Network Architecture

```
Docker Network: backend-net (bridge)
│
├── nginx        (172.x.x.2)
├── api          (172.x.x.3)
├── db           (172.x.x.4)
└── redis        (172.x.x.5)

Internal DNS Resolution:
  • api    → resolves to API container IP
  • db     → resolves to DB container IP  
  • redis  → resolves to Redis container IP
```

## 🎯 Development vs Production

### Development (docker-compose.dev.yml)
```
✓ Hot reload enabled
✓ Source code mounted as volume
✓ Debug mode
✓ All ports exposed
✓ Logs to stdout
✓ No resource limits
```

### Production (docker-compose.prod.yml)
```
✓ Optimized build (multi-stage)
✓ No source mounts
✓ Production mode
✓ Only necessary ports
✓ Log rotation
✓ Resource limits
✓ Health checks
✓ Restart policies
```

## 🛠️ Common Commands

```bash
# Start
cd docker && ./scripts/start-dev.sh

# Stop
./scripts/stop.sh dev

# Logs
./scripts/logs.sh dev api

# Restart one service
docker compose -f docker-compose.dev.yml restart api

# Rebuild
docker compose -f docker-compose.dev.yml build --no-cache

# Clean up (⚠️ deletes data)
docker compose -f docker-compose.dev.yml down -v

# Shell access
docker exec -it bcool-api-dev sh

# Run migration
docker exec -it bcool-api-dev npm run migration:run
```

---

## 📝 Summary

**4 Containers** → **1 Network** → **3 Volumes** → **1 Application**

```
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│Nginx │  │ API  │  │  DB  │  │Redis │
└───┬──┘  └───┬──┘  └───┬──┘  └───┬──┘
    └─────────┴─────────┴──────────┘
              backend-net
```

**Chỉ cần nhớ:**
1. File `.env` ở root
2. Chạy `cd docker && ./scripts/start-dev.sh`
3. API tại `http://localhost:8080`
