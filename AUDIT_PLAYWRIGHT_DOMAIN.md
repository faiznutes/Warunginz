# AUDIT PLAYWRIGHT DOMAIN

Generated: 2026-03-07T16:21:17.077Z

## Command

- Command: `npx playwright test tests/playwright/domain-walkthrough.spec.ts --workers=1 --reporter=json`
- Working directory: `client/`
- Exit code: 1
- Overall: FAIL

## Summary

- Total tests: 5
- Passed: 4
- Failed: 1
- Skipped: 0
- Flaky: 0

## Per-Role Result

| Role | Status | Test |
|---|---|---|
| SUPER_ADMIN | PASSED | domain-walkthrough.spec.ts > domain walkthrough for SUPER_ADMIN |
| ADMIN_TENANT | PASSED | domain-walkthrough.spec.ts > domain walkthrough for ADMIN_TENANT |
| SUPERVISOR | PASSED | domain-walkthrough.spec.ts > domain walkthrough for SUPERVISOR |
| CASHIER | FAILED | domain-walkthrough.spec.ts > domain walkthrough for CASHIER |
| KITCHEN | PASSED | domain-walkthrough.spec.ts > domain walkthrough for KITCHEN |

## Failures

### domain-walkthrough.spec.ts > domain walkthrough for CASHIER
- Status: failed
```text
Error: Cashier POS audit account must have at least one product

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeGreaterThan[2m([22m[32mexpected[39m[2m)[22m

Expected: > [32m0[39m
Received:   [31m0[39m
```
