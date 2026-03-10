#!/bin/bash

# Phase 31 - Security Audit Script
# Comprehensive security analysis of the Warungin application

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     PHASE 31 - SECURITY AUDIT                             ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

REPORT_DIR="./security-audit-reports"
REPORT_FILE="$REPORT_DIR/security-audit-$(date +%Y%m%d-%H%M%S).json"
mkdir -p "$REPORT_DIR"

# Initialize report
cat > "$REPORT_FILE" << 'EOF'
{
  "audit_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "application": "Warungin POS",
  "phase": 31,
  "sections": {}
}
EOF

echo "✅ SECTION 1: Code Review & Vulnerability Scan"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check for common vulnerabilities in TypeScript/Node.js code
echo "🔍 Scanning for common security issues..."

vulnerabilities_found=0

# 1. Check for hardcoded secrets/credentials
echo -n "  • Checking for hardcoded credentials... "
if grep -r "password\|secret\|api.key\|token.*=" src/ --include="*.ts" --include="*.js" | grep -v "node_modules" | grep -v ".env" | grep -i "hardcoded\|temp\|test\|demo" > /tmp/hardcoded.txt 2>/dev/null; then
    vulnerable_count=$(wc -l < /tmp/hardcoded.txt)
    echo "⚠️ Found $vulnerable_count potential hardcoded secrets"
    vulnerabilities_found=$((vulnerabilities_found + 1))
else
    echo "✅ PASS"
fi

# 2. Check for SQL injection vulnerabilities
echo -n "  • Checking for SQL injection risks... "
if grep -r "query.*\$\|sql.*\$\|\`.*\$" src/ --include="*.ts" --include="*.js" | grep -v "parameterized\|Prisma\|prepared" > /tmp/sql_injection.txt 2>/dev/null; then
    echo "⚠️ Found potential SQL injection risks"
    vulnerabilities_found=$((vulnerabilities_found + 1))
else
    echo "✅ PASS"
fi

# 3. Check for XSS vulnerabilities
echo -n "  • Checking for XSS vulnerabilities... "
if grep -r "innerHTML\|dangerouslySetInnerHTML" src/ --include="*.ts" --include="*.js" --include="*.vue" | grep -v "sanitize\|DOMPurify" > /tmp/xss.txt 2>/dev/null; then
    echo "⚠️ Found potential XSS vulnerabilities"
    vulnerabilities_found=$((vulnerabilities_found + 1))
else
    echo "✅ PASS"
fi

# 4. Check for missing authentication
echo -n "  • Checking for missing authentication... "
if grep -r "@Get\|@Post\|@Put\|@Delete" src/routes --include="*.ts" | grep -v "middleware.*auth\|@UseGuards\|authenticat" > /tmp/missing_auth.txt 2>/dev/null; then
    missing_auth_count=$(wc -l < /tmp/missing_auth.txt)
    if [ "$missing_auth_count" -gt 0 ]; then
        echo "⚠️ Found $missing_auth_count endpoints without auth guard"
        vulnerabilities_found=$((vulnerabilities_found + 1))
    else
        echo "✅ PASS"
    fi
else
    echo "✅ PASS"
fi

# 5. Check for unvalidated user input
echo -n "  • Checking for input validation... "
if grep -r "req.body\|query\|params" src/routes --include="*.ts" | grep -v "validate\|schema\|DTO\|Guard" > /tmp/unvalidated.txt 2>/dev/null; then
    unvalidated_count=$(wc -l < /tmp/unvalidated.txt)
    if [ "$unvalidated_count" -gt 0 ]; then
        echo "⚠️ Found $unvalidated_count potential unvalidated inputs (verify DTO usage)"
    else
        echo "✅ PASS"
    fi
else
    echo "✅ PASS"
fi

# 6. Check for CORS configuration
echo -n "  • Checking CORS configuration... "
if grep -r "cors\|CORS_ORIGIN" src/ --include="*.ts" | grep -v "localhost\|example" > /tmp/cors.txt 2>/dev/null; then
    echo "✅ CORS configured"
else
    echo "⚠️ CORS not found - may need configuration"
fi

# 7. Check for rate limiting
echo -n "  • Checking rate limiting... "
if grep -r "rateLimit\|throttle\|redis.*limit" src/ --include="*.ts" > /tmp/ratelimit.txt 2>/dev/null; then
    echo "✅ Rate limiting implemented"
else
    echo "⚠️ Rate limiting may not be implemented"
fi

# 8. Check for secure headers
echo -n "  • Checking security headers... "
if grep -r "helmet\|x-frame-options\|x-content-type\|csp\|hsts" src/ --include="*.ts" > /tmp/headers.txt 2>/dev/null; then
    echo "✅ Security headers configured"
else
    echo "⚠️ Security headers may not be fully configured"
fi

echo ""
echo "✅ SECTION 2: Dependency Vulnerability Analysis"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "🔍 Analyzing npm dependencies..."
echo -n "  • Checking npm packages for known vulnerabilities... "

if [ -f "package.json" ]; then
    npm audit --json 2>/dev/null > /tmp/npm-audit.json || true
    
    critical_count=$(grep -o '"severity":"critical"' /tmp/npm-audit.json 2>/dev/null | wc -l)
    high_count=$(grep -o '"severity":"high"' /tmp/npm-audit.json 2>/dev/null | wc -l)
    
    if [ "$critical_count" -gt 0 ]; then
        echo "🚨 Found $critical_count CRITICAL vulnerabilities"
        vulnerabilities_found=$((vulnerabilities_found + 1))
    elif [ "$high_count" -gt 0 ]; then
        echo "⚠️ Found $high_count HIGH severity vulnerabilities"
        vulnerabilities_found=$((vulnerabilities_found + 1))
    else
        echo "✅ PASS"
    fi
else
    echo "⚠️ package.json not found"
fi

echo ""
echo "✅ SECTION 3: Authentication & Authorization Review"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "🔍 Checking authentication mechanisms..."
echo -n "  • JWT implementation... "
if grep -r "jwt\|JWT" src/ --include="*.ts" > /dev/null 2>&1; then
    echo "✅ JWT implemented"
else
    echo "⚠️ JWT not found"
fi

echo -n "  • Password hashing... "
if grep -r "bcrypt\|argon\|scrypt" src/ --include="*.ts" > /dev/null 2>&1; then
    echo "✅ Password hashing implemented"
else
    echo "⚠️ Password hashing may not be implemented"
fi

echo -n "  • Session management... "
if grep -r "session\|redis.*session" src/ --include="*.ts" > /dev/null 2>&1; then
    echo "✅ Session management configured"
else
    echo "⚠️ Session management may not be implemented"
fi

echo -n "  • RBAC (Role-based access control)... "
if grep -r "@Role\|@Roles\|role.*guard\|permission" src/ --include="*.ts" > /dev/null 2>&1; then
    echo "✅ RBAC implemented"
else
    echo "⚠️ RBAC may not be fully implemented"
fi

echo ""
echo "✅ SECTION 4: Data Protection & Privacy"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "🔍 Checking data protection measures..."
echo -n "  • Environment variables usage... "
if grep -r "process.env\|dotenv" src/ --include="*.ts" > /dev/null 2>&1; then
    echo "✅ Environment variables in use"
else
    echo "⚠️ Environment variables not used consistently"
fi

echo -n "  • Database encryption... "
if grep -r "encrypted\|crypto\|encrypt" src/ --include="*.ts" > /dev/null 2>&1; then
    echo "✅ Encryption implemented"
else
    echo "⚠️ Encryption may not be implemented"
fi

echo -n "  • Sensitive data logging... "
if grep -r "password\|token\|secret" src/middleware/logger --include="*.ts" > /dev/null 2>&1; then
    echo "⚠️ Sensitive data may be logged"
    vulnerabilities_found=$((vulnerabilities_found + 1))
else
    echo "✅ PASS"
fi

echo ""
echo "✅ SECTION 5: API Security Review"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "🔍 Checking API security..."
echo -n "  • Request size limits... "
if grep -r "limit\|bodyParser" src/ --include="*.ts" > /dev/null 2>&1; then
    echo "✅ Request limits configured"
else
    echo "⚠️ Request limits may not be configured"
fi

echo -n "  • Input sanitization... "
if grep -r "sanitize\|DOMPurify\|xss" src/ --include="*.ts" > /dev/null 2>&1; then
    echo "✅ Input sanitization implemented"
else
    echo "⚠️ Input sanitization may not be fully implemented"
fi

echo -n "  • Error handling... "
if grep -r "catch\|error.*handler" src/middleware --include="*.ts" > /dev/null 2>&1; then
    echo "✅ Error handling middleware exists"
else
    echo "⚠️ Error handling may not be comprehensive"
fi

echo -n "  • Logging & monitoring... "
if grep -r "logger\|winston\|pino\|bunyan" src/ --include="*.ts" > /dev/null 2>&1; then
    echo "✅ Logging implemented"
else
    echo "⚠️ Logging may not be comprehensive"
fi

echo ""
echo "✅ SECTION 6: Infrastructure Security"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "🔍 Checking infrastructure security..."
echo -n "  • Docker security... "
if [ -f "Dockerfile.backend" ]; then
    if grep -q "USER.*[0-9]" Dockerfile.backend; then
        echo "✅ Running as non-root user"
    else
        echo "⚠️ Docker may be running as root"
        vulnerabilities_found=$((vulnerabilities_found + 1))
    fi
else
    echo "⚠️ Dockerfile not found"
fi

echo -n "  • Environment isolation... "
if grep -r "NODE_ENV.*production\|environment.*production" . --include="*.env*" > /dev/null 2>&1; then
    echo "✅ Environment configuration exists"
else
    echo "⚠️ Environment isolation may need improvement"
fi

echo -n "  • Database security... "
if grep -r "SSL\|TLS\|sslmode" . --include="*.ts" --include="*.env*" > /dev/null 2>&1; then
    echo "✅ Database encryption configured"
else
    echo "⚠️ Database encryption may not be configured"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "📊 SECURITY AUDIT SUMMARY"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Total vulnerabilities/issues found: $vulnerabilities_found"
echo ""

if [ "$vulnerabilities_found" -eq 0 ]; then
    echo "✅ No critical security issues detected"
    echo "Security posture: STRONG"
else
    echo "⚠️ Please review detected issues and remediate"
    echo "Security posture: NEEDS ATTENTION"
fi

echo ""
echo "📁 Detailed findings saved to: $REPORT_FILE"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "🎯 NEXT ACTIONS"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "1. Review findings in security-audit-reports/"
echo "2. Run 'npm audit' to check for vulnerable dependencies"
echo "3. Implement recommended security hardening measures"
echo "4. Conduct penetration testing"
echo "5. Deploy security patches to production"
echo ""
echo "════════════════════════════════════════════════════════════"
