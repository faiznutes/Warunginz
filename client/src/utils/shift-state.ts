export type CashierShiftState =
  | "no_store_shift_no_cash_shift"
  | "store_shift_open_no_cash_shift"
  | "store_shift_open_cash_shift_open"
  | "recovery_close_required";

export interface StoreShiftSnapshot {
  id: string;
  status?: string | null;
  closedAt?: string | null;
  outletId?: string | null;
  outlet?: {
    id?: string | null;
    name?: string | null;
  } | null;
  [key: string]: unknown;
}

export interface CashShiftSnapshot {
  id: string;
  status?: string | null;
  shiftEnd?: string | null;
  shiftStart?: string | null;
  storeShiftId?: string | null;
  storeShift?: StoreShiftSnapshot | null;
  totalSales?: number;
  totalPenjualan?: number;
  [key: string]: unknown;
}

export interface ShiftContext {
  state: CashierShiftState;
  storeId: string | null;
  storeShift: StoreShiftSnapshot | null;
  cashShift: CashShiftSnapshot | null;
  requiresOpenShift: boolean;
  requiresRecoveryClose: boolean;
  hasHealthyActiveShift: boolean;
  hasActiveCashShift: boolean;
}

const SINGLE_PAYLOAD_KEYS = new Set([
  "data",
  "success",
  "message",
  "code",
  "status",
]);

function shouldUnwrap(current: Record<string, unknown>): boolean {
  if (!("data" in current)) {
    return false;
  }

  if ("success" in current) {
    return true;
  }

  const keys = Object.keys(current);
  return keys.length > 0 && keys.every((key) => SINGLE_PAYLOAD_KEYS.has(key));
}

export function unwrapApiPayload<T>(input: unknown): T | null {
  let current = input;
  const visited = new Set<unknown>();

  while (
    current &&
    typeof current === "object" &&
    !Array.isArray(current) &&
    !visited.has(current)
  ) {
    visited.add(current);

    if (!shouldUnwrap(current as Record<string, unknown>)) {
      break;
    }

    current = (current as { data?: unknown }).data ?? null;
  }

  return (current ?? null) as T | null;
}

export function getAssignedStoreIdFromUser(
  user: { role?: string; permissions?: Record<string, unknown> | null } | null | undefined,
): string | null {
  if (!user) {
    return null;
  }

  const permissions =
    user.permissions && typeof user.permissions === "object"
      ? user.permissions
      : {};

  const assignedStoreId = permissions.assignedStoreId;
  return typeof assignedStoreId === "string" && assignedStoreId.trim().length > 0
    ? assignedStoreId
    : null;
}

export function getAllowedStoreIdsFromUser(
  user: { role?: string; permissions?: Record<string, unknown> | null } | null | undefined,
): string[] {
  if (!user) {
    return [];
  }

  const permissions =
    user.permissions && typeof user.permissions === "object"
      ? user.permissions
      : {};

  const raw = permissions.allowedStoreIds;
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

export function normalizeOpenStoreShift(
  raw: unknown,
): StoreShiftSnapshot | null {
  const shift = unwrapApiPayload<StoreShiftSnapshot>(raw);

  if (!shift || typeof shift !== "object" || typeof shift.id !== "string") {
    return null;
  }

  if (shift.status && shift.status !== "open") {
    return null;
  }

  if (shift.closedAt) {
    return null;
  }

  return shift;
}

export function normalizeOpenCashShift(
  raw: unknown,
): CashShiftSnapshot | null {
  const shift = unwrapApiPayload<CashShiftSnapshot>(raw);

  if (!shift || typeof shift !== "object" || typeof shift.id !== "string") {
    return null;
  }

  if (shift.status && shift.status !== "open") {
    return null;
  }

  if (shift.shiftEnd) {
    return null;
  }

  return shift;
}

export function buildShiftContext(params: {
  storeId: string | null;
  storeShift: StoreShiftSnapshot | null;
  cashShift: CashShiftSnapshot | null;
}): ShiftContext {
  const { storeId, storeShift, cashShift } = params;
  let state: CashierShiftState = "no_store_shift_no_cash_shift";

  if (cashShift) {
    if (!storeShift) {
      state = "recovery_close_required";
    } else if (cashShift.storeShiftId && cashShift.storeShiftId !== storeShift.id) {
      state = "recovery_close_required";
    } else {
      state = "store_shift_open_cash_shift_open";
    }
  } else if (storeShift) {
    state = "store_shift_open_no_cash_shift";
  }

  return {
    state,
    storeId,
    storeShift,
    cashShift,
    requiresOpenShift:
      state === "no_store_shift_no_cash_shift" ||
      state === "store_shift_open_no_cash_shift",
    requiresRecoveryClose: state === "recovery_close_required",
    hasHealthyActiveShift: state === "store_shift_open_cash_shift_open",
    hasActiveCashShift: !!cashShift,
  };
}
