# AUDIT PLAYWRIGHT CRITICAL

Generated: 2026-03-07T16:16:38.288Z

## Command

- Command: `npx playwright test tests/playwright/critical-role-access.spec.ts --workers=1 --reporter=json`
- Working directory: `client/`
- Exit code: 0
- Overall: PASS

## Summary

- Total tests: 6
- Passed: 6
- Failed: 0
- Skipped: 0
- Flaky: 0

## Per-Role Result

| Role | Status | Test |
|---|---|---|
| SUPER_ADMIN | PASSED | critical-role-access.spec.ts > critical route policy and forbidden UI action for SUPER_ADMIN |
| ADMIN_TENANT | PASSED | critical-role-access.spec.ts > critical route policy and forbidden UI action for ADMIN_TENANT |
| SUPERVISOR | PASSED | critical-role-access.spec.ts > critical route policy and forbidden UI action for SUPERVISOR |
| CASHIER | PASSED | critical-role-access.spec.ts > critical route policy and forbidden UI action for CASHIER |
| KITCHEN | PASSED | critical-role-access.spec.ts > critical route policy and forbidden UI action for KITCHEN |

## Failures

- None
