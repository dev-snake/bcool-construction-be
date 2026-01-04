# 🐳 Docker Setup

Cấu trúc Docker được tổ chức chuẩn chỉnh cho dự án Bcool Construction Backend.

## 📁 Cấu trúc thư mục

```
docker/
├── Dockerfile.dev              # Dockerfile cho môi trường development
├── Dockerfile.prod             # Dockerfile cho môi trường production
├── docker-compose.dev.yml      # Docker Compose cho development
├── docker-compose.prod.yml     # Docker Compose cho production
├── nginx/
│   └── nginx.conf             # Cấu hình Nginx
├── scripts/
│   ├── start-dev.sh           # Script khởi động development
│   ├── start-prod.sh          # Script khởi động production
│   ├── stop.sh                # Script dừng services
│   └── logs.sh                # Script xem logs
└── README.md                  # File này
```

## 🚀 Cách sử dụng

### Development Environment

**Khởi động:**
```bash
cd docker
./scripts/start-dev.sh
```

Hoặc thủ công:
```bash
cd docker
docker compose -f docker-compose.dev.yml up -d
```

**Truy cập:**
- API: http://localhost:8080/api/v1
- Swagger Docs: http://localhost:8080/api/docs
- Database: localhost:5432
- Redis: localhost:6379

**Xem logs:**
```bash
./scripts/logs.sh dev api
# hoặc
docker compose -f docker-compose.dev.yml logs -f api
```

**Dừng:**
```bash
./scripts/stop.sh dev
# hoặc
docker compose -f docker-compose.dev.yml down
```

### Production Environment

**Khởi động:**
```bash
cd docker
./scripts/start-prod.sh
```

Hoặc thủ công:
```bash
cd docker
docker compose -f docker-compose.prod.yml up -d
```

**Truy cập:**
- API: http://localhost/api/v1
- Swagger Docs: http://localhost/api/docs

**Xem logs:**
```bash
./scripts/logs.sh prod api
```

**Dừng:**
```bash
./scripts/stop.sh prod
```

## 📝 Các lệnh hữu ích

### Xem trạng thái containers:
```bash
docker compose -f docker-compose.dev.yml ps
```

### Rebuild image:
```bash
docker compose -f docker-compose.dev.yml build --no-cache api
```

### Restart một service cụ thể:
```bash
docker compose -f docker-compose.dev.yml restart api
```

### Xem logs của tất cả services:
```bash
docker compose -f docker-compose.dev.yml logs -f
```

### Truy cập vào container:
```bash
docker exec -it bcool-api-dev sh
```

### Chạy migration:
```bash
docker exec -it bcool-api-dev npm run migration:run
```

### Database backup:
```bash
docker exec bcool-db-dev pg_dump -U postgres bcool_construction > backup.sql
```

### Database restore:
```bash
docker exec -i bcool-db-dev psql -U postgres bcool_construction < backup.sql
```

## 🔧 Cấu hình

### Environment Variables

Tạo file `.env` trong thư mục root:
```bash
cp .env.example .env
```

Cho production, tạo `.env.production`:
```bash
cp .env.example .env.production
# Sau đó chỉnh sửa các giá trị cho phù hợp với production
```

### Port Configuration

Bạn có thể thay đổi ports trong file `.env`:
```env
NGINX_HTTP_PORT=8080
NGINX_HTTPS_PORT=8443
DB_PORT=5432
REDIS_PORT=6379
```

## 🐛 Troubleshooting

### Port đã được sử dụng:
Thay đổi port trong file `.env` hoặc dừng service đang chiếm port:
```bash
sudo lsof -i :8080
sudo systemctl stop apache2  # nếu Apache đang chạy
```

### Container không start:
Xem logs để biết lỗi:
```bash
docker compose -f docker-compose.dev.yml logs api
```

### Rebuild hoàn toàn:
```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up -d
```

### Xóa tất cả volumes (⚠️ Cẩn thận - sẽ mất data):
```bash
docker compose -f docker-compose.dev.yml down -v
```

## 📊 Monitoring

### Health checks:
```bash
# API health
curl http://localhost:8080/api/v1/health

# Nginx health
curl http://localhost:8080/health

# Database
docker exec bcool-db-dev pg_isready -U postgres

# Redis
docker exec bcool-redis-dev redis-cli ping
```

### Container stats:
```bash
docker stats bcool-api-dev bcool-db-dev bcool-redis-dev
```

## 🔐 Security Best Practices

1. **Luôn sử dụng strong passwords** trong production
2. **Không commit file .env** vào git
3. **Sử dụng SSL/TLS** cho production (cấu hình trong nginx/ssl/)
4. **Giới hạn rate limiting** đã được cấu hình trong nginx
5. **Regular updates** cho base images

## 📚 Tài liệu thêm

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker-compose)
