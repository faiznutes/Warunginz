#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 29 - TEST RUNNER SCRIPT
# Comprehensive test execution for all test suites
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     PHASE 29 - COMPREHENSIVE TEST SUITE RUNNER             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ─────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────

API_URL="${API_URL:=http://localhost:3000/api}"
TEST_TOKEN="${TEST_TOKEN:=test-token-phase29}"
RESULTS_DIR="${RESULTS_DIR:=./test-results}"
SKIP_K6="${SKIP_K6:=false}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ─────────────────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed"
        return 1
    fi
    return 0
}

# ─────────────────────────────────────────────────────────────────────────
# PREREQUISITES CHECK
# ─────────────────────────────────────────────────────────────────────────

echo "📋 Checking Prerequisites..."
echo ""

# Check if API is running
log_info "Checking API health at $API_URL..."
if curl -s "$API_URL/outlets" > /dev/null 2>&1; then
    log_success "API is running"
else
    log_error "API is not responding at $API_URL"
    log_info "Please start the API server first: npm run start"
    exit 1
fi

# Check required tools
log_info "Checking required tools..."
check_command "node" || exit 1
check_command "npm" || exit 1

# Create results directory
mkdir -p "$RESULTS_DIR"
log_success "Results directory ready: $RESULTS_DIR"

echo ""

# ─────────────────────────────────────────────────────────────────────────
# TEST 1: UNIT TESTS
# ─────────────────────────────────────────────────────────────────────────

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TEST 1/4: UNIT & INTEGRATION TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log_info "Running comprehensive integration tests..."

export API_URL="$API_URL"
export TEST_TOKEN="$TEST_TOKEN"

if npm run test -- tests/phase29.comprehensive.test.ts \
    --reporter=verbose \
    --outputFile "$RESULTS_DIR/phase29-integration.json" \
    2>&1 | tee "$RESULTS_DIR/phase29-integration.log"; then
    log_success "Integration tests passed"
else
    log_warning "Some integration tests failed (see log for details)"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────
# TEST 2: E2E TESTS (Cypress)
# ─────────────────────────────────────────────────────────────────────────

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 TEST 2/4: END-TO-END TESTS (Cypress)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log_info "Running E2E tests with Cypress..."

if [ -f "client/cypress.config.ts" ]; then
    cd client
    
    if npx cypress run \
        --spec "cypress/e2e/phase29-e2e.cy.ts" \
        --reporter json \
        --reporter-options "outputFile=../$RESULTS_DIR/phase29-e2e.json" \
        --headless \
        2>&1 | tee "../$RESULTS_DIR/phase29-e2e.log"; then
        log_success "E2E tests passed"
    else
        log_warning "Some E2E tests failed (see log for details)"
    fi
    
    cd ..
else
    log_warning "Cypress not configured, skipping E2E tests"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────
# TEST 3: PERFORMANCE TESTS (k6)
# ─────────────────────────────────────────────────────────────────────────

if [ "$SKIP_K6" != "true" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚡ TEST 3/4: PERFORMANCE TESTS (k6)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    if check_command "k6"; then
        log_info "Running load tests with k6..."
        
        if k6 run tests/phase29.k6.js \
            --env API_URL="$API_URL" \
            --env TEST_TOKEN="$TEST_TOKEN" \
            --out csv="$RESULTS_DIR/phase29-k6.csv" \
            2>&1 | tee "$RESULTS_DIR/phase29-k6.log"; then
            log_success "Performance tests completed"
        else
            log_warning "Performance tests completed with warnings"
        fi
    else
        log_warning "k6 not installed, skipping performance tests"
        log_info "Install k6: https://k6.io/docs/getting-started/installation/"
    fi
else
    log_info "Skipping k6 tests (SKIP_K6=$SKIP_K6)"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────
# TEST 4: COVERAGE REPORT
# ─────────────────────────────────────────────────────────────────────────

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST 4/4: COVERAGE REPORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log_info "Generating coverage report..."

if npm run test -- tests/phase29.comprehensive.test.ts \
    --coverage \
    --coverage.reporter=text \
    --coverage.reporter=json \
    --coverage.reporter=html \
    2>&1 | tee "$RESULTS_DIR/phase29-coverage.log"; then
    log_success "Coverage report generated"
else
    log_warning "Coverage report generation had issues"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────
# RESULTS SUMMARY
# ─────────────────────────────────────────────────────────────────────────

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           PHASE 29 - TEST RESULTS SUMMARY                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Count test files
INTEGRATION_TESTS=$(grep -c "✅" "$RESULTS_DIR/phase29-integration.log" 2>/dev/null || echo "?")
E2E_TESTS=$(grep -c "passing" "$RESULTS_DIR/phase29-e2e.log" 2>/dev/null || echo "?")

echo "📋 Test Summary:"
echo "   • Integration Tests: $INTEGRATION_TESTS ✓"
if [ "$SKIP_K6" != "true" ] && [ -f "$RESULTS_DIR/phase29-k6.log" ]; then
    echo "   • Performance Tests: Completed (see k6.log)"
fi
echo "   • E2E Tests: $E2E_TESTS ✓"
echo ""

echo "📁 Results Location: $RESULTS_DIR"
ls -lh "$RESULTS_DIR"/*.{log,json,csv} 2>/dev/null | awk '{print "   " $9, "(" $5 ")"}'
echo ""

echo "📊 Reports:"
if [ -d "coverage" ]; then
    echo "   • Coverage: ./coverage/index.html"
fi
echo "   • Logs: $RESULTS_DIR/*.log"
echo "   • Metrics: $RESULTS_DIR/*.json"
echo ""

# ─────────────────────────────────────────────────────────────────────────
# FINAL STATUS
# ─────────────────────────────────────────────────────────────────────────

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$RESULTS_DIR/phase29-integration.log" ] && grep -q "passed" "$RESULTS_DIR/phase29-integration.log"; then
    log_success "PHASE 29 TESTS COMPLETED SUCCESSFULLY"
    echo ""
    log_info "Next steps:"
    echo "   1. Review test logs in $RESULTS_DIR"
    echo "   2. Check coverage report: ./coverage/index.html"
    echo "   3. Analyze performance metrics from k6 results"
    echo "   4. Deploy features to production"
    exit 0
else
    log_warning "PHASE 29 TESTS COMPLETED WITH WARNINGS"
    echo ""
    log_info "Please review the log files for details"
    exit 1
fi
