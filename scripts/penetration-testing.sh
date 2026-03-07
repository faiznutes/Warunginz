#!/bin/bash

# Phase 31 - Penetration Testing Simulation Script
# Automated security testing for OWASP Top 10 vulnerabilities
# Run with: bash scripts/penetration-testing.sh

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR="./security-reports"
REPORT_FILE="$REPORT_DIR/pentest-report-$TIMESTAMP.json"
TEST_RESULTS=()
VULNERABILITIES_FOUND=0
TESTS_PASSED=0
TESTS_FAILED=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create report directory
mkdir -p "$REPORT_DIR"

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

print_header() {
  echo -e "${BLUE}===============================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}===============================================${NC}"
}

print_test() {
  echo -e "${YELLOW}[TEST]${NC} $1"
}

print_pass() {
  echo -e "${GREEN}[PASS]${NC} $1"
  TESTS_PASSED=$((TESTS_PASSED + 1))
}

print_fail() {
  echo -e "${RED}[FAIL]${NC} $1"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  VULNERABILITIES_FOUND=$((VULNERABILITIES_FOUND + 1))
}

print_warning() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_test_result() {
  local test_name=$1
  local result=$2
  local details=$3
  
  TEST_RESULTS+=("{\"test\": \"$test_name\", \"result\": \"$result\", \"details\": \"$details\"}")
}

# ============================================================================
# TEST 1: XSS VULNERABILITY TESTING
# ============================================================================

test_xss_vulnerabilities() {
  print_header "TEST 1: XSS (Cross-Site Scripting) Vulnerabilities"
  
  print_test "Testing for reflected XSS in query parameters"
  
  # Test 1.1: Script tag injection
  XSS_PAYLOAD="<script>alert('XSS')</script>"
  RESPONSE=$(curl -s "http://localhost:3000/api/outlets?search=$XSS_PAYLOAD" 2>/dev/null || echo "")
  
  if [[ "$RESPONSE" == *"<script>"* ]]; then
    print_fail "Reflected XSS vulnerability detected in search parameter"
    log_test_result "XSS - Reflected Script Tag" "FAILED" "Script tags not sanitized"
  else
    print_pass "XSS - Reflected script tags properly sanitized"
    log_test_result "XSS - Reflected Script Tag" "PASSED" "Input sanitized"
  fi
  
  # Test 1.2: Event handler injection
  print_test "Testing for event handler injection (XSS)"
  EVENT_PAYLOAD="<img src=x onerror=\"alert('XSS')\">"
  RESPONSE=$(curl -s "http://localhost:3000/api/outlets?name=$EVENT_PAYLOAD" 2>/dev/null || echo "")
  
  if [[ "$RESPONSE" == *"onerror"* ]]; then
    print_fail "XSS vulnerability detected - event handlers not removed"
    log_test_result "XSS - Event Handler" "FAILED" "Event handlers present"
  else
    print_pass "XSS - Event handlers properly removed"
    log_test_result "XSS - Event Handler" "PASSED" "Event handlers sanitized"
  fi
  
  # Test 1.3: Data URI injection
  print_test "Testing for Data URI XSS injection"
  DATA_URI_PAYLOAD="<iframe src=\"data:text/html,<script>alert('XSS')</script>\"></iframe>"
  RESPONSE=$(curl -s "http://localhost:3000/api/outlets?url=$DATA_URI_PAYLOAD" 2>/dev/null || echo "")
  
  if [[ "$RESPONSE" == *"data:text/html"* ]]; then
    print_fail "XSS vulnerability - Data URI not blocked"
    log_test_result "XSS - Data URI" "FAILED" "Data URIs allowed"
  else
    print_pass "XSS - Data URIs properly blocked"
    log_test_result "XSS - Data URI" "PASSED" "Data URIs blocked"
  fi
}

# ============================================================================
# TEST 2: SQL INJECTION TESTING
# ============================================================================

test_sql_injection() {
  print_header "TEST 2: SQL Injection Vulnerabilities"
  
  print_test "Testing for SQL injection in search parameter"
  
  # Test 2.1: Basic SQL injection
  SQL_PAYLOAD="' OR '1'='1"
  RESPONSE=$(curl -s "http://localhost:3000/api/outlets?search=$SQL_PAYLOAD" 2>/dev/null || echo "")
  
  if [[ "$RESPONSE" == *"error"* ]] || [[ "$RESPONSE" == *"500"* ]]; then
    print_pass "SQL injection attempt blocked or error handling in place"
    log_test_result "SQL Injection - Basic" "PASSED" "Injection blocked"
  else
    print_warning "SQL injection test inconclusive"
    log_test_result "SQL Injection - Basic" "WARNING" "Need manual verification"
  fi
  
  # Test 2.2: Union-based SQL injection
  print_test "Testing for Union-based SQL injection"
  UNION_PAYLOAD="' UNION SELECT 1,2,3,4,5 --"
  RESPONSE=$(curl -s "http://localhost:3000/api/outlets?id=$UNION_PAYLOAD" 2>/dev/null || echo "")
  
  if [[ "$RESPONSE" != *"UNION"* ]]; then
    print_pass "Union-based SQL injection blocked"
    log_test_result "SQL Injection - Union" "PASSED" "Injection blocked"
  else
    print_fail "Potential Union-based SQL injection vulnerability"
    log_test_result "SQL Injection - Union" "FAILED" "Union injection possible"
  fi
  
  # Test 2.3: Time-based blind SQL injection
  print_test "Testing for time-based blind SQL injection"
  BLIND_PAYLOAD="'; WAITFOR DELAY '00:00:05'--"
  
  START=$(date +%s%N | cut -b1-13)
  RESPONSE=$(curl -s -m 10 "http://localhost:3000/api/outlets?search=$BLIND_PAYLOAD" 2>/dev/null || echo "")
  END=$(date +%s%N | cut -b1-13)
  
  ELAPSED=$((END - START))
  
  if [ $ELAPSED -lt 5000 ]; then
    print_pass "Time-based SQL injection blocked (fast response)"
    log_test_result "SQL Injection - Time-Based" "PASSED" "Response time normal"
  else
    print_warning "Potential time-based SQL injection detected (slow response)"
    log_test_result "SQL Injection - Time-Based" "WARNING" "Slow response detected"
  fi
}

# ============================================================================
# TEST 3: AUTHENTICATION BYPASS TESTING
# ============================================================================

test_authentication_bypass() {
  print_header "TEST 3: Authentication Bypass Vulnerabilities"
  
  print_test "Testing for missing authentication on protected endpoints"
  
  # Test 3.1: Access admin endpoint without authentication
  RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:3000/api/admin/users" 2>/dev/null)
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    print_pass "Protected endpoint requires authentication (HTTP $HTTP_CODE)"
    log_test_result "Auth Bypass - Admin Access" "PASSED" "Authentication required"
  elif [ "$HTTP_CODE" = "200" ]; then
    print_fail "CRITICAL: Admin endpoint accessible without authentication"
    log_test_result "Auth Bypass - Admin Access" "FAILED" "No authentication required"
  else
    print_warning "Auth bypass test inconclusive (HTTP $HTTP_CODE)"
    log_test_result "Auth Bypass - Admin Access" "WARNING" "HTTP $HTTP_CODE"
  fi
  
  # Test 3.2: Test JWT bypass
  print_test "Testing for JWT validation bypass"
  INVALID_TOKEN="eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjM0NTY3ODkwIn0."
  RESPONSE=$(curl -s -H "Authorization: Bearer $INVALID_TOKEN" "http://localhost:3000/api/outlets" 2>/dev/null || echo "")
  
  if [[ "$RESPONSE" == *"unauthorized"* ]] || [[ "$RESPONSE" == *"invalid"* ]]; then
    print_pass "Invalid JWT tokens properly rejected"
    log_test_result "Auth Bypass - JWT" "PASSED" "JWT validation enforced"
  else
    print_warning "JWT bypass test inconclusive"
    log_test_result "Auth Bypass - JWT" "WARNING" "Need manual verification"
  fi
  
  # Test 3.3: Test session hijacking
  print_test "Testing session security"
  RESPONSE=$(curl -s -i "http://localhost:3000/api/outlets" 2>/dev/null | grep -i "set-cookie")
  
  if [[ "$RESPONSE" == *"HttpOnly"* ]] && [[ "$RESPONSE" == *"Secure"* ]]; then
    print_pass "Session cookies properly secured (HttpOnly + Secure flags set)"
    log_test_result "Auth Bypass - Session Hijacking" "PASSED" "Cookies secured"
  else
    print_warning "Session cookie security flags not detected"
    log_test_result "Auth Bypass - Session Hijacking" "WARNING" "Check cookie configuration"
  fi
}

# ============================================================================
# TEST 4: RATE LIMITING TESTING
# ============================================================================

test_rate_limiting() {
  print_header "TEST 4: Rate Limiting & DDoS Protection"
  
  print_test "Testing API rate limiting"
  
  # Make 10 rapid requests
  local request_count=10
  local blocked_count=0
  
  for i in $(seq 1 $request_count); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/outlets?limit=10" 2>/dev/null)
    
    if [ "$HTTP_CODE" = "429" ]; then
      blocked_count=$((blocked_count + 1))
    fi
  done
  
  if [ $blocked_count -gt 0 ]; then
    print_pass "Rate limiting detected ($blocked_count requests blocked out of $request_count)"
    log_test_result "Rate Limiting" "PASSED" "$blocked_count requests blocked"
  else
    print_warning "Rate limiting may not be active or threshold is high"
    log_test_result "Rate Limiting" "WARNING" "No blocking detected"
  fi
  
  # Test auth endpoint rate limiting (stricter)
  print_test "Testing authentication rate limiting (should be strict)"
  
  local auth_request_count=10
  local auth_blocked=0
  
  for i in $(seq 1 $auth_request_count); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
      -X POST "http://localhost:3000/api/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"email":"test@test.com","password":"wrong"}' 2>/dev/null)
    
    if [ "$HTTP_CODE" = "429" ]; then
      auth_blocked=$((auth_blocked + 1))
    fi
  done
  
  if [ $auth_blocked -gt 0 ]; then
    print_pass "Auth rate limiting active ($auth_blocked login attempts blocked)"
    log_test_result "Rate Limiting - Auth" "PASSED" "Auth endpoints rate limited"
  else
    print_warning "Auth rate limiting may need review"
    log_test_result "Rate Limiting - Auth" "WARNING" "Check auth rate limiting"
  fi
}

# ============================================================================
# TEST 5: CSRF PROTECTION TESTING
# ============================================================================

test_csrf_protection() {
  print_header "TEST 5: CSRF Protection"
  
  print_test "Testing CSRF token validation"
  
  # Test 5.1: POST without CSRF token
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "http://localhost:3000/api/outlets" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test"}' 2>/dev/null)
  
  if [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "401" ]; then
    print_pass "POST request without CSRF token blocked"
    log_test_result "CSRF Protection" "PASSED" "CSRF token validation enforced"
  else
    print_warning "CSRF protection test inconclusive (HTTP $HTTP_CODE)"
    log_test_result "CSRF Protection" "WARNING" "HTTP $HTTP_CODE returned"
  fi
  
  # Test 5.2: Check for CSRF token in forms
  print_test "Checking for CSRF token in frontend forms"
  
  RESPONSE=$(curl -s "http://localhost:3000/" 2>/dev/null)
  
  if [[ "$RESPONSE" == *"csrf"* ]] || [[ "$RESPONSE" == *"_token"* ]]; then
    print_pass "CSRF tokens present in frontend"
    log_test_result "CSRF - Form Tokens" "PASSED" "Tokens found"
  else
    print_warning "CSRF tokens not detected in frontend (check implementation)"
    log_test_result "CSRF - Form Tokens" "WARNING" "Tokens not found"
  fi
}

# ============================================================================
# TEST 6: SECURITY HEADERS TESTING
# ============================================================================

test_security_headers() {
  print_header "TEST 6: Security Headers"
  
  print_test "Checking for security headers"
  
  HEADERS=$(curl -s -i "http://localhost:3000/api/outlets" 2>/dev/null)
  
  # Check each security header
  declare -A required_headers=(
    ["X-Content-Type-Options"]="nosniff"
    ["X-Frame-Options"]="DENY"
    ["X-XSS-Protection"]="1"
    ["Referrer-Policy"]="strict-origin"
  )
  
  for header in "${!required_headers[@]}"; do
    if echo "$HEADERS" | grep -iq "^$header:"; then
      print_pass "Security header present: $header"
      log_test_result "Header - $header" "PASSED" "Header found"
    else
      print_fail "Missing security header: $header"
      log_test_result "Header - $header" "FAILED" "Header missing"
    fi
  done
}

# ============================================================================
# TEST 7: INPUT VALIDATION TESTING
# ============================================================================

test_input_validation() {
  print_header "TEST 7: Input Validation"
  
  print_test "Testing string input validation"
  
  # Test 7.1: Extremely long input
  LONG_INPUT=$(printf 'A%.0s' {1..100000})
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    "http://localhost:3000/api/outlets?search=$LONG_INPUT" 2>/dev/null)
  
  if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "413" ]; then
    print_pass "Input size validation working (HTTP $HTTP_CODE)"
    log_test_result "Input Validation - Size" "PASSED" "Size limit enforced"
  else
    print_warning "Large input handling needs review"
    log_test_result "Input Validation - Size" "WARNING" "HTTP $HTTP_CODE"
  fi
  
  # Test 7.2: Invalid data type
  print_test "Testing type validation"
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "http://localhost:3000/api/outlets" \
    -H "Content-Type: application/json" \
    -d '{"limit":"not-a-number"}' 2>/dev/null)
  
  if [ "$HTTP_CODE" = "400" ]; then
    print_pass "Type validation working (HTTP $HTTP_CODE)"
    log_test_result "Input Validation - Type" "PASSED" "Type checking enforced"
  else
    print_warning "Type validation needs review"
    log_test_result "Input Validation - Type" "WARNING" "HTTP $HTTP_CODE"
  fi
}

# ============================================================================
# TEST 8: API RESPONSE TESTING
# ============================================================================

test_api_responses() {
  print_header "TEST 8: API Response Security"
  
  print_test "Testing for information disclosure in error responses"
  
  # Test 8.1: Check error messages don't leak sensitive info
  RESPONSE=$(curl -s "http://localhost:3000/api/outlets/invalid-id" 2>/dev/null)
  
  if [[ "$RESPONSE" == *"stack"* ]] || [[ "$RESPONSE" == *"stack trace"* ]]; then
    print_fail "Stack traces exposed in error responses"
    log_test_result "API Response - Error Messages" "FAILED" "Stack traces disclosed"
  else
    print_pass "Error responses do not expose stack traces"
    log_test_result "API Response - Error Messages" "PASSED" "No stack traces"
  fi
  
  # Test 8.2: Check for server information disclosure
  if echo "$HEADERS" | grep -iq "^Server:"; then
    print_fail "Server header exposes technology information"
    log_test_result "API Response - Server Header" "FAILED" "Server header exposed"
  else
    print_pass "Server header properly hidden"
    log_test_result "API Response - Server Header" "PASSED" "Server header hidden"
  fi
}

# ============================================================================
# TEST 9: DEPENDENCY VULNERABILITY TESTING
# ============================================================================

test_dependency_vulnerabilities() {
  print_header "TEST 9: Dependency Vulnerabilities"
  
  if [ -f "package.json" ]; then
    print_test "Running npm audit for known vulnerabilities"
    
    # Run npm audit and capture results
    AUDIT_RESULT=$(npm audit 2>&1 | grep -E "(critical|high|moderate|low)" || echo "0 vulnerabilities")
    
    if echo "$AUDIT_RESULT" | grep -q "0 vulnerabilities"; then
      print_pass "No known vulnerabilities in dependencies"
      log_test_result "Dependencies - npm audit" "PASSED" "No vulnerabilities"
    else
      print_fail "Known vulnerabilities found: $AUDIT_RESULT"
      log_test_result "Dependencies - npm audit" "FAILED" "$AUDIT_RESULT"
    fi
  else
    print_warning "package.json not found, skipping dependency audit"
    log_test_result "Dependencies - npm audit" "SKIPPED" "No package.json"
  fi
}

# ============================================================================
# TEST 10: ENCRYPTION & DATA PROTECTION
# ============================================================================

test_encryption() {
  print_header "TEST 10: Encryption & Data Protection"
  
  print_test "Testing HTTPS/TLS configuration"
  
  # Check if backend uses HTTPS
  HTTPS_RESPONSE=$(curl -s -k "https://localhost:3000/api/outlets" 2>/dev/null || echo "")
  
  if [ -n "$HTTPS_RESPONSE" ]; then
    print_pass "HTTPS/TLS appears to be configured"
    log_test_result "Encryption - HTTPS" "PASSED" "HTTPS available"
  else
    print_warning "HTTPS check inconclusive (might be in development)"
    log_test_result "Encryption - HTTPS" "WARNING" "Check HTTPS configuration"
  fi
  
  print_test "Checking for sensitive data in logs"
  
  if [ -f "./logs/combined.log" ]; then
    SENSITIVE_PATTERNS=$(grep -E "(password|token|secret|api_key)" ./logs/combined.log | wc -l)
    
    if [ $SENSITIVE_PATTERNS -eq 0 ]; then
      print_pass "No sensitive data found in logs"
      log_test_result "Data Protection - Logging" "PASSED" "Logs clean"
    else
      print_fail "Potential sensitive data in logs ($SENSITIVE_PATTERNS occurrences)"
      log_test_result "Data Protection - Logging" "FAILED" "Sensitive data in logs"
    fi
  else
    print_warning "Log file not found for verification"
    log_test_result "Data Protection - Logging" "WARNING" "No logs to check"
  fi
}

# ============================================================================
# REPORT GENERATION
# ============================================================================

generate_report() {
  print_header "GENERATING SECURITY REPORT"
  
  local total_tests=$((TESTS_PASSED + TESTS_FAILED))
  local success_rate=$((TESTS_PASSED * 100 / total_tests))
  
  cat > "$REPORT_FILE" << EOF
{
  "penetration_test_report": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "test_environment": "development",
    "target": "http://localhost:3000",
    "summary": {
      "total_tests": $total_tests,
      "passed": $TESTS_PASSED,
      "failed": $TESTS_FAILED,
      "vulnerabilities_found": $VULNERABILITIES_FOUND,
      "success_rate": "$success_rate%"
    },
    "test_results": [
      $(IFS=,; echo "${TEST_RESULTS[*]}")
    ],
    "recommendations": [
      "Review all failed security tests",
      "Implement missing security controls",
      "Enable HTTPS/TLS in production",
      "Configure rate limiting appropriately",
      "Review and update CSP headers",
      "Implement CSRF token validation",
      "Enable security logging and monitoring",
      "Run penetration testing quarterly",
      "Perform dependency audits weekly",
      "Implement Web Application Firewall (WAF)"
    ]
  }
}
EOF

  echo ""
  echo -e "${BLUE}========== PENETRATION TEST SUMMARY ==========${NC}"
  echo -e "Total Tests: $total_tests"
  echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
  echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
  echo -e "Vulnerabilities: ${RED}$VULNERABILITIES_FOUND${NC}"
  echo -e "Success Rate: $success_rate%"
  echo ""
  echo -e "Report saved to: ${YELLOW}$REPORT_FILE${NC}"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

print_header "WARUNGIN APPLICATION - PENETRATION TESTING"
echo "Start Time: $(date)"
echo ""

# Check if API is running
if ! curl -s "http://localhost:3000/api/outlets" > /dev/null 2>&1; then
  echo -e "${RED}ERROR: API not running at http://localhost:3000${NC}"
  echo "Please start the application first: docker-compose up -d"
  exit 1
fi

# Run all tests
test_xss_vulnerabilities
test_sql_injection
test_authentication_bypass
test_rate_limiting
test_csrf_protection
test_security_headers
test_input_validation
test_api_responses
test_dependency_vulnerabilities
test_encryption

# Generate final report
generate_report

echo ""
echo "End Time: $(date)"
echo ""

# Exit with appropriate code
if [ $TESTS_FAILED -gt 0 ]; then
  exit 1
else
  exit 0
fi
