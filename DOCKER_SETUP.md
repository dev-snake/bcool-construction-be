# 🐳 Chạy Backend với Docker

Đã setup xong folder Docker chuẩn chỉnh! 

> ⚠️ **Lưu ý**: Tất cả files Docker giờ nằm trong folder `docker/` thôi. 
> Các file Docker cũ ở root đã được chuyển vào `.old-docker-files/` (không dùng nữa).

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
bcool-construction-be/
├── .env                    ← Environment variables (duy nhất)
├── docker/                 ← ✅ TẤT CẢ FILES DOCKER Ở ĐÂY
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   ├── nginx/nginx.conf
│   ├── scripts/ (start-dev.sh, stop.sh, logs.sh)
│   ├── README.md
│   ├── QUICKSTART.md
│   └── ARCHITECTURE.md     ← Sơ đồ chi tiết
└── .old-docker-files/      ← ❌ Files cũ (không dùng)
```

**Chỉ dùng files trong `docker/` folder thôi!**
