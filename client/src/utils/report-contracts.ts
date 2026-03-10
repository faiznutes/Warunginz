export type ReportTypeOption = {
  value: "sales" | "financial";
  label: string;
};

export type ExportModeOption = {
  value: "report" | "analytics" | "both";
  label: string;
};

type SalesSummary = {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalItems: number;
  todayRevenue: number;
  todayOrders: number;
  activeShifts: number;
  totalProducts: number;
};

type NormalizedSalesEntry = {
  date: string;
  outletId: string | null;
  revenue: number;
  grossSales: number;
  discount: number;
  count: number;
  completedOrders: number;
  averageOrderValue: number;
  orders: any[];
  products: any[];
};

const SALES_ONLY_ROLES = new Set(["CASHIER", "SUPERVISOR", "KITCHEN"]);

export function canAccessFinancialReports(role?: string | null): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN_TENANT";
}

export function getAvailableReportTypes(role?: string | null): ReportTypeOption[] {
  const options: ReportTypeOption[] = [
    { value: "sales", label: "Laporan Penjualan" },
  ];

  if (canAccessFinancialReports(role)) {
    options.push({ value: "financial", label: "Laporan Keuangan" });
  }

  return options;
}

export function getAvailableExportModes(role?: string | null): ExportModeOption[] {
  if (role === "CASHIER") {
    return [{ value: "report", label: "Laporan" }];
  }

  return [
    { value: "report", label: "Laporan" },
    { value: "analytics", label: "Analitik" },
    { value: "both", label: "Keduanya" },
  ];
}

export function supportsAnalyticsExports(role?: string | null): boolean {
  return role !== "CASHIER" && role !== "KITCHEN";
}

export function normalizeSalesReportData(
  summaryPayload: any,
  dailySalesPayload: any,
): {
  summary: SalesSummary;
  byDate: NormalizedSalesEntry[];
} {
  const rawEntries = Array.isArray(dailySalesPayload?.data)
    ? dailySalesPayload.data
    : Array.isArray(dailySalesPayload)
      ? dailySalesPayload
      : [];

  const byDate = rawEntries.map((entry: any) => {
    const revenue = Number(entry?.net_sales ?? entry?.revenue ?? 0);
    const grossSales = Number(entry?.gross_sales ?? revenue);
    const discount = Number(entry?.total_discount ?? 0);
    const completedOrders = Number(entry?.completed_orders ?? entry?.count ?? entry?.order_count ?? 0);
    const count = Number(entry?.count ?? entry?.order_count ?? completedOrders ?? 0);

    return {
      date: String(entry?.sales_date ?? entry?.date ?? ""),
      outletId:
        typeof entry?.outlet_id === "string" && entry.outlet_id.trim().length > 0
          ? entry.outlet_id
          : null,
      revenue,
      grossSales,
      discount,
      count,
      completedOrders,
      averageOrderValue: count > 0 ? revenue / count : 0,
      orders: Array.isArray(entry?.orders) ? entry.orders : [],
      products: Array.isArray(entry?.products) ? entry.products : [],
    };
  });

  const totalRevenue = byDate.reduce(
    (sum: number, entry: NormalizedSalesEntry) => sum + entry.revenue,
    0,
  );
  const totalOrders = byDate.reduce(
    (sum: number, entry: NormalizedSalesEntry) => sum + entry.count,
    0,
  );

  return {
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      totalItems: 0,
      todayRevenue: Number(summaryPayload?.todayRevenue ?? 0),
      todayOrders: Number(summaryPayload?.todayOrders ?? 0),
      activeShifts: Number(summaryPayload?.activeShifts ?? 0),
      totalProducts: Number(summaryPayload?.totalProducts ?? 0),
    },
    byDate,
  };
}

export function normalizeFinancialReportData(financialPayload: any) {
  const revenue = Number(financialPayload?.totalRevenue ?? financialPayload?.revenue ?? 0);
  const costOfGoods = Number(financialPayload?.totalCost ?? financialPayload?.costOfGoods ?? 0);
  const grossProfit = Number(financialPayload?.profit ?? financialPayload?.grossProfit ?? 0);
  const explicitMargin = Number(financialPayload?.margin ?? financialPayload?.profitMargin ?? 0);
  const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : explicitMargin;

  return {
    revenue,
    costOfGoods,
    grossProfit,
    profitMargin,
    byDate: [],
  };
}

export function shouldRestrictReportsToSales(role?: string | null): boolean {
  return SALES_ONLY_ROLES.has(role || "");
}
