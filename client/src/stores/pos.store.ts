import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api';
import { useNotification } from '@/composables/useNotification';
import { offlineStorage } from '@/utils/offline-storage';
import { useAuthStore } from './auth';

export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category?: string;
    image?: string;
    emoji?: string;
    sku?: string;
    isActive?: boolean;
    [key: string]: any;
}

export interface CartItem extends Product {
    quantity: number;
}

export const usePosStore = defineStore('pos', () => {
    const { error: showError, warning: showWarning } = useNotification();
    const authStore = useAuthStore();

    // State
    const products = ref<Product[]>([]);
    const cart = ref<CartItem[]>([]);
    const categories = ref<string[]>(['SEMUA']);
    const selectedCategory = ref<string>('SEMUA');
    const searchQuery = ref('');
    const loading = ref(false);
    const processing = ref(false);

    // Computed
    const filteredProducts = computed(() => {
        let result = products.value;

        if (selectedCategory.value && selectedCategory.value !== 'SEMUA') {
            result = result.filter(p => p.category === selectedCategory.value);
        }

        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.sku?.toLowerCase().includes(query) ||
                p.category?.toLowerCase().includes(query)
            );
        }

        // Filter active and positive stock (or visible OOS if needed)
        return result.filter(p => p.isActive !== false);
    });

    const subtotal = computed(() => {
        return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    const totalItems = computed(() => {
        return cart.value.reduce((sum, item) => sum + item.quantity, 0);
    });

    // Actions
    const loadProducts = async (retryCount = 0) => {
        // Optimistic Load: Try cache first for instant render
        try {
            const cached = await offlineStorage.getCachedProducts();
            if (cached && cached.length > 0) {
                products.value = cached;
                // Extract categories from cache
                const cats = new Set(['SEMUA']);
                products.value.forEach(p => {
                    if (p.category) cats.add(p.category);
                });
                categories.value = Array.from(cats);
            }
        } catch {
            // Ignore cache read errors, proceed to fetch
        }

        // Only set loading if we didn't get cached data
        if (products.value.length === 0) {
            loading.value = true;
        }

        try {
            const params: any = { isActive: true };
            if (authStore.user?.tenantId) {
                params.tenantId = authStore.user.tenantId;
            } else if (authStore.selectedTenantId) {
                params.tenantId = authStore.selectedTenantId;
            }

            const response = await api.get('/products', { params });
            const productsData = response.data.data || response.data;

            // Update state with fresh data
            products.value = Array.isArray(productsData) ? productsData : [];

            // Extract unique categories
            const cats = new Set(['SEMUA']);
            products.value.forEach(p => {
                if (p.category) cats.add(p.category);
            });
            categories.value = Array.from(cats);

            // Update Cache
            await offlineStorage.cacheProducts(products.value);

        } catch (err: any) {
            console.error('Failed to load products', err);

            // If we have cached data, we can just show a silent warning or nothing
            if (products.value.length > 0) {
                if (!navigator.onLine) {
                    showWarning('Offline Mode: Menggunakan data produk cache');
                }
                // If online but failed, maybe silent fail or toast?
                return;
            }

            // Retry logic (only if no products shown)
            if (retryCount < 3 && navigator.onLine) {
                setTimeout(() => loadProducts(retryCount + 1), 1500);
                return;
            }

            // If we are here, we have no products and API failed
            showError('Gagal memuat produk');
        } finally {
            loading.value = false;
        }
    };

    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            showWarning('Stok habis');
            return;
        }

        const existing = cart.value.find(i => i.id === product.id);
        if (existing) {
            if (existing.quantity < product.stock) {
                existing.quantity++;
            } else {
                showWarning('Stok tidak mencukupi');
            }
        } else {
            cart.value.push({ ...product, quantity: 1 });
        }
    };

    const updateQuantity = (itemId: string, change: number) => {
        const item = cart.value.find(i => i.id === itemId);
        if (!item) return;

        const product = products.value.find(p => p.id === itemId);
        const maxStock = product?.stock || item.stock || 999;

        const newQty = item.quantity + change;

        if (newQty <= 0) {
            removeFromCart(itemId);
        } else if (newQty <= maxStock) {
            item.quantity = newQty;
        } else {
            showWarning('Stok tidak mencukupi');
        }
    };

    const removeFromCart = (itemId: string) => {
        const index = cart.value.findIndex(i => i.id === itemId);
        if (index !== -1) {
            cart.value.splice(index, 1);
        }
    };

    const clearCart = () => {
        cart.value = [];
    };

    return {
        products,
        cart,
        categories,
        selectedCategory,
        searchQuery,
        loading,
        processing,
        filteredProducts,
        subtotal,
        totalItems,
        loadProducts,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    };
});
