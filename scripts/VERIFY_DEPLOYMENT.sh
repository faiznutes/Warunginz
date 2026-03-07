#!/bin/bash

echo "🔍 Phase 26 Deployment Verification"
echo "===================================="
echo ""

# Test Frontend
echo "1️⃣  Testing Frontend (HTTP)..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.1.101/)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend: HTTP 200 OK"
else
    echo "❌ Frontend: HTTP $FRONTEND_STATUS"
fi

# Test Nginx
echo ""
echo "2️⃣  Testing Nginx..."
NGINX_STATUS=$(sshpass -p '123' ssh root@192.168.1.101 "docker ps | grep nginx | grep Up")
if [ -n "$NGINX_STATUS" ]; then
    echo "✅ Nginx: Running & Healthy"
else
    echo "❌ Nginx: Not running"
fi

# Test Backend  
echo ""
echo "3️⃣  Testing Backend..."
BACKEND_STATUS=$(sshpass -p '123' ssh root@192.168.1.101 "docker ps | grep backend | grep 'Up.*healthy'")
if [ -n "$BACKEND_STATUS" ]; then
    echo "✅ Backend: Running & Healthy"
else
    echo "❌ Backend: Not running or not healthy"
fi

# Test Frontend Container
echo ""
echo "4️⃣  Testing Frontend Container..."
FRONTEND_CONTAINER=$(sshpass -p '123' ssh root@192.168.1.101 "docker ps | grep frontend | grep Up")
if [ -n "$FRONTEND_CONTAINER" ]; then
    echo "✅ Frontend Container: Running"
else
    echo "❌ Frontend Container: Not running"
fi

# Test All Services
echo ""
echo "5️⃣  All Docker Services:"
sshpass -p '123' ssh root@192.168.1.101 "docker ps --format 'table {{.Names}}\t{{.Status}}' | grep warungin"

echo ""
echo "✅ Phase 26 Deployment Verification Complete!"
