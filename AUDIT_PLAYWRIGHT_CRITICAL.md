# AUDIT PLAYWRIGHT CRITICAL

Generated: 2026-03-10T15:18:33.916Z

## Command

- Command: `npx playwright test tests/playwright/critical-role-access.spec.ts --workers=1 --reporter=line`
- Working directory: `client/`
- Exit code: 0
- Overall: PASS

## Summary

- Total tests: 9
- Passed: 9
- Failed: 0
- Skipped: 0
- Flaky: 0

## Per-Role Result

| Role | Status | Test |
|---|---|---|
| SUPER_ADMIN | PASSED | critical route policy and forbidden UI action for SUPER_ADMIN |
| ADMIN_TENANT | PASSED | critical route policy and forbidden UI action for ADMIN_TENANT |
| SUPERVISOR | PASSED | critical route policy and forbidden UI action for SUPERVISOR |
| CASHIER | PASSED | critical route policy and forbidden UI action for CASHIER |
| KITCHEN | PASSED | critical route policy and forbidden UI action for KITCHEN |

## Failures

- None
