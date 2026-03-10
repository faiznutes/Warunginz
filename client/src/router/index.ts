import { createRouter, createWebHistory } from "vue-router";
import api from "../api";
import { useAuthStore } from "../stores/auth";
import MarketingLayout from "../layouts/MarketingLayout.vue";
import { addonRoutes } from "./addon.routes";
import { checkStoreAccess } from "./supervisor-store-guard";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0, behavior: "smooth" };
  },
  routes: [
    {
      path: "/",
      component: MarketingLayout,
      children: [
        {
          path: "",
          name: "home",
          component: () => import("../views/marketing/Home.vue"),
        },
        {
          path: "demo",
          name: "demo",
          component: () => import("../views/marketing/Demo.vue"),
        },
        {
          path: "contact",
          name: "contact",
          component: () => import("../views/marketing/Contact.vue"),
        },
        {
          path: "terms",
          name: "terms",
          component: () => import("../views/marketing/Terms.vue"),
        },
        {
          path: "pricing",
          name: "pricing",
          component: () => import("../views/marketing/Pricing.vue"),
        },
        {
          path: "help",
          name: "help",
          component: () => import("../views/marketing/Help.vue"),
        },
        {
          path: "help/:slug",
          name: "help-article",
          component: () => import("../views/marketing/HelpArticle.vue"),
        },
        {
          path: "help/category/:categoryId",
          name: "help-category",
          component: () => import("../views/marketing/HelpCategory.vue"),
        },
      ],
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: () => import("../views/auth/ForgotPassword.vue"),
    },
    {
      path: "/contact/success",
      name: "contact-success",
      component: () => import("../views/marketing/ContactSuccess.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/auth/Login.vue"),
    },
    // Payment callback routes (public, no auth required)
    {
      path: "/payment/success",
      name: "payment-success",
      component: () => import("../views/payment/PaymentCallback.vue"),
      props: (route) => ({ status: "success", ...route.query }),
    },
    {
      path: "/payment/error",
      name: "payment-error",
      component: () => import("../views/payment/PaymentCallback.vue"),
      props: (route) => ({ status: "error", ...route.query }),
    },
    {
      path: "/payment/pending",
      name: "payment-pending",
      component: () => import("../views/payment/PaymentCallback.vue"),
      props: (route) => ({ status: "pending", ...route.query }),
    },
    // Fullscreen POS Route (no layout wrapper for optimal POS experience)
    {
      path: "/pos",
      name: "pos-fullscreen",
      component: () => import("../views/pos/POS.vue"),
      meta: {
        requiresAuth: true,
        roles: ["CASHIER", "SUPERVISOR", "ADMIN_TENANT"],
        fullscreen: true,
      },
    },
    // Fullscreen Open Shift Route (no nav, dedicated shift opening page)
    {
      path: "/open-shift",
      name: "open-shift",
      component: () => import("../views/cashier/OpenShift.vue"),
      meta: {
        requiresAuth: true,
        roles: ["CASHIER", "SUPERVISOR"],
        fullscreen: true,
      },
    },
    // Fullscreen Kitchen Display Route
    {
      path: "/kitchen",
      name: "kitchen-display",
      component: () => import("../views/kitchen/KitchenOrders.vue"),
      meta: {
        requiresAuth: true,
        roles: ["KITCHEN", "SUPERVISOR", "SUPER_ADMIN"],
        fullscreen: true,
      },
    },
    // App Routes - Dynamic Layout based on role
    {
      path: "/app",
      component: () => import("../layouts/DynamicLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "dashboard",
          name: "dashboard",
          component: () => import("../views/dashboard/Dashboard.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN"] },
        },

        {
          path: "cashier/cash-shift",
          name: "cash-shift",
          component: () => import("../views/cashier/CashShift.vue"),
          meta: { roles: ["CASHIER"] },
        },
        {
          path: "super-dashboard",
          name: "super-dashboard",
          component: () => import("../views/superadmin/SuperDashboard.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        // Super Admin only
        {
          path: "tenants",
          name: "tenants",
          component: () => import("../views/tenants/Tenants.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        {
          path: "tenants/:id",
          name: "tenant-detail",
          component: () => import("../views/tenants/TenantDetail.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        {
          path: "tenants/support",
          redirect: "/app/superadmin/contact-messages",
        },
        {
          path: "support",
          name: "client-support",
          component: () => import("../views/support/ClientSupport.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPERVISOR", "CASHIER"] },
        },
        {
          path: "reports/global",
          name: "global-reports",
          component: () => import("../views/reports/GlobalReports.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        {
          path: "superadmin/contact-messages",
          name: "contact-messages",
          component: () => import("../views/superadmin/ContactMessages.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        {
          path: "superadmin/server-monitor",
          name: "server-monitor",
          component: () => import("../views/superadmin/ServerMonitor.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        {
          path: "superadmin/system-info",
          name: "system-info",
          component: () => import("../views/superadmin/SystemInfo.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        {
          path: "settings/system",
          name: "system-settings",
          component: () => import("../views/settings/SystemSettings.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        {
          path: "settings/style-guide",
          name: "style-guide",
          component: () => import("../views/settings/FormStyleGuide.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        {
          path: "settings/table-style-guide",
          name: "table-style-guide",
          component: () => import("../views/settings/TableStyleGuide.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        {
          path: "settings/loading-states-guide",
          name: "loading-states-guide",
          component: () => import("../views/settings/LoadingStatesGuide.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        {
          path: "settings/advanced-components-guide",
          name: "advanced-components-guide",
          component: () =>
            import("../views/settings/AdvancedComponentsGuide.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        {
          path: "settings/additional-components-guide",
          name: "additional-components-guide",
          component: () =>
            import("../views/settings/AdditionalComponentsGuide.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        // Tenant & Super Admin
        {
          path: "products",
          name: "products",
          component: () => import("../views/products/Products.vue"),
          meta: {
            roles: ["ADMIN_TENANT", "SUPERVISOR", "CASHIER", "SUPER_ADMIN"],
            requiresPermission: {
              role: "CASHIER",
              permission: "canManageProducts",
            },
          },
        },
        {
          path: "orders",
          name: "orders",
          component: () => import("../views/orders/Orders.vue"),
          meta: {
            roles: [
              "ADMIN_TENANT",
              "SUPERVISOR",
              "CASHIER",
              "KITCHEN",
              "SUPER_ADMIN",
            ],
          },
        },
        {
          path: "customers",
          name: "customers",
          component: () => import("../views/customers/Customers.vue"),
          meta: {
            roles: ["ADMIN_TENANT", "SUPERVISOR", "CASHIER", "SUPER_ADMIN"],
            requiresPermission: {
              role: "CASHIER",
              permission: "canManageCustomers",
            },
          },
        },
        {
          path: "reports",
          name: "reports",
          component: () => import("../views/reports/Reports.vue"),
          meta: {
            roles: ["ADMIN_TENANT", "SUPERVISOR", "CASHIER", "SUPER_ADMIN"],
          },
        },
        {
          path: "users",
          name: "users",
          component: () => import("../views/users/Users.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPERVISOR", "SUPER_ADMIN"] },
        },
        {
          path: "stores",
          name: "stores",
          component: () => import("../views/stores/Stores.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPERVISOR", "SUPER_ADMIN"] },
        },
        {
          path: "stores/:id",
          name: "store-detail",
          component: () => import("../views/stores/StoreDetail.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPERVISOR", "SUPER_ADMIN"] },
        },
        {
          path: "stores/:id/edit",
          name: "edit-store",
          component: () => import("../views/stores/EditStore.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"] },
        },
        {
          path: "subscription",
          name: "subscription",
          component: () => import("../views/subscription/Subscription.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"] },
        },
        {
          path: "addons",
          name: "addons",
          component: () => import("../views/addons/Addons.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"] },
        },
        {
          path: "rewards",
          name: "rewards",
          component: () => import("../views/rewards/Rewards.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPERVISOR", "SUPER_ADMIN"] },
        },
        {
          path: "reward-view",
          name: "reward-view",
          component: () => import("../views/rewards/RewardView.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPERVISOR", "SUPER_ADMIN"] },
        },
        {
          path: "discounts",
          name: "discounts",
          component: () => import("../views/discounts/Discounts.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"], requiresAddon: "DISCOUNTS" },
        },
        // Addon Features
        ...addonRoutes,
        // Inventory Management
        // Inventory Management
        {
          path: "inventory/suppliers",
          name: "suppliers",
          component: () => import("../views/inventory/Suppliers.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"] },
        },
        {
          path: "inventory/purchase-orders",
          name: "purchase-orders",
          component: () => import("../views/inventory/PurchaseOrders.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"] },
        },
        {
          path: "inventory/stock-alerts",
          name: "stock-alerts",
          component: () => import("../views/inventory/StockAlerts.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"] },
        },
        {
          path: "inventory/restock-suggestions",
          name: "restock-suggestions",
          component: () => import("../views/inventory/RestockSuggestions.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"] },
        },
        {
          path: "inventory/stock-transfers",
          name: "stock-transfers",
          component: () => import("../views/inventory/StockTransfers.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"] },
        },
        // Advanced Reporting
        {
          path: "reports/advanced",
          name: "advanced-reporting",
          component: () => import("../views/reports/AdvancedReporting.vue"),
          meta: {
            roles: ["ADMIN_TENANT", "SUPERVISOR", "SUPER_ADMIN"],
            requiresAddon: "BUSINESS_ANALYTICS",
          },
        },
        // Financial Management Enhancement
        {
          path: "finance/management",
          name: "financial-management",
          component: () => import("../views/finance/FinancialManagement.vue"),
          meta: {
            roles: ["ADMIN_TENANT", "SUPERVISOR", "SUPER_ADMIN"],
            requiresAddon: "BUSINESS_ANALYTICS",
          },
        },
        {
          path: "analytics",
          name: "analytics",
          component: () => import("../views/analytics/AdvancedAnalytics.vue"),
          meta: {
            roles: ["ADMIN_TENANT", "SUPER_ADMIN"],
            requiresAddon: "BUSINESS_ANALYTICS",
          },
        },
        {
          path: "finance",
          name: "finance",
          component: () => import("../views/finance/AccountingFinance.vue"),
          meta: {
            roles: ["ADMIN_TENANT", "SUPER_ADMIN"],
            requiresAddon: "BUSINESS_ANALYTICS",
          },
        },
        {
          path: "finance/transactions",
          name: "transactions",
          component: () => import("../views/finance/Transactions.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"] },
        },
        {
          path: "profit-loss",
          name: "profit-loss",
          component: () => import("../views/finance/ProfitLossReport.vue"),
          meta: {
            roles: ["ADMIN_TENANT", "SUPER_ADMIN"],
            requiresAddon: "BUSINESS_ANALYTICS",
          },
        },
        {
          path: "settings/preferences",
          name: "preferences",
          component: () => import("../views/settings/Preferences.vue"),
          meta: {
            roles: [
              "ADMIN_TENANT",
              "SUPERVISOR",
              "CASHIER",
              "KITCHEN",
              "SUPER_ADMIN",
            ],
          },
        },
        {
          path: "settings/store",
          name: "store-settings",
          component: () => import("../views/settings/StoreSettings.vue"),
          meta: { roles: ["ADMIN_TENANT"] },
        },
        {
          path: "settings/2fa",
          name: "two-factor-auth",
          component: () => import("../views/settings/TwoFactorAuth.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPERVISOR", "SUPER_ADMIN"] },
        },
        {
          path: "settings/webhooks",
          name: "webhooks",
          component: () => import("../views/settings/Webhooks.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"] },
        },
        {
          path: "settings/webhooks/tester",
          name: "webhook-tester",
          component: () => import("../views/settings/WebhookTester.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"] },
        },
        {
          path: "settings/sessions",
          name: "sessions",
          component: () => import("../views/settings/Sessions.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPERVISOR", "SUPER_ADMIN"] },
        },
        {
          path: "settings/password",
          name: "password-settings",
          component: () => import("../views/settings/PasswordSettings.vue"),
          meta: {
            roles: [
              "ADMIN_TENANT",
              "SUPERVISOR",
              "CASHIER",
              "KITCHEN",
              "SUPER_ADMIN",
            ],
          },
        },
        {
          path: "settings/gdpr",
          name: "gdpr-settings",
          component: () => import("../views/settings/GDPRSettings.vue"),
          meta: {
            roles: [
              "ADMIN_TENANT",
              "SUPERVISOR",
              "CASHIER",
              "KITCHEN",
              "SUPER_ADMIN",
            ],
          },
        },
        {
          path: "settings/archive",
          name: "archive-management",
          component: () => import("../views/settings/ArchiveManagement.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        {
          path: "settings/retention",
          name: "retention-management",
          component: () => import("../views/settings/RetentionManagement.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        {
          path: "superadmin/backups",
          name: "superadmin-backups",
          component: () => import("../views/superadmin/BackupManagement.vue"),
          meta: { roles: ["SUPER_ADMIN"] },
        },
        {
          path: "products/adjustments",
          name: "product-adjustments",
          component: () => import("../views/products/ProductAdjustments.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"] },
        },
        {
          path: "receipts/templates",
          name: "receipt-templates",
          component: () => import("../views/receipts/ReceiptTemplates.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"] },
        },
        {
          path: "reports/stores",
          name: "store-reports",
          component: () => import("../views/reports/StoreReports.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPERVISOR", "SUPER_ADMIN"] },
        },
        {
          path: "settings/subscription",
          name: "subscription-plans",
          component: () => import("../views/settings/SubscriptionPlans.vue"),
          meta: { roles: ["ADMIN_TENANT", "SUPER_ADMIN"] },
        },

        // Failed Sync Review (for offline orders that failed to sync)
        {
          path: "pos/failed-syncs",
          name: "failed-sync-review",
          component: () => import("../views/pos/FailedSyncReview.vue"),
          meta: {
            roles: ["CASHIER", "ADMIN_TENANT", "SUPERVISOR", "SUPER_ADMIN"],
          },
        },
        // Kitchen only
        {
          path: "orders/kitchen",
          name: "kitchen-orders",
          component: () => import("../views/kitchen/KitchenOrders.vue"),
          meta: { roles: ["KITCHEN", "SUPERVISOR"] },
        },
      ],
    },
    // Unauthorized page
    {
      path: "/unauthorized",
      name: "unauthorized",
      component: () => import("../views/Unauthorized.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFound.vue"),
    },
  ],
});

// Role-based route guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Check token first (synchronous) to avoid flash during logout
  const hasToken =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // If going to login page, skip all checks to avoid flash
  if (to.name === "login") {
    // If already authenticated, redirect to appropriate dashboard
    if (hasToken && authStore.isAuthenticated) {
      // Ensure user data is loaded before checking role
      if (!authStore.user) {
        try {
          await authStore.fetchMe();
        } catch (error) {
          console.error("Failed to restore session:", error);
          authStore.clearAuth();
          next();
          return;
        }
      }
      // Redirect super admin to super-dashboard, others to dashboard
      if (authStore.isSuperAdmin) {
        next({ name: "super-dashboard" });
      } else {
        next({ name: "dashboard" });
      }
      return;
    }
    // Otherwise, allow access to login page immediately
    next();
    return;
  }

  // M-2 FIX: Redirect authenticated users away from forgot-password page
  if (to.name === "forgot-password" && hasToken && authStore.isAuthenticated) {
    // User is already authenticated, redirect to dashboard
    if (!authStore.user) {
      try {
        await authStore.fetchMe();
      } catch (error) {
        console.error("Failed to restore session:", error);
        authStore.clearAuth();
        next();
        return;
      }
    }
    // Redirect to appropriate dashboard
    if (authStore.isSuperAdmin) {
      next({ name: "super-dashboard" });
    } else {
      next({ name: "dashboard" });
    }
    return;
  }

  // IMPORTANT: Load user data if not available before checking role-based redirects
  // This ensures isSuperAdmin is correctly determined
  if (to.meta.requiresAuth && hasToken && !authStore.user) {
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    if (rememberMe) {
      try {
        await authStore.fetchMe();
      } catch (error) {
        console.error("Failed to restore session:", error);
        authStore.clearAuth();
        localStorage.removeItem("rememberMe");
        next({ name: "login", query: { redirect: to.fullPath } });
        return;
      }
    }
  }

  // Redirect /app to appropriate dashboard based on role
  // IMPORTANT: Check user role AFTER authentication is confirmed
  if (to.path === "/app" || to.path === "/app/") {
    // Ensure user data is loaded
    if (hasToken && !authStore.user) {
      try {
        await authStore.fetchMe();
      } catch (error) {
        console.error("Failed to restore session:", error);
        authStore.clearAuth();
        next({ name: "login", query: { redirect: to.fullPath } });
        return;
      }
    }

    // Now check role after user data is loaded
    if (authStore.user && authStore.isSuperAdmin) {
      next({ name: "super-dashboard" });
      return;
    } else if (authStore.user) {
      next({ name: "dashboard" });
      return;
    } else {
      // If no user data, redirect to login
      next({ name: "login", query: { redirect: to.fullPath } });
      return;
    }
  }

  // If route requires auth but no token, redirect immediately without async operations
  if (to.meta.requiresAuth && !hasToken) {
    authStore.clearAuth();
    next({ name: "login", query: { redirect: to.fullPath } });
    return;
  }

  // If route requires auth and has token, check authentication
  if (to.meta.requiresAuth && hasToken) {
    // If user object is missing, try to restore session (only if not already clearing)
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    if (!authStore.user && rememberMe) {
      try {
        await authStore.fetchMe();
      } catch (error) {
        console.error("Failed to restore session:", error);
        authStore.clearAuth();
        localStorage.removeItem("rememberMe");
        next({ name: "login", query: { redirect: to.fullPath } });
        return;
      }
    }

    // Final check: if still not authenticated after restore, redirect
    if (!authStore.isAuthenticated) {
      authStore.clearAuth();
      next({ name: "login", query: { redirect: to.fullPath } });
      return;
    }

    // IMPORTANT: After authentication is confirmed, check if Super Admin is trying to access dashboard
    // This must be done AFTER user data is loaded
    if (authStore.user && authStore.isSuperAdmin && to.name === "dashboard") {
      next({ name: "super-dashboard" });
      return;
    }
  }

  // Redirect super admin from dashboard to super-dashboard
  // IMPORTANT: Check after user data is loaded and authentication is confirmed
  if (
    hasToken &&
    authStore.user &&
    authStore.isSuperAdmin &&
    to.name === "dashboard"
  ) {
    next({ name: "super-dashboard" });
    return;
  }

  // Redirect non-super admin from super-dashboard to dashboard
  if (
    hasToken &&
    authStore.user &&
    !authStore.isSuperAdmin &&
    to.name === "super-dashboard"
  ) {
    next({ name: "dashboard" });
    return;
  }

  // Check store requirement for CASHIER, SUPERVISOR, KITCHEN (NOT ADMIN_TENANT)
  if (await checkStoreAccess(to, next)) return;

  if (hasToken && authStore.user?.role === "CASHIER") {
    const isShiftRoute = to.name === "cash-shift";
    const isOpenShiftRoute = to.name === "open-shift";
    const isDashboardRoute = to.name === "dashboard";

    try {
      const shiftContext = await authStore.getShiftContext();

      // Fail closed for cashier routing when shift context cannot be resolved.
      if (!shiftContext) {
        if (!isOpenShiftRoute && !isShiftRoute) {
          next({ name: "open-shift" });
          return;
        }
      } else if (shiftContext.requiresRecoveryClose) {
        if (!isShiftRoute) {
          next({ name: "cash-shift" });
          return;
        }
      } else if (shiftContext.requiresOpenShift || !shiftContext.hasHealthyActiveShift) {
        if (!isOpenShiftRoute && !isShiftRoute) {
          next({ name: "open-shift" });
          return;
        }
      } else if (shiftContext.hasHealthyActiveShift) {
        if (isOpenShiftRoute || isDashboardRoute) {
          next({ name: "pos-fullscreen" });
          return;
        }
      }
    } catch (err) {
      console.error("Guard shift check error:", err);
      if (!isOpenShiftRoute && !isShiftRoute) {
        next({ name: "open-shift" });
        return;
      }
    }
  }

  // Role-based access control
  if (to.meta.roles && authStore.user) {
    const userRole = authStore.user.role;
    const allowedRoles = to.meta.roles as string[];

    if (!Array.isArray(allowedRoles) || !allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on role instead of unauthorized for better UX
      // Supervisor should not see unauthorized page
      if (authStore.isSuperAdmin) {
        next({ name: "super-dashboard" });
      } else {
        next({ name: "dashboard" });
      }
      return;
    }

    // Permission-based access control for specific roles (e.g., CASHIER)
    if (to.meta.requiresPermission && authStore.user) {
      const { role: requiredRole, permission: requiredPermission } = to.meta
        .requiresPermission as { role: string; permission: string };

      // Only check permission if user role matches required role
      if (userRole === requiredRole) {
        const userPermissions = (authStore.user as any).permissions || {};
        const hasPermission = userPermissions[requiredPermission] === true;

        if (!hasPermission) {
          // Redirect to appropriate dashboard based on role if permission not granted
          if (authStore.isSuperAdmin) {
            next({ name: "super-dashboard" });
          } else {
            next({ name: "dashboard" });
          }
          return;
        }
      }
    }
  }

  // Legacy admin check (for backward compatibility)
  if (
    to.meta.requiresAdmin &&
    authStore.user?.role !== "ADMIN_TENANT" &&
    authStore.user?.role !== "SUPER_ADMIN"
  ) {
    // Redirect to appropriate dashboard based on role
    if (authStore.isSuperAdmin) {
      next({ name: "super-dashboard" });
    } else {
      next({ name: "dashboard" });
    }
    return;
  }

  // Addon-based access control is driven by backend entitlements.
  if (to.meta.requiresAddon && authStore.isAuthenticated) {
    const userRole = authStore.user?.role;
    const requiredAddon = String(to.meta.requiresAddon || "").toUpperCase();

    if (userRole === "SUPER_ADMIN") {
      next();
      return;
    }

    try {
      const response = await api.get("/subscriptions/current");
      const subscription = response.data || {};
      const entitlements = Array.isArray(subscription.entitlements)
        ? subscription.entitlements.map((feature: string) => String(feature).toUpperCase())
        : [];
      const activeAddons = Array.isArray(subscription.activeAddons)
        ? subscription.activeAddons
        : [];

      const hasEntitlement = entitlements.includes(requiredAddon);
      const hasAddonFallback = activeAddons.some((addon: any) => {
        const addonType = String(addon?.addonType || "").toUpperCase();
        const addonId = String(addon?.addonId || "");
        const addonStatus = String(addon?.status || "").toUpperCase();
        const isAddonActive =
          addonStatus === "ACTIVE" &&
          (!addon?.expiresAt || new Date(addon.expiresAt) >= new Date());

        if (!isAddonActive) {
          return false;
        }

        if (requiredAddon === "BUSINESS_ANALYTICS") {
          return addonType === "ANALYTICS" || addonId === "addon-analytics";
        }

        if (requiredAddon === "DELIVERY_MARKETING") {
          return (
            addonType === "DELIVERY" ||
            addonType === "MARKETING" ||
            addonId === "addon-delivery" ||
            addonId === "addon-marketing"
          );
        }

        return addonType === requiredAddon || addonId === requiredAddon;
      });

      if (!hasEntitlement && !hasAddonFallback) {
        next({
          name: "unauthorized",
          query: { reason: "addon", addon: requiredAddon },
        });
        return;
      }
    } catch (error: any) {
      console.error("Error checking addon entitlements:", error);
    }
  }

  // Store previous route for navigation tracking
  if (from.path) {
    sessionStorage.setItem("previousRoute", from.path);
  }

  next();
});

export default router;
