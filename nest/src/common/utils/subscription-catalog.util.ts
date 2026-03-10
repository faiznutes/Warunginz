export type PlanCode = "BASIC" | "PRO" | "ENTERPRISE";

export type TenantFeatureCode =
  | "BUSINESS_ANALYTICS"
  | "DELIVERY_MARKETING"
  | "DISCOUNTS";

type AddonLike = {
  addonId?: string | null;
  addonType?: string | null;
  status?: string | null;
  expiresAt?: Date | string | null;
  limit?: number | null;
  currentUsage?: number | null;
};

export const PLAN_CATALOG = [
  {
    id: "BASIC",
    name: "Starter",
    price: 0,
    priceMonthly: 0,
    features: [
      "1 Outlet",
      "1 Pengguna",
      "100 Produk",
      "Laporan Dasar",
      "POS Kasir",
    ],
    limits: { outlets: 1, users: 1, products: 100 },
  },
  {
    id: "PRO",
    name: "Boost",
    price: 199000,
    priceMonthly: 199000,
    features: [
      "5 Outlet",
      "10 Pengguna",
      "1000 Produk",
      "Laporan Lengkap",
      "POS Kasir",
      "Manajemen Stok",
      "Multi-Pembayaran",
      "Supervisor Role",
      "Diskon & Promosi Dasar",
    ],
    limits: { outlets: 5, users: 10, products: 1000 },
  },
  {
    id: "ENTERPRISE",
    name: "Pro Max",
    price: 499000,
    priceMonthly: 499000,
    features: [
      "Unlimited Outlet",
      "Unlimited Pengguna",
      "Unlimited Produk",
      "Laporan Advanced",
      "POS Kasir",
      "Manajemen Stok",
      "Multi-Pembayaran",
      "Supervisor Role",
      "Kitchen Display",
      "Delivery Management",
      "Business Analytics",
      "API Access",
    ],
    limits: { outlets: 999, users: 999, products: 99999 },
  },
] as const;

export const ADDON_CATALOG = [
  {
    id: "addon-analytics",
    name: "Business Analytics",
    type: "ANALYTICS",
    price: 79000,
    priceMonthly: 79000,
    description: "Analisis bisnis lengkap dengan prediksi dan insight",
    features: [
      "Prediksi Penjualan",
      "Analisis Tren",
      "Custom Report",
      "Dashboard Analytics",
    ],
  },
  {
    id: "addon-delivery",
    name: "Delivery Management",
    type: "DELIVERY",
    price: 49000,
    priceMonthly: 49000,
    description: "Kelola pengiriman dan kurir dari dashboard",
    features: ["Tracking Kurir", "Multi Kurir", "Auto Dispatch", "Delivery Report"],
  },
  {
    id: "addon-marketing",
    name: "Marketing & Promosi",
    type: "MARKETING",
    price: 59000,
    priceMonthly: 59000,
    description: "Kirim promosi via email dan SMS ke pelanggan",
    features: [
      "Email Campaign",
      "SMS Blast",
      "Promo Otomatis",
      "Customer Segmentation",
    ],
  },
  {
    id: "addon-outlets",
    name: "Tambah Outlet",
    type: "ADD_OUTLETS",
    price: 49000,
    priceMonthly: 49000,
    description: "Tambahkan outlet baru ke bisnis Anda",
    features: ["1 Outlet Tambahan"],
    limitPerUnit: 1,
  },
  {
    id: "addon-users",
    name: "Tambah Pengguna",
    type: "ADD_USERS",
    price: 29000,
    priceMonthly: 29000,
    description: "Tambahkan pengguna baru ke bisnis Anda",
    features: ["5 Pengguna Tambahan"],
    limitPerUnit: 5,
  },
  {
    id: "addon-products",
    name: "Tambah Produk",
    type: "ADD_PRODUCTS",
    price: 39000,
    priceMonthly: 39000,
    description: "Tambahkan kapasitas produk",
    features: ["500 Produk Tambahan"],
    limitPerUnit: 500,
  },
  {
    id: "addon-bulk-import",
    name: "Bulk Import",
    type: "BULK_IMPORT",
    price: 29000,
    priceMonthly: 29000,
    description: "Import data produk dan pelanggan massal via CSV/Excel",
    features: ["Import Produk", "Import Pelanggan", "Import Stok", "Template Excel"],
  },
  {
    id: "addon-ecommerce",
    name: "E-Commerce Integration",
    type: "E_COMMERCE",
    price: 99000,
    priceMonthly: 99000,
    description: "Integrasi dengan marketplace dan toko online",
    features: ["Tokopedia Sync", "Shopee Sync", "Website Toko", "Katalog Online"],
  },
] as const;

export const PLAN_LIMITS: Record<PlanCode, { outlets: number; users: number; products: number }> = {
  BASIC: { outlets: 1, users: 1, products: 100 },
  PRO: { outlets: 5, users: 10, products: 1000 },
  ENTERPRISE: { outlets: 999, users: 999, products: 99999 },
};

const PLAN_FEATURES: Record<PlanCode, TenantFeatureCode[]> = {
  BASIC: [],
  PRO: ["DISCOUNTS"],
  ENTERPRISE: ["DISCOUNTS", "BUSINESS_ANALYTICS", "DELIVERY_MARKETING"],
};

const FEATURE_ADDON_MATCHERS: Record<TenantFeatureCode, string[]> = {
  BUSINESS_ANALYTICS: ["ANALYTICS", "BUSINESS_ANALYTICS", "addon-analytics"],
  DELIVERY_MARKETING: [
    "DELIVERY",
    "MARKETING",
    "DELIVERY_MARKETING",
    "addon-delivery",
    "addon-marketing",
  ],
  DISCOUNTS: [],
};

export function normalizePlan(plan?: string | null): PlanCode {
  const normalized = String(plan || "BASIC").trim().toUpperCase();
  if (normalized === "ENTERPRISE" || normalized === "MAX") return "ENTERPRISE";
  if (normalized === "PRO" || normalized === "BOOST") return "PRO";
  return "BASIC";
}

export function isAddonActive(addon: AddonLike, now = new Date()): boolean {
  const status = String(addon.status || "").trim().toUpperCase();
  if (status !== "ACTIVE") {
    return false;
  }

  if (!addon.expiresAt) {
    return true;
  }

  const expiresAt =
    addon.expiresAt instanceof Date ? addon.expiresAt : new Date(addon.expiresAt);
  return !Number.isNaN(expiresAt.getTime()) && expiresAt >= now;
}

export function getEffectivePlan(
  subscriptionPlan?: string | null,
  subscriptionEnd?: Date | string | null,
  now = new Date(),
): PlanCode {
  const currentPlan = normalizePlan(subscriptionPlan);

  if (!subscriptionEnd) {
    return currentPlan;
  }

  const endDate =
    subscriptionEnd instanceof Date ? subscriptionEnd : new Date(subscriptionEnd);
  if (Number.isNaN(endDate.getTime())) {
    return currentPlan;
  }

  return endDate < now ? "BASIC" : currentPlan;
}

export function hasTenantFeature(
  feature: TenantFeatureCode,
  effectivePlan: string | null | undefined,
  addons: AddonLike[] = [],
  now = new Date(),
): boolean {
  const normalizedPlan = normalizePlan(effectivePlan);
  if (PLAN_FEATURES[normalizedPlan].includes(feature)) {
    return true;
  }

  const activeAddons = addons.filter((addon) => isAddonActive(addon, now));
  const matchers = FEATURE_ADDON_MATCHERS[feature];
  if (!matchers.length) {
    return false;
  }

  return activeAddons.some((addon) => {
    const addonType = String(addon.addonType || "").trim().toUpperCase();
    const addonId = String(addon.addonId || "").trim();
    return matchers.some(
      (matcher) => matcher === addonType || matcher === addonId,
    );
  });
}

function applyLimitBonuses(
  baseLimits: { outlets: number; users: number; products: number },
  addons: AddonLike[] = [],
) {
  const limits = { ...baseLimits };

  for (const addon of addons) {
    const addonType = String(addon.addonType || "").trim().toUpperCase();
    const addonId = String(addon.addonId || "").trim();
    const addonLimit = Number(addon.limit || 0);

    if (!Number.isFinite(addonLimit) || addonLimit <= 0) {
      continue;
    }

    if (addonType === "ADD_OUTLETS" || addonId === "addon-outlets") {
      limits.outlets += addonLimit;
      continue;
    }

    if (addonType === "ADD_USERS" || addonId === "addon-users") {
      limits.users += addonLimit;
      continue;
    }

    if (addonType === "ADD_PRODUCTS" || addonId === "addon-products") {
      limits.products += addonLimit;
    }
  }

  return limits;
}
export function buildTenantEntitlements(
  tenant: {
    subscriptionPlan?: string | null;
    subscriptionEnd?: Date | string | null;
  },
  addons: AddonLike[] = [],
  now = new Date(),
) {
  const currentPlan = normalizePlan(tenant.subscriptionPlan);
  const effectivePlan = getEffectivePlan(
    tenant.subscriptionPlan,
    tenant.subscriptionEnd,
    now,
  );
  const activeAddons = addons.filter((addon) => isAddonActive(addon, now));
  const features = Object.keys(FEATURE_ADDON_MATCHERS).filter((feature) =>
    hasTenantFeature(
      feature as TenantFeatureCode,
      effectivePlan,
      activeAddons,
      now,
    ),
  ) as TenantFeatureCode[];

  return {
    currentPlan,
    effectivePlan,
    subscriptionExpired: effectivePlan === "BASIC" && currentPlan !== "BASIC",
    limits: applyLimitBonuses(PLAN_LIMITS[effectivePlan], activeAddons),
    features,
    activeAddons,
  };
}

export function resolveAddonCatalogItem(addon: {
  addonId?: string | null;
  addonType?: string | null;
}) {
  const addonId = String(addon.addonId || "").trim();
  const addonType = String(addon.addonType || "").trim().toUpperCase();
  return (
    ADDON_CATALOG.find((item) => item.id === addonId) ||
    ADDON_CATALOG.find((item) => item.type === addonType)
  );
}

