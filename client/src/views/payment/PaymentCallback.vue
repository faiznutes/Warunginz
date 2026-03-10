<template>
  <div
    class="min-h-screen flex items-center justify-center px-4 font-display bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#dce5f2] dark:from-[#101822] dark:via-[#15202e] dark:to-[#0f151e]"
  >
    <div
      class="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center"
    >
      <!-- Success State -->
      <div v-if="status === 'success'" class="space-y-6">
        <div
          class="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 animate-bounce-in"
        >
          <span class="material-symbols-outlined text-blue-600 text-4xl"
            >check_circle</span
          >
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Pembayaran Berhasil!
          </h1>
          <p class="text-slate-500 dark:text-slate-400">
            Terima kasih! Pembayaran Anda telah kami terima. Layanan Anda akan
            segera aktif.
          </p>
        </div>

        <div
          v-if="orderId"
          class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700"
        >
          <p
            class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1"
          >
            Order ID
          </p>
          <p
            class="text-lg font-mono font-bold text-slate-900 dark:text-white break-all"
          >
            {{ orderId }}
          </p>
        </div>

        <div
          v-if="activationStatus === 'checking'"
          class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800"
        >
          <div class="flex items-center justify-center gap-3">
            <div
              class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
            ></div>
            <p class="text-sm font-bold text-blue-600 dark:text-blue-400">
              Memverifikasi & Mengaktifkan...
            </p>
          </div>
        </div>
        <div
          v-else-if="activationStatus === 'success'"
          class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800"
        >
          <div class="flex items-center justify-center gap-2">
            <span
              class="material-symbols-outlined text-blue-600 dark:text-blue-400"
              >verified</span
            >
            <p class="text-sm font-bold text-blue-600 dark:text-blue-400">
              Layanan Aktif!
            </p>
          </div>
        </div>

        <div class="space-y-3 pt-2">
          <button
            @click="goToPaymentPage"
            class="w-full px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-bold shadow-lg shadow-blue-500/30 active:scale-95"
          >
            {{
              isSubscriptionPayment
                ? "Kembali ke Subscription"
                : "Kembali ke Addons"
            }}
          </button>
          <button
            @click="goToDashboard"
            class="w-full px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-bold"
          >
            Ke Dashboard
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="status === 'error'" class="space-y-6">
        <div
          class="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20 animate-bounce-in"
        >
          <span class="material-symbols-outlined text-red-600 text-4xl"
            >cancel</span
          >
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Pembayaran Gagal
          </h1>
          <p class="text-slate-500 dark:text-slate-400">
            Maaf, kami tidak dapat memproses pembayaran Anda. Silakan coba lagi
            atau hubungi support.
          </p>
        </div>

        <div
          v-if="orderId"
          class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700"
        >
          <p
            class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1"
          >
            Order ID
          </p>
          <p
            class="text-lg font-mono font-bold text-slate-900 dark:text-white break-all"
          >
            {{ orderId }}
          </p>
        </div>

        <div class="space-y-3 pt-2">
          <button
            @click="goToPaymentPage"
            class="w-full px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-bold shadow-lg shadow-red-500/30 active:scale-95"
          >
            Coba Lagi
          </button>
          <button
            @click="goToDashboard"
            class="w-full px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-bold"
          >
            Ke Dashboard
          </button>
        </div>
      </div>

      <!-- Pending State -->
      <div v-else-if="status === 'pending'" class="space-y-6">
        <div
          class="mx-auto w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/20 animate-pulse"
        >
          <span class="material-symbols-outlined text-yellow-600 text-4xl"
            >hourglass_top</span
          >
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Menunggu Pembayaran
          </h1>
          <p class="text-slate-500 dark:text-slate-400">
            Pembayaran Anda sedang kami proses. Mohon selesaikan pembayaran
            sesuai instruksi.
          </p>
        </div>

        <div
          v-if="orderId"
          class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700"
        >
          <p
            class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1"
          >
            Order ID
          </p>
          <p
            class="text-lg font-mono font-bold text-slate-900 dark:text-white break-all"
          >
            {{ orderId }}
          </p>
        </div>

        <div class="space-y-3 pt-2">
          <button
            @click="goToPaymentPage"
            class="w-full px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition font-bold shadow-lg shadow-yellow-500/30 active:scale-95"
          >
            {{
              isSubscriptionPayment
                ? "Cek Status Subscription"
                : "Cek Status Addons"
            }}
          </button>
          <button
            @click="goToDashboard"
            class="w-full px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-bold"
          >
            Ke Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import api from "../../api";

interface Props {
  status: "success" | "error" | "pending";
  order_id?: string;
  transaction_status?: string;
  status_code?: string;
}

const props = defineProps<Props>();
const router = useRouter();
const authStore = useAuthStore();

const orderId = computed(() => props.order_id);
const checking = ref(false);
const activationStatus = ref<"checking" | "success" | "error" | null>(null);

// Determine if this is a subscription payment based on order_id format
// New format: SUB-{hash}-{timestamp} or ADD-{hash}-{timestamp}
// Old format: subscription-{plan}-{duration}-{timestamp} or addon-{addonType}-{timestamp}
const isSubscriptionPayment = computed(() => {
  const id = props.order_id || "";
  return (
    id.startsWith("SUB-") ||
    id.startsWith("subscription-") ||
    id.startsWith("upgrade-")
  );
});

const goToPaymentPage = () => {
  if (authStore.isAuthenticated) {
    if (isSubscriptionPayment.value) {
      router.push("/app/subscription");
    } else {
      router.push("/app/addons");
    }
  } else {
    router.push("/login");
  }
};

const goToDashboard = () => {
  if (authStore.isAuthenticated) {
    // Router guard will redirect to appropriate dashboard based on role
    router.push("/app");
  } else {
    router.push("/login");
  }
};

// Check payment status and trigger activation if needed
const checkAndActivate = async () => {
  if (!orderId.value) {
    return;
  }

  const hasToken = !!(
    localStorage.getItem("token") || sessionStorage.getItem("token")
  );
  if (!hasToken) {
    activationStatus.value = null;
    return;
  }

  if (!authStore.user) {
    try {
      await authStore.fetchMe();
    } catch {
      activationStatus.value = null;
      return;
    }
  }

  const userRole = authStore.user?.role;
  const canCheckPaymentStatus =
    userRole === "SUPER_ADMIN" ||
    userRole === "ADMIN_TENANT" ||
    userRole === "SUPERVISOR" ||
    userRole === "CASHIER";
  if (!canCheckPaymentStatus) {
    activationStatus.value = null;
    return;
  }

  // Only check if payment is successful or pending
  if (props.status !== "success" && props.status !== "pending") {
    return;
  }

  checking.value = true;
  activationStatus.value = "checking";

  try {
    // Check payment status (this will also trigger activation if payment is settled)
    const response = await api.get(`/payment/status/${orderId.value}`);

    if (
      response.data.status === "settlement" ||
      response.data.status === "capture"
    ) {
      activationStatus.value = "success";

      // Wait a bit for activation to complete, then reload if needed
      setTimeout(() => {
        // Optionally reload addons/subscription data
        if (authStore.isAuthenticated) {
          // The page will redirect, so no need to reload here
        }
      }, 2000);
    } else if (response.data.status === "pending") {
      // Payment is still pending, poll again after a delay
      activationStatus.value = null;
      setTimeout(() => {
        checkAndActivate();
      }, 3000); // Check again in 3 seconds
    } else {
      activationStatus.value = "error";
    }
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    activationStatus.value = "error";
    // Don't show error to user, webhook might still process it
  } finally {
    checking.value = false;
  }
};

onMounted(() => {
  // If payment is successful or pending, check status and trigger activation
  // This ensures addon is activated even if webhook is delayed or not called
  if (props.status === "success" || props.status === "pending") {
    // Wait a bit for webhook to process first, then check status as fallback
    setTimeout(() => {
      checkAndActivate();
    }, 2000); // Wait 2 seconds for webhook to process
  }
});
</script>
