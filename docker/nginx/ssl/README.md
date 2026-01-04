# SSL Certificates

Đặt SSL certificates của bạn vào đây cho HTTPS.

## Development
Không cần SSL cho development environment.

## Production

Đặt các file sau vào thư mục này:
- `certificate.crt` - SSL certificate
- `private.key` - Private key
- `ca_bundle.crt` - CA bundle (optional)

### Sử dụng Let's Encrypt (Khuyên dùng)

```bash
# Cài đặt certbot
sudo apt-get install certbot

# Tạo certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./certificate.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./private.key
```

### Update Nginx config

Sau khi có SSL, update file `nginx/nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... rest of your config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```
