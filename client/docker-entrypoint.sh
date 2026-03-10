#!/bin/sh
set -e

# Create nginx cache directories (as root)
mkdir -p /var/cache/nginx/client_temp
mkdir -p /var/cache/nginx/proxy_temp
mkdir -p /var/cache/nginx/fastcgi_temp
mkdir -p /var/cache/nginx/uwsgi_temp
mkdir -p /var/cache/nginx/scgi_temp

# Set permissions
chmod -R 755 /var/cache/nginx /var/run/nginx /var/log/nginx 2>/dev/null || true

# Start nginx in foreground
exec nginx -g "daemon off;"
