import { RouteRecordRaw } from 'vue-router';

export const addonRoutes: RouteRecordRaw[] = [
    {
        path: 'delivery',
        name: 'delivery',
        component: () => import('../views/delivery/DeliveryOrders.vue'),
        meta: { roles: ['ADMIN_TENANT', 'SUPERVISOR', 'SUPER_ADMIN'], requiresAddon: 'DELIVERY_MARKETING' },
    },
    {
        path: 'marketing',
        name: 'marketing',
        component: () => import('../views/marketing/MarketingCampaigns.vue'),
        meta: { roles: ['ADMIN_TENANT', 'SUPER_ADMIN'], requiresAddon: 'DELIVERY_MARKETING' },
    },
    {
        path: 'marketing/email-templates',
        name: 'email-templates',
        component: () => import('../views/marketing/EmailTemplates.vue'),
        meta: { roles: ['ADMIN_TENANT', 'SUPER_ADMIN'], requiresAddon: 'DELIVERY_MARKETING' },
    },
    {
        path: 'marketing/email-analytics',
        name: 'email-analytics',
        component: () => import('../views/marketing/EmailAnalytics.vue'),
        meta: { roles: ['ADMIN_TENANT', 'SUPER_ADMIN'], requiresAddon: 'DELIVERY_MARKETING' },
    },
    {
        path: 'marketing/email-scheduler',
        name: 'email-scheduler',
        component: () => import('../views/marketing/EmailScheduler.vue'),
        meta: { roles: ['ADMIN_TENANT', 'SUPER_ADMIN'], requiresAddon: 'DELIVERY_MARKETING' },
    },
    {
        path: 'marketing/customer-engagement',
        name: 'customer-engagement',
        component: () => import('../views/marketing/CustomerEngagement.vue'),
        meta: { roles: ['ADMIN_TENANT', 'SUPER_ADMIN'], requiresAddon: 'DELIVERY_MARKETING' },
    },
];
