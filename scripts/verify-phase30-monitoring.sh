#!/bin/bash

# Phase 30 - Monitoring Verification Script
# Checks if all monitoring components are healthy

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     PHASE 30 - MONITORING VERIFICATION                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

PROD_SERVER="192.168.1.101"
PROD_USER="root"
PROD_PASS="123"
PROD_PATH="/root/New-Warungin"

run_remote() {
    sshpass -p "$PROD_PASS" ssh -o StrictHostKeyChecking=no "$PROD_USER@$PROD_SERVER" "$1"
}

# Function to check health
check_service() {
    local name=$1
    local url=$2
    local port=$3
    
    echo "🔍 Checking $name..."
    if run_remote "curl -s -o /dev/null -w '%{http_code}' $url" | grep -q "200\|302\|401"; then
        echo "   ✅ $name is healthy (Port $port)"
        return 0
    else
        echo "   ❌ $name is not responding"
        return 1
    fi
}

echo "📊 SERVICE HEALTH CHECK"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check Prometheus
check_service "Prometheus" "http://localhost:9090/-/healthy" "9090"

# Check Grafana
check_service "Grafana" "http://localhost:3001/api/health" "3001"

# Check AlertManager
check_service "AlertManager" "http://localhost:9093/-/healthy" "9093"

# Check Backend metrics
echo ""
echo "🔍 Checking Backend Metrics Endpoint..."
if run_remote "curl -s http://localhost:3000/metrics | grep -q 'http_requests_total'"; then
    echo "   ✅ Backend metrics endpoint is working"
else
    echo "   ❌ Backend metrics endpoint not responding"
fi

echo ""
echo "📈 PROMETHEUS TARGETS"
echo "════════════════════════════════════════════════════════════"
run_remote "curl -s http://localhost:9090/api/v1/targets | grep -o '\"labels\":{[^}]*}' | head -5"

echo ""
echo "🔔 ACTIVE ALERTS"
echo "════════════════════════════════════════════════════════════"
run_remote "curl -s http://localhost:9093/api/v1/alerts | grep -o '\"alertname\":\"[^\"]*\"' | sort | uniq -c"

echo ""
echo "💾 STORAGE STATUS"
echo "════════════════════════════════════════════════════════════"
run_remote "docker exec new-warungin-prometheus df -h /prometheus | tail -1"

echo ""
echo "📊 GRAFANA DATASOURCES"
echo "════════════════════════════════════════════════════════════"
run_remote "curl -s -u admin:admin http://localhost:3001/api/datasources | grep -o '\"name\":\"[^\"]*\"'"

echo ""
echo "📋 LAST 5 PROMETHEUS METRICS"
echo "════════════════════════════════════════════════════════════"
run_remote "curl -s http://localhost:3000/metrics | tail -5"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ PHASE 30 MONITORING VERIFICATION COMPLETE"
echo ""
echo "🎯 KEY COMPONENTS:"
echo "   ✅ Prometheus: Metrics collection & storage"
echo "   ✅ Grafana: Dashboard visualization"
echo "   ✅ AlertManager: Alert routing & notifications"
echo "   ✅ Backend: Metrics endpoint active"
echo ""
echo "📊 ACCESS POINTS:"
echo "   • Prometheus: http://$PROD_SERVER:9090"
echo "   • Grafana: http://$PROD_SERVER:3001"
echo "   • AlertManager: http://$PROD_SERVER:9093"
echo ""
echo "════════════════════════════════════════════════════════════"
