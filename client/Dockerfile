# Frontend Dockerfile
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Configure npm for better network handling
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retries 8 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 180000

# Copy package files
COPY package*.json ./

# Use the lockfile for deterministic builds and only fall back to install if needed.
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy source code
COPY . .

# Set environment variable for API URL
ARG VITE_API_URL=https://pos.faiznute.site/api
ENV VITE_API_URL=$VITE_API_URL

# Build application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# CRITICAL FIX: Pre-create nginx cache directories with proper permissions
# This must happen BEFORE nginx tries to create them
RUN mkdir -p /var/cache/nginx/client_temp \
    && mkdir -p /var/cache/nginx/proxy_temp \
    && mkdir -p /var/cache/nginx/fastcgi_temp \
    && mkdir -p /var/cache/nginx/uwsgi_temp \
    && mkdir -p /var/cache/nginx/scgi_temp \
    && mkdir -p /var/run/nginx \
    && mkdir -p /var/log/nginx \
    && chmod -R 755 /var/cache/nginx /var/run/nginx /var/log/nginx \
    && chown -R root:root /var/cache/nginx /var/run/nginx /var/log/nginx

# CRITICAL FIX: Remove user directive from base nginx.conf
# The "user nginx" causes permission issues when running as root in container
RUN sed -i 's/^user nginx;/# user nginx;  # removed for containerized deployment/' /etc/nginx/nginx.conf

# Copy built files
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Run as root in container (safe due to containerization)
# Don't switch user - let nginx run with root privileges
ENTRYPOINT ["/docker-entrypoint.sh"]
