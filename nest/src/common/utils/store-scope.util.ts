import { ForbiddenException } from "@nestjs/common";

export interface StoreScopedUser {
  role?: string;
  assignedStoreId?: string | null;
  permissions?: Record<string, unknown> | null;
}

const STORE_SCOPED_ROLES = new Set(["CASHIER", "KITCHEN", "SUPERVISOR"]);

function normalizeStoreId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeStoreIds(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const uniqueIds = new Set<string>();

  for (const value of values) {
    const normalized = normalizeStoreId(value);
    if (normalized) uniqueIds.add(normalized);
  }

  return Array.from(uniqueIds);
}

function permissionObject(
  user?: StoreScopedUser | null,
): Record<string, unknown> {
  if (!user?.permissions || typeof user.permissions !== "object") return {};
  return user.permissions;
}

export function getAllowedOutletIds(user?: StoreScopedUser | null): string[] | null {
  if (!user?.role || !STORE_SCOPED_ROLES.has(user.role)) {
    return null;
  }

  const permissions = permissionObject(user);

  if (user.role === "CASHIER" || user.role === "KITCHEN") {
    const assignedStoreId =
      normalizeStoreId(user.assignedStoreId) ||
      normalizeStoreId(permissions.assignedStoreId);

    if (!assignedStoreId) {
      throw new ForbiddenException(
        "Store assignment is required for this role",
      );
    }

    return [assignedStoreId];
  }

  if (user.role === "SUPERVISOR") {
    const allowedStoreIds = normalizeStoreIds(permissions.allowedStoreIds);

    if (allowedStoreIds.length === 0) {
      throw new ForbiddenException(
        "Allowed stores are required for supervisor role",
      );
    }

    return allowedStoreIds;
  }

  return null;
}

export function applyOutletScopeToWhere(
  where: Record<string, unknown>,
  allowedOutletIds: string[] | null,
  requestedOutletId?: string | null,
  scopeField: string = "outletId",
): void {
  const normalizedRequested = normalizeStoreId(requestedOutletId);

  if (!allowedOutletIds) {
    if (normalizedRequested) {
      where[scopeField] = normalizedRequested;
    }
    return;
  }

  if (normalizedRequested) {
    if (!allowedOutletIds.includes(normalizedRequested)) {
      throw new ForbiddenException("You are not allowed to access this store");
    }
    where[scopeField] = normalizedRequested;
    return;
  }

  where[scopeField] =
    allowedOutletIds.length === 1
      ? allowedOutletIds[0]
      : { in: allowedOutletIds };
}
