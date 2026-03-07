# Warungin E2E Test Plan

This document outlines the critical user journeys (CUJs) to be tested via End-to-End (E2E) automation (e.g., Cypress/Playwright) or Manual QA.

## 1. Authentication Suite
**Priority**: Critical
**Target**: `/login`

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AUTH-001 | User Login (Success) | 1. Navigate to `/login`<br>2. Enter valid email & password<br>3. Click "Masuk" | Redirects to Dashboard/POS based on role. |
| AUTH-002 | Login Failure (Invalid Creds) | 1. Enter invalid password<br>2. Click "Masuk" | Shows error toast "Invalid email or password". |
| AUTH-003 | Password Toggle | 1. Type password<br>2. Click Eye Icon | Password field type toggles between `password` and `text`. |

## 2. POS Operations Suite
**Priority**: Critical
**Target**: `/pos`

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| POS-001 | Add Item to Cart | 1. Click on a product card<br>2. Check Cart | Item appears in cart with Qty 1. Total updates. |
| POS-002 | Search Product | 1. Type "Kopi" in search bar | Grid filters to show only "Kopi" items. |
| POS-003 | Increase Quantity | 1. Click `+` on cart item | Qty increases. Total recalculates. |
| POS-004 | Clear Cart | 1. Click "Clear All" | Cart becomes empty. Total resets to 0. |

## 3. Checkout Flow
**Priority**: Critical
**Target**: `/pos`

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| PAY-001 | Cash Payment (Full) | 1. Add items (Total: 50k)<br>2. Click "Bayar"<br>3. Select CASH<br>4. Enter 50k<br>5. Confirm | Success Modal appears. Receipt data generated. |
| PAY-002 | QRIS Payment | 1. Click "Bayar"<br>2. Select QRIS | QR Code modal appears (Mock/Sandbox). |

## 4. Layout & Responsive
**Priority**: High
**Target**: All Pages

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| UI-001 | Mobile Sidebar | 1. Resize viewport to mobile<br>2. Click Hamburger Menu | Sidebar slides in. |
| UI-002 | Landscape Warning | 1. Resize to Portrait (Mobile)<br>2. Visit Simple POS | Warning "Rotate Device" appears. |
