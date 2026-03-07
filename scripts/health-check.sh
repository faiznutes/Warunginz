#!/bin/bash
# scripts/health-check.sh

echo "Checking Health..."

# Check Backend Health Endpoint
if curl -s -f http://localhost:3000/health > /dev/null; then
    echo "✅ Backend is UP (http://localhost:3000/health)"
else
    echo "❌ Backend is DOWN or Unreachable"
    exit 1
fi

# Check Frontend (Nginx)
if curl -s -f http://localhost:80 > /dev/null; then
    echo "✅ Frontend is UP (http://localhost:80)"
else
    echo "❌ Frontend is DOWN or Unreachable"
    exit 1
fi

echo "System Operational."
exit 0
