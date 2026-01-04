# 🚀 Quick Start Guide - Docker Setup

## Cách chạy backend với Docker (Đơn giản nhất)

### Lần đầu tiên:

```bash
cd docker
./scripts/start-dev.sh
```

Script sẽ tự động:
- ✅ Tạo file `.env` nếu chưa có
- ✅ Build Docker images
- ✅ Khởi động tất cả services (API, Database, Redis, Nginx)

### Lần sau:

```bash
cd docker
docker compose -f docker-compose.dev.yml up -d
```

### Truy cập API:

- **API**: http://localhost:8080/api/v1
- **Swagger Docs**: http://localhost:8080/api/docs

### Dừng backend:

```bash
cd docker
./scripts/stop.sh dev
# hoặc
docker compose -f docker-compose.dev.yml down
```

### Xem logs:

```bash
cd docker
./scripts/logs.sh dev api
# hoặc
docker compose -f docker-compose.dev.yml logs -f api
```

---

## 📁 Cấu trúc folder

```
docker/
├── Dockerfile.dev              # Development Dockerfile
├── Dockerfile.prod             # Production Dockerfile  
├── docker-compose.dev.yml      # Development compose
├── docker-compose.prod.yml     # Production compose
├── nginx/
│   ├── nginx.conf             # Nginx configuration
│   └── ssl/                   # SSL certificates
├── scripts/
│   ├── start-dev.sh           # 🚀 Start development
│   ├── start-prod.sh          # Start production
│   ├── stop.sh                # Stop services
│   └── logs.sh                # View logs
├── .env                       # Environment variables (tự động tạo)
└── README.md                  # Chi tiết documentation
```

---

## 💡 Tips

### Rebuild images khi có thay đổi dependencies:
```bash
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up -d
```

### Reset toàn bộ (xóa data):
```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
```

### Chạy migration:
```bash
docker exec -it bcool-api-dev npm run migration:run
```

### Truy cập terminal trong container:
```bash
docker exec -it bcool-api-dev sh
```

---

Xem thêm chi tiết trong [docker/README.md](README.md)
