<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Marketing Campaigns</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Manage SMS, Email, and Promo campaigns.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-blue-500 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Create Campaign</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="campaigns.length === 0" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">campaign</span>
      <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-2">No Campaigns Yet</h3>
      <p class="text-[#4c739a] text-center max-w-md mb-4">Create your first marketing campaign to engage with customers.</p>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-blue-500 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        Create First Campaign
      </button>
    </div>

    <!-- Campaigns Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="campaign in campaigns"
        :key="campaign.id"
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6 border-2 transition-all hover:shadow-lg"
        :class="campaign.status === 'ACTIVE' ? 'border-green-300 dark:border-green-800' : 'border-slate-100 dark:border-slate-700'"
      >
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ campaign.name }}</h3>
          <span
            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full"
            :class="campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="campaign.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'"></span>
            {{ campaign.status }}
          </span>
        </div>
        <p class="text-sm text-slate-500 mb-4">{{ campaign.description }}</p>
        <div class="space-y-2 mb-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500">Type:</span>
            <span class="font-medium text-slate-900 dark:text-white flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">{{ getTypeIcon(campaign.type) }}</span>
              {{ campaign.type }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500">Target:</span>
            <span class="font-medium text-slate-900 dark:text-white">{{ campaign.targetCount }} recipients</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500">Sent:</span>
            <span class="font-medium text-slate-900 dark:text-white">{{ campaign.sentCount || 0 }}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="viewCampaign(campaign)"
            class="flex-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium flex items-center justify-center gap-1"
          >
            <span class="material-symbols-outlined text-[18px]">visibility</span>
            Details
          </button>
          <button
            v-if="campaign.status === 'DRAFT'"
            @click="sendCampaign(campaign.id)"
            class="flex-1 px-3 py-2 text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/40 transition font-medium flex items-center justify-center gap-1"
          >
            <span class="material-symbols-outlined text-[18px]">send</span>
            Send
          </button>
        </div>
      </div>
    </div>

    <!-- Create Campaign Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showCreateModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
              <span class="material-symbols-outlined">campaign</span>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Create New Campaign</h3>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Campaign Name</label>
              <input
                v-model="campaignForm.name"
                type="text"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="e.g. Holiday Sale 2025"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Campaign Type</label>
              <select
                v-model="campaignForm.type"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="SMS">SMS</option>
                <option value="EMAIL">Email</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="PROMO">Promo/Voucher</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Audience</label>
              <select
                v-model="campaignForm.target"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="ALL">All Customers</option>
                <option value="MEMBERS">Members Only</option>
                <option value="ACTIVE">Active Customers</option>
                <option value="INACTIVE">Inactive Customers</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message/Content</label>
              <textarea
                v-model="campaignForm.content"
                rows="4"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                placeholder="Enter campaign message..."
              ></textarea>
            </div>
            <div v-if="campaignForm.type === 'PROMO'">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Promo Code</label>
              <input
                v-model="campaignForm.promoCode"
                type="text"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono uppercase"
                placeholder="HOLIDAY20"
              />
            </div>
            <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                @click="showCreateModal = false"
                class="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium"
              >
                Cancel
              </button>
              <button
                @click="saveCampaign"
                class="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-500-hover transition font-medium shadow-lg shadow-blue-500/30"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Campaign Detail Modal -->
    <CampaignDetailModal
      :show="showDetailModal"
      :campaign="viewingCampaign"
      @close="showDetailModal = false; viewingCampaign = null"
      @send="handleSendFromDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import CampaignDetailModal from '../../components/CampaignDetailModal.vue';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { useNotification } from '../../composables/useNotification';

const { needsTenantSelection } = useTenantCheck();
const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

interface Campaign {
  id: string;
  name: string;
  description?: string;
  type?: string;
  status: string;
  targetCount?: number;
  sentCount?: number;
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
  opens?: number;
  clicks?: number;
  conversions?: number;
}

const campaigns = ref<Campaign[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);

const campaignForm = ref({
  name: '',
  type: 'SMS',
  target: 'ALL',
  content: '',
  promoCode: '',
});

const getTypeIcon = (type?: string): string => {
  const icons: Record<string, string> = {
    SMS: 'sms',
    EMAIL: 'mail',
    WHATSAPP: 'chat',
    PROMO: 'sell',
  };
  return icons[type || ''] || 'campaign';
};

const loadCampaigns = async () => {
  if (needsTenantSelection.value) return;

  loading.value = true;
  try {
    const response = await api.get('/marketing/campaigns');
    campaigns.value = response.data.data || response.data || [];
  } catch (error: any) {
    console.error('Error loading campaigns:', error);
    campaigns.value = [];
  } finally {
    loading.value = false;
  }
};

const showDetailModal = ref(false);
const viewingCampaign = ref<Campaign | null>(null);

const viewCampaign = (campaign: Campaign) => {
  viewingCampaign.value = campaign;
  showDetailModal.value = true;
};

const handleSendFromDetail = async (campaignId: string) => {
  showDetailModal.value = false;
  await sendCampaign(campaignId);
};

const sendCampaign = async (campaignId: string) => {
  const confirmed = await showConfirm('Send this campaign now?');
  if (!confirmed) return;
  try {
    await api.post(`/marketing/campaigns/${campaignId}/send`);
    await loadCampaigns();
    await showSuccess('Campaign sent successfully');
  } catch (error: any) {
    console.error('Error sending campaign:', error);
    await showError(error.response?.data?.message || 'Failed to send campaign');
  }
};

const saveCampaign = async () => {
  try {
    await api.post('/marketing/campaigns', campaignForm.value);
    await showSuccess('Campaign created successfully');
    showCreateModal.value = false;
    campaignForm.value = {
      name: '',
      type: 'SMS',
      target: 'ALL',
      content: '',
      promoCode: '',
    };
    await loadCampaigns();
  } catch (error: any) {
    console.error('Error saving campaign:', error);
    await showError(error.response?.data?.message || 'Failed to create campaign');
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadCampaigns();
});
</script>
