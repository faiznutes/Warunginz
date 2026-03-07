<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col overflow-hidden"
    >
      <!-- Top Navigation -->
      <nav class="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center gap-4">
              <button 
                @click="$emit('close')"
                class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <span class="material-symbols-outlined">arrow_back</span>
              </button>
              <div class="flex items-center gap-3">
                <div class="bg-primary/10 p-1.5 rounded-xl text-primary">
                  <span class="material-symbols-outlined">storefront</span>
                </div>
                <h1 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{{ tenantName || tenantInfo?.name || 'Warungin POS' }}</h1>
              </div>
              <span class="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></span>
              <span class="text-sm font-medium text-slate-500 hidden sm:block">Detail Transaksi</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="hidden md:flex flex-col items-end mr-2">
                <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ receiptData?.cashierName || receiptData?.servedBy || 'Kasir' }}</span>
                <span class="text-xs text-slate-500">{{ receiptData?.shiftType ? `Shift ${formatShiftType(receiptData.shiftType)}` : 'Kasir' }}</span>
              </div>
              <div class="size-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span class="material-symbols-outlined text-primary text-lg">person</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="flex-grow flex flex-col items-center justify-start py-6 px-4 sm:px-6 relative overflow-y-auto">
        <!-- Background Pattern -->
        <div class="absolute inset-0 receipt-pattern opacity-40 pointer-events-none z-0"></div>

        <!-- Action Toolbar -->
        <div class="w-full max-w-[420px] flex justify-between items-center mb-6 z-10">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Detail Transaksi</h2>
          <div class="flex gap-2">
            <!-- Print Template Selection -->
            <select
              v-model="selectedPrintTemplate"
              class="px-3 py-2 text-sm font-medium text-slate-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="klasik">Klasik</option>
              <option value="modern">Modern</option>
            </select>
            <!-- Paper Size Selection -->
            <select
              v-model="selectedPaperSize"
              class="px-3 py-2 text-sm font-medium text-slate-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="58mm">58mm</option>
              <option value="80mm">80mm</option>
            </select>
            <!-- Share Button -->
            <button 
              @click="handleShare"
              class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <span class="material-symbols-outlined text-[18px]">share</span>
              <span class="hidden sm:inline">Share</span>
            </button>
            <!-- Print Button -->
            <button 
              @click="handlePrint"
              :disabled="!receiptData || !template"
              class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="material-symbols-outlined text-[18px]">print</span>
              Print
            </button>
          </div>
        </div>

        <!-- Receipt Card -->
        <div 
          ref="receiptContent"
          class="w-full max-w-[400px] bg-white relative z-10 shadow-receipt rounded-2xl overflow-hidden transition-all duration-300"
          :class="{
            'receipt-50mm': selectedPaperSize === '58mm',
            'receipt-80mm': selectedPaperSize === '80mm',
          }"
        >
          <div v-if="receiptData && template" class="receipt-content">
            <!-- Receipt Header -->
            <div class="flex flex-col items-center pt-8 pb-4 px-8 text-center border-b border-dashed border-slate-200">
              <div class="size-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <span class="material-symbols-outlined text-3xl">local_cafe</span>
              </div>
              <h2 v-if="template?.header?.showName" class="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                {{ tenantName || tenantInfo?.name || 'Warungin' }}
              </h2>
              <p v-if="template?.header?.showAddress" class="text-sm text-slate-500 leading-relaxed">
                {{ tenantAddress || tenantInfo?.address || 'Jl. Contoh No. 123' }}
              </p>
              <p v-if="template?.header?.showPhone" class="text-sm text-slate-500">
                Telp: {{ tenantPhone || tenantInfo?.phone || '081234567890' }}
              </p>
            </div>

            <!-- Transaction Meta -->
            <div class="px-8 py-4 bg-slate-50 border-b border-dashed border-slate-200 flex flex-col gap-2">
              <div v-if="template?.fields?.showOrderNumber" class="flex justify-between items-center text-xs font-medium text-slate-500">
                <span>ID Transaksi</span>
                <span class="font-mono text-slate-900">#{{ receiptData.orderNumber }}</span>
              </div>
              <div v-if="template?.fields?.showDate" class="flex justify-between items-center text-xs font-medium text-slate-500">
                <span>Tanggal</span>
                <span class="text-slate-900">{{ formatDate(receiptData.date) }}</span>
              </div>
              <div v-if="template?.fields?.showTime" class="flex justify-between items-center text-xs font-medium text-slate-500">
                <span>Waktu</span>
                <span class="text-slate-900">{{ formatTime(receiptData.date) }} WIB</span>
              </div>
              <div v-if="template?.fields?.showCashier && (receiptData.cashierName || receiptData.servedBy)" class="flex justify-between items-center text-xs font-medium text-slate-500">
                <span>Kasir</span>
                <span class="text-slate-900">{{ receiptData.cashierName || receiptData.servedBy }}</span>
              </div>
              <div v-if="template?.fields?.showCustomer && receiptData.customerName" class="flex justify-between items-center text-xs font-medium text-slate-500">
                <span>Pelanggan</span>
                <span class="text-slate-900">{{ receiptData.customerName }}</span>
              </div>
            </div>

            <!-- Item List -->
            <div v-if="template?.fields?.showItems" class="p-8 pb-4">
              <div class="flex flex-col gap-4">
                <div 
                  v-for="item in receiptData.items" 
                  :key="item.name"
                  class="flex justify-between items-start gap-4"
                >
                  <div class="flex flex-col flex-1">
                    <span class="text-sm font-semibold text-slate-900">{{ item.name }}</span>
                    <span class="text-xs text-slate-500">{{ item.quantity }} x {{ formatCurrency(item.price) }}</span>
                    <span v-if="item.discount && item.discount > 0" class="text-[10px] text-primary italic mt-0.5">
                      ✓ Diskon: -{{ formatCurrency(item.discount) }}
                    </span>
                  </div>
                  <span class="text-sm font-medium text-slate-900 tabular-nums">{{ formatCurrency(item.subtotal) }}</span>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="mx-6 border-t border-dashed border-slate-200 my-2"></div>

            <!-- Summary -->
            <div class="px-8 py-4 space-y-2">
              <div v-if="template?.fields?.showSubtotal" class="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span class="font-medium text-slate-900 tabular-nums">{{ formatCurrency(receiptData.subtotal) }}</span>
              </div>
              <div v-if="template?.fields?.showTax" class="flex justify-between text-sm text-slate-500">
                <span>Pajak (10%)</span>
                <span class="font-medium text-slate-900 tabular-nums">{{ formatCurrency(0) }}</span>
              </div>
              <div v-if="template?.fields?.showDiscount && receiptData.discount > 0" class="flex justify-between text-sm text-slate-500">
                <span>Diskon</span>
                <span class="font-medium text-green-600 tabular-nums">- {{ formatCurrency(receiptData.discount) }}</span>
              </div>
              <div v-if="template?.fields?.showTotal" class="pt-3 mt-2 border-t border-slate-200 flex justify-between items-end">
                <span class="text-sm font-bold text-slate-900">Total Bayar</span>
                <span class="text-2xl font-bold text-primary tabular-nums">{{ formatCurrency(receiptData.total) }}</span>
              </div>
            </div>

            <!-- Payment Info Badge -->
            <div v-if="template?.fields?.showPaymentMethod" class="mx-8 mb-6 p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-xl">{{ getPaymentIcon(receiptData.paymentMethod) }}</span>
                <span class="text-xs font-bold text-primary uppercase tracking-wide">Lunas via {{ getPaymentMethodLabel(receiptData.paymentMethod) }}</span>
              </div>
              <span v-if="receiptData.change && receiptData.change > 0" class="text-xs text-primary/70 font-mono">
                Kembali: {{ formatCurrency(receiptData.change) }}
              </span>
            </div>

            <!-- Receipt Footer -->
            <div v-if="template?.footer?.showThankYou || template?.footer?.showContact" class="bg-slate-50 border-t border-dashed border-slate-200 p-6 text-center">
              <div class="flex flex-col items-center gap-2">
                <p v-if="template?.footer?.showThankYou" class="text-xs font-medium text-slate-900 italic">"Terima kasih telah berbelanja!"</p>
                <p class="text-[10px] text-slate-500 max-w-[200px]">Simpan struk ini sebagai bukti pembayaran yang sah.</p>
                
                <!-- Barcode -->
                <div class="mt-4 h-12 w-48 opacity-80 barcode-pattern"></div>
                <span class="text-[10px] text-slate-500 font-mono mt-1 tracking-widest">{{ receiptData.orderNumber }}</span>
              </div>
            </div>

            <!-- Paper Tear Effect -->
            <div class="paper-tear-effect"></div>
          </div>

          <!-- Loading State -->
          <div v-else class="text-center py-12 text-slate-500">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Memuat data receipt...</p>
          </div>
        </div>

        <!-- Footer Branding -->
        <div class="mt-8 text-center text-xs text-slate-400">
          Powered by Warungin Systems © {{ new Date().getFullYear() }}
        </div>
      </main>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import api from '../api';
import { formatCurrency } from '../utils/formatters';
import { useNotification } from '../composables/useNotification';
import { generateKlasikReceipt, generateModernReceipt } from '../utils/receipt-print-templates';
import type { ReceiptPrintData } from '../utils/receipt-print-templates';

const { warning, success } = useNotification();

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  discount?: number;
  productId?: string;
}

interface DiscountDetail {
  discountName: string;
  discountAmount: number;
  appliedTo: string[];
}

interface ReceiptData {
  orderNumber: string;
  date: string;
  customerName?: string;
  memberName?: string;
  shiftType?: string | null;
  cashierName?: string | null;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  change?: number;
  servedBy?: string;
  discountDetails?: DiscountDetail[];
}

interface ReceiptTemplate {
  id: string;
  name: string;
  templateType: string;
  paperSize: string;
  isDefault?: boolean;
  header?: any;
  footer?: any;
  fields?: any;
  styles?: any;
}

interface Props {
  show: boolean;
  orderId?: string;
  receiptData?: ReceiptData | null;
  tenantName?: string;
  tenantAddress?: string;
  tenantPhone?: string;
}

const props = withDefaults(defineProps<Props>(), {
  orderId: undefined,
  receiptData: null,
  tenantName: '',
  tenantAddress: '',
  tenantPhone: '',
});

const templates = ref<ReceiptTemplate[]>([]);
const selectedTemplate = ref<string>('');
const selectedPaperSize = ref<'58mm' | '80mm'>('80mm');
const selectedPrintTemplate = ref<'klasik' | 'modern'>('modern');
const template = ref<ReceiptTemplate | null>(null);
const receiptContent = ref<HTMLElement | null>(null);
const loading = ref(false);

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatShiftType = (shiftType: string | null | undefined): string => {
  if (!shiftType) return '';
  const shiftMap: Record<string, string> = {
    pagi: 'Pagi',
    siang: 'Siang',
    sore: 'Sore',
    malam: 'Malam',
  };
  return shiftMap[shiftType.toLowerCase()] || shiftType;
};

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    CASH: 'Cash',
    CARD: 'Kartu',
    E_WALLET: 'E-Wallet',
    QRIS: 'QRIS',
    BANK_TRANSFER: 'Bank',
    SHOPEEPAY: 'ShopeePay',
    DANA: 'Dana',
    MIDTRANS: 'Midtrans',
  };
  return labels[method] || method;
};

const getPaymentIcon = (method: string) => {
  const icons: Record<string, string> = {
    CASH: 'payments',
    CARD: 'credit_card',
    E_WALLET: 'wallet',
    QRIS: 'qr_code_2',
    BANK_TRANSFER: 'account_balance',
    SHOPEEPAY: 'wallet',
    DANA: 'wallet',
    MIDTRANS: 'qr_code_2',
  };
  return icons[method] || 'receipt';
};

const loadTemplates = async () => {
  try {
    const response = await api.get('/receipts/templates');
    templates.value = Array.isArray(response.data) ? response.data : [];
    if (Array.isArray(templates.value) && templates.value.length > 0) {
      const defaultTemplate = templates.value.find(t => t && t.isDefault) || templates.value[0];
      selectedTemplate.value = defaultTemplate.id;
      await loadTemplate(defaultTemplate.id);
    }
  } catch (error: any) {
    console.error('Error loading templates:', error);
  }
};

const loadTemplate = async (templateId: string) => {
  try {
    const response = await api.get(`/receipts/templates/${templateId}`);
    template.value = response.data;
    
    if (template.value) {
      if (!template.value.fields) {
        template.value.fields = {
          showOrderNumber: true,
          showDate: true,
          showTime: true,
          showCashier: true,
          showCustomer: true,
          showItems: true,
          showSubtotal: true,
          showTax: true,
          showDiscount: true,
          showTotal: true,
          showPaymentMethod: true,
          showChange: true,
        };
      }
      if (!template.value.header) {
        template.value.header = {
          showName: true,
          showAddress: true,
          showPhone: true,
        };
      }
      if (!template.value.footer) {
        template.value.footer = {
          showThankYou: true,
          showContact: true,
        };
      }
    }
  } catch (error: any) {
    console.error('Error loading template:', error);
    template.value = {
      id: 'default',
      name: 'Default Receipt',
      templateType: 'MODERN',
      paperSize: '85mm',
      header: { showName: true, showAddress: true, showPhone: true },
      footer: { showThankYou: true, showContact: true },
      fields: {
        showOrderNumber: true,
        showDate: true,
        showTime: true,
        showCashier: true,
        showItems: true,
        showSubtotal: true,
        showDiscount: true,
        showTotal: true,
        showPaymentMethod: true,
      },
    };
  }
};

const receiptData = ref<ReceiptData | null>(props.receiptData || null);
const tenantInfo = ref<any>(null);

const loadReceiptData = async () => {
  if (!props.orderId) {
    receiptData.value = props.receiptData;
    return;
  }
  
  loading.value = true;
  try {
    const response = await api.get(`/receipts/generate/${props.orderId}?templateId=${selectedTemplate.value}`);
    if (response.data) {
      receiptData.value = response.data.receiptData;
      template.value = response.data.template;
      if (response.data.order?.tenant) {
        tenantInfo.value = response.data.order.tenant;
      }
    }
  } catch (error: any) {
    console.error('Error loading receipt data:', error);
    receiptData.value = props.receiptData;
  } finally {
    loading.value = false;
  }
};

const handleShare = async () => {
  if (!receiptData.value) return;
  
  const shareData = {
    title: `Receipt #${receiptData.value.orderNumber}`,
    text: `Receipt from ${props.tenantName || tenantInfo.value?.name || 'Warungin'} - Total: ${formatCurrency(receiptData.value.total)}`,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      await success('Berhasil share receipt!');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareData.text);
      await success('Link receipt disalin ke clipboard!');
    } catch {
      await warning('Browser tidak mendukung fitur share.');
    }
  }
};

const handlePrint = () => {
  if (!receiptContent.value) return;
  printBrowser();
};

const printBrowser = async () => {
  if (!receiptData.value) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    await warning('Popup blocker terdeteksi. Silakan izinkan popup untuk mencetak struk.');
    return;
  }

  // Build print data from receiptData
  const printData: ReceiptPrintData = {
    orderNumber: receiptData.value.orderNumber,
    date: receiptData.value.date,
    customerName: receiptData.value.customerName,
    cashierName: receiptData.value.cashierName || undefined,
    servedBy: receiptData.value.servedBy,
    shiftType: receiptData.value.shiftType,
    items: receiptData.value.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
      discount: item.discount,
    })),
    subtotal: receiptData.value.subtotal,
    discount: receiptData.value.discount,
    total: receiptData.value.total,
    paymentMethod: receiptData.value.paymentMethod,
    change: receiptData.value.change,
  };

  const options = {
    receiptData: printData,
    tenantName: props.tenantName || tenantInfo.value?.name || 'Warungin',
    tenantAddress: props.tenantAddress || tenantInfo.value?.address || '',
    tenantPhone: props.tenantPhone || tenantInfo.value?.phone || '',
    paperSize: selectedPaperSize.value,
  };

  // Generate HTML based on selected print template
  const htmlContent = selectedPrintTemplate.value === 'klasik'
    ? generateKlasikReceipt(options)
    : generateModernReceipt(options);

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
};

watch(() => props.show, (newShow) => {
  if (newShow) {
    loadTemplates();
    if (props.orderId) {
      loadReceiptData();
    } else {
      receiptData.value = props.receiptData;
    }
  }
});

watch(() => props.receiptData, (newData) => {
  if (newData) {
    receiptData.value = newData;
  }
}, { immediate: true });

watch(() => selectedTemplate.value, (newTemplateId) => {
  if (newTemplateId) {
    loadTemplate(newTemplateId);
  }
});

onMounted(() => {
  if (props.show) {
    loadTemplates();
  }
});
</script>

<style scoped>
/* V3 Design System Colors */
.bg-primary {
  background-color: #10b981;
}
.text-primary {
  color: #10b981;
}
.border-primary {
  border-color: #10b981;
}

/* Receipt Pattern Background */
.receipt-pattern {
  background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Receipt Card Shadow */
.shadow-receipt {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06), 
              0 20px 25px -5px rgba(0, 0, 0, 0.05);
}

/* Paper Tear Effect */
.paper-tear-effect {
  height: 12px;
  width: 100%;
  background-color: white;
  mask-image: radial-gradient(circle at 10px bottom, transparent 8px, black 9px);
  mask-size: 20px 20px;
  mask-repeat: repeat-x;
  mask-position: bottom;
  -webkit-mask-image: radial-gradient(circle at 10px bottom, transparent 8px, black 9px);
  -webkit-mask-size: 20px 20px;
  -webkit-mask-repeat: repeat-x;
  -webkit-mask-position: bottom;
}

/* Barcode Pattern */
.barcode-pattern {
  background-image: repeating-linear-gradient(
    90deg, 
    #1e293b 0px, #1e293b 2px, 
    transparent 2px, transparent 4px, 
    #1e293b 4px, #1e293b 8px, 
    transparent 8px, transparent 9px
  );
}

/* Responsive Receipt Sizes */
.receipt-50mm {
  max-width: 200px;
}

.receipt-80mm {
  max-width: 400px;
}

.receipt-content {
  font-family: 'Inter', sans-serif;
}

/* Print Styles */
@media print {
  .receipt-pattern,
  .shadow-receipt {
    display: none;
  }
  
  .receipt-content {
    font-size: inherit;
  }
}
</style>
