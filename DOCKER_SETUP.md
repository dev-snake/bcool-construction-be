# 🐳 Chạy Backend với Docker

Đã setup xong folder Docker chuẩn chỉnh! 

## ⚡ Quick Start

```bash
cd docker
./scripts/start-dev.sh
```

Sau đó truy cập:
- **API**: http://localhost:8080/api/v1
- **Swagger**: http://localhost:8080/api/docs

## 📝 Chi tiết

Xem thêm:
- [docker/QUICKSTART.md](docker/QUICKSTART.md) - Hướng dẫn nhanh
- [docker/README.md](docker/README.md) - Documentation đầy đủ

## 📂 Cấu trúc

```
docker/
├── Dockerfile.dev & Dockerfile.prod
├── docker-compose.dev.yml & docker-compose.prod.yml
├── nginx/nginx.conf
├── scripts/ (start-dev.sh, stop.sh, logs.sh)
└── README.md & QUICKSTART.md
```

Tất cả file Docker đã được tổ chức gọn gàng trong folder `docker/`!
