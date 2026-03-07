#!/bin/bash
# PHASE 4: POST-DEPLOYMENT VERIFICATION (FIRST 30 MINUTES)
# Purpose: Validate production environment with synthetic transactions
# Exit code: 0 = all checks passed, 1 = issues detected

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/tmp/post-deploy-verify-${TIMESTAMP}.log"
API_URL="https://api.warungin.id"  # Production URL
TEST_USER_EMAIL="qa-verify-${TIMESTAMP}@warungin.local"
TEST_PRODUCT_ID=1  # Adjust to actual product ID
LATENCY_THRESHOLD=500  # milliseconds

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

check_pass() {
  echo "✓ $1" | tee -a $LOG_FILE
}

check_fail() {
  echo "✗ $1" | tee -a $LOG_FILE
  return 1
}

log "=== PHASE 4: POST-DEPLOYMENT VERIFICATION ==="
log ""

# Test 1: Create test user account
log "Test 1: User registration"
REG_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_USER_EMAIL\",
    \"password\": \"TestPassword123!@#\",
    \"outlet_name\": \"QA Test Outlet\"
  }")

HTTP_CODE=$(echo "$REG_RESPONSE" | tail -1)
REG_BODY=$(echo "$REG_RESPONSE" | sed '$d')
TEST_USER_ID=$(echo "$REG_BODY" | jq -r '.id' 2>/dev/null)

if [ "$HTTP_CODE" == "201" ] && [ ! -z "$TEST_USER_ID" ]; then
  check_pass "User registration (HTTP $HTTP_CODE, User ID: $TEST_USER_ID)"
else
  check_fail "User registration failed (HTTP $HTTP_CODE)"
  exit 1
fi

# Test 2: User login
log ""
log "Test 2: User authentication"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_USER_EMAIL\",
    \"password\": \"TestPassword123!@#\"
  }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')
AUTH_TOKEN=$(echo "$LOGIN_BODY" | jq -r '.access_token' 2>/dev/null)

if [ "$HTTP_CODE" == "200" ] && [ ! -z "$AUTH_TOKEN" ]; then
  check_pass "User login successful (token acquired)"
else
  check_fail "Login failed (HTTP $HTTP_CODE)"
  exit 1
fi

# Test 3: Fetch products (verify inventory)
log ""
log "Test 3: Product inventory check"
PRODUCT_RESPONSE=$(curl -s -w "\n%{http_code}" -m 5 -X GET "$API_URL/api/products" \
  -H "Authorization: Bearer $AUTH_TOKEN")

HTTP_CODE=$(echo "$PRODUCT_RESPONSE" | tail -1)
PRODUCT_BODY=$(echo "$PRODUCT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  PRODUCT_COUNT=$(echo "$PRODUCT_BODY" | jq '.data | length' 2>/dev/null)
  check_pass "Product inventory API (HTTP $HTTP_CODE, $PRODUCT_COUNT products)"
else
  check_fail "Product API failed (HTTP $HTTP_CODE)"
fi

# Test 4: Database stock verification BEFORE transaction
log ""
log "Test 4: Pre-transaction stock verification"
STOCK_BEFORE=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "SELECT stock FROM products WHERE id = $TEST_PRODUCT_ID" 2>/dev/null | tail -1 | xargs)

log "Stock before transaction: $STOCK_BEFORE units"

# Test 5: Create production transaction
log ""
log "Test 5: Create production order (financial transaction)"
START_TIME=$(date +%s%N)

ORDER_RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" -X POST "$API_URL/api/orders" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"items\": [{
      \"product_id\": $TEST_PRODUCT_ID,
      \"quantity\": 2,
      \"unit_price\": 10000
    }],
    \"payment_method\": \"CASH\",
    \"total\": 20000
  }")

END_TIME=$(date +%s%N)
LATENCY_NS=$((END_TIME - START_TIME))
LATENCY_MS=$((LATENCY_NS / 1000000))

HTTP_CODE=$(echo "$ORDER_RESPONSE" | tail -2 | head -1)
RESPONSE_TIME=$(echo "$ORDER_RESPONSE" | tail -1)
ORDER_BODY=$(sed '$ d' <<< "$(echo "$ORDER_RESPONSE" | sed '$ d')")
ORDER_ID=$(echo "$ORDER_BODY" | jq -r '.id' 2>/dev/null)

if [ "$HTTP_CODE" == "201" ] && [ ! -z "$ORDER_ID" ]; then
  check_pass "Order created (HTTP $HTTP_CODE, Order ID: $ORDER_ID, Latency: ${LATENCY_MS}ms)"
  
  if [ $LATENCY_MS -lt $LATENCY_THRESHOLD ]; then
    check_pass "Latency acceptable (${LATENCY_MS}ms < ${LATENCY_THRESHOLD}ms)"
  else
    check_fail "Latency high (${LATENCY_MS}ms > ${LATENCY_THRESHOLD}ms)"
  fi
else
  check_fail "Order creation failed (HTTP $HTTP_CODE)"
  exit 1
fi

# Test 6: Verify stock deduction (database consistency)
log ""
log "Test 6: Stock deduction verification"
sleep 1  # Give database time to persist
STOCK_AFTER=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "SELECT stock FROM products WHERE id = $TEST_PRODUCT_ID" 2>/dev/null | tail -1 | xargs)

STOCK_DELTA=$((STOCK_BEFORE - STOCK_AFTER))

if [ "$STOCK_DELTA" -eq 2 ]; then
  check_pass "Stock deducted correctly (2 units, balance: $STOCK_BEFORE → $STOCK_AFTER)"
else
  check_fail "Stock mismatch (expected -2, actual -$STOCK_DELTA)"
  exit 1
fi

# Test 7: Verify order items persisted
log ""
log "Test 7: Order items database integrity"
ORDER_ITEMS=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "SELECT COUNT(*) FROM order_items WHERE order_id = $ORDER_ID" 2>/dev/null | tail -1 | xargs)

if [ "$ORDER_ITEMS" -eq 1 ]; then
  check_pass "Order items persisted (1 item in database)"
else
  check_fail "Order items not found (expected 1, found $ORDER_ITEMS)"
  exit 1
fi

# Test 8: Verify payment record
log ""
log "Test 8: Payment record verification"
PAYMENT_RECORD=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "SELECT COUNT(*) FROM payments WHERE order_id = $ORDER_ID" 2>/dev/null | tail -1 | xargs)

if [ "$PAYMENT_RECORD" -ge 1 ]; then
  check_pass "Payment record created"
else
  check_fail "Payment record not found"
fi

# Test 9: Verify foreign key relationships
log ""
log "Test 9: Data integrity check"
ORPHANED=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "SELECT COUNT(*) FROM order_items oi LEFT JOIN orders o ON oi.order_id = o.id WHERE o.id IS NULL" \
  2>/dev/null | tail -1 | xargs)

if [ "$ORPHANED" -eq 0 ]; then
  check_pass "Foreign key integrity verified (no orphaned records)"
else
  check_fail "Foreign key violation found ($ORPHANED orphaned items)"
fi

# Test 10: Error log check
log ""
log "Test 10: Application error log check"
ERROR_LOG="/var/log/warungin/error.log"
if [ -f "$ERROR_LOG" ]; then
  ERRORS_SINCE=$(grep "ERROR\|FATAL" "$ERROR_LOG" | tail -20)
  ERROR_COUNT=$(echo "$ERRORS_SINCE" | grep -c "ERROR\|FATAL" || true)
  
  if [ "$ERROR_COUNT" -eq 0 ]; then
    check_pass "No critical errors in logs"
  else
    check_fail "Found $ERROR_COUNT errors in logs (review required)"
    echo "$ERRORS_SINCE" | tee -a $LOG_FILE
  fi
fi

# Test 11: Database performance
log ""
log "Test 11: Database query performance"
QUERY_TIME=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "EXPLAIN ANALYZE SELECT * FROM orders WHERE id = $ORDER_ID" 2>/dev/null | grep "Execution Time" | awk '{print $3}')

check_pass "Sample query execution time: ${QUERY_TIME}ms"

# Test 12: Replication verification
log ""
log "Test 12: Replication status"
REPO_LAG=$(psql -h ${DB_HOST:-localhost} -d ${DB_NAME:-warungin_prod} -U ${DB_USER:-postgres} \
  -c "SELECT EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_timestamp()))" 2>/dev/null | tail -1 | xargs)

if (( $(echo "$REPO_LAG < 5" | bc -l) )); then
  check_pass "Replication lag healthy (${REPO_LAG}s)"
else
  check_fail "Replication lag high (${REPO_LAG}s)"
fi

# Test 13: API health endpoints
log ""
log "Test 13: Critical API endpoints"

# Health
HEALTH=$(curl -s -m 5 "$API_URL/api/health" 2>/dev/null | jq -r '.status' 2>/dev/null)
if [ "$HEALTH" == "ok" ]; then
  check_pass "Health endpoint: OK"
else
  check_fail "Health endpoint: FAILED"
fi

# Metrics
METRICS=$(curl -s -m 5 "$API_URL/metrics" 2>/dev/null | grep -c "http_requests_total" || true)
if [ "$METRICS" -gt 0 ]; then
  check_pass "Metrics endpoint: OK"
else
  check_fail "Metrics endpoint: FAILED"
fi

# Test 14: SSL certificate validation
log ""
log "Test 14: SSL/TLS validation"
CERT_EXPIRY=$(openssl s_client -connect api.warungin.id:443 -servername api.warungin.id </dev/null 2>/dev/null | \
  openssl x509 -noout -enddate | cut -d= -f2)
DAYS_LEFT=$(( ($(date -d "$CERT_EXPIRY" +%s) - $(date +%s)) / 86400 ))

if [ "$DAYS_LEFT" -gt 0 ]; then
  check_pass "SSL certificate valid ($DAYS_LEFT days remaining)"
else
  check_fail "SSL certificate expired"
fi

log ""
log "=== POST-DEPLOYMENT VERIFICATION COMPLETE ==="
log "Summary:"
log "  - Test transaction: $ORDER_ID"
log "  - API latency: ${LATENCY_MS}ms"
log "  - Stock deduction: VERIFIED"
log "  - Data integrity: VERIFIED"
log "  - Database replication: HEALTHY"
log "  - Log file: $LOG_FILE"
log ""
log "✓ All post-deployment checks passed"
exit 0
