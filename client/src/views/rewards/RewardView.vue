<template>
  <div class="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] flex items-center justify-center p-4">
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm max-w-2xl w-full p-8 border border-slate-100 dark:border-slate-700">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-amber-500 dark:text-amber-400 text-[32px]">play_circle</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-[#0d141b] dark:text-white mb-2 leading-tight tracking-tight">Watch Ad to Earn Points</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Watch the ad to completion to earn your points.</p>
      </div>

      <!-- Loading State (Initializing) -->
      <div v-if="initializing" class="text-center py-12">
        <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-[#4c739a] font-medium">Loading ad...</p>
      </div>

      <!-- Ad Container -->
      <div v-else-if="!adShown && !completed" class="mb-6">
        <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 min-h-[300px] flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700">
          <div v-if="!isAdAvailable" class="text-center">
            <span class="material-symbols-outlined text-[64px] text-slate-300 dark:text-slate-600 mb-4">videocam</span>
            <p class="text-[#4c739a] dark:text-slate-400 mb-6 font-medium" v-if="!ironSourceError">Loading ad...</p>
            <p class="text-red-500 mb-6 font-semibold" v-else>{{ ironSourceError }}</p>
            <div v-if="ironSourceError" class="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-200">
              <p class="font-bold mb-2 flex items-center gap-2 justify-center">
                <span class="material-symbols-outlined text-[18px]">lightbulb</span>
                Tips:
              </p>
              <ul class="list-disc list-inside text-left space-y-1 max-w-xs mx-auto">
                <li v-if="trackingPreventionBlocked">Disable Tracking Prevention</li>
                <li>Disable ad blocker</li>
                <li>Refresh page</li>
              </ul>
            </div>
            <button
              @click="checkAdAvailability"
              :disabled="ironSourceLoading"
              class="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-500 transition disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center gap-2 mx-auto shadow-lg shadow-blue-500/30"
            >
              <span class="material-symbols-outlined text-[20px]" v-if="!ironSourceLoading">refresh</span>
              <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ ironSourceLoading ? 'Checking...' : 'Check Ad Availability' }}
            </button>
          </div>

          <div v-else class="text-center">
            <span class="material-symbols-outlined text-[64px] text-blue-500 mb-4">play_circle</span>
            <p class="text-slate-700 dark:text-slate-300 font-semibold mb-4">Ad ready to show!</p>
            <button
              @click="showAd"
              :disabled="loading"
              class="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition shadow-lg shadow-blue-500/30 flex items-center gap-2 mx-auto"
            >
              <span class="material-symbols-outlined text-[20px]" v-if="!loading">play_arrow</span>
              <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ loading ? 'Loading...' : 'Watch Ad' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Ad Playing Indicator -->
      <div v-if="adShown && !completed" class="mb-6">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
          <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-blue-800 dark:text-blue-200 font-semibold">Ad is playing...</p>
          <p class="text-blue-500 dark:text-blue-300 text-sm mt-2">Wait for the ad to finish to earn points</p>
        </div>
      </div>

      <!-- Status Message -->
      <div v-if="statusMessage" class="mb-6">
        <div
          :class="[
            'rounded-xl p-4 text-center flex items-center justify-center gap-2',
            statusMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' :
            statusMessage.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800' :
            'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
          ]"
        >
          <span class="material-symbols-outlined text-[20px]">
            {{ statusMessage.type === 'success' ? 'check_circle' : statusMessage.type === 'error' ? 'error' : 'info' }}
          </span>
          <p class="font-medium">{{ statusMessage.text }}</p>
        </div>
      </div>

      <!-- Loading State (Processing Points) -->
      <div v-if="loading && !adShown" class="text-center py-8">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-[#4c739a]">Processing your points...</p>
      </div>

      <!-- Back Button -->
      <div v-if="completed" class="text-center">
        <button
          @click="goBack"
          class="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 flex items-center gap-2 mx-auto"
        >
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Rewards Page
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api';
import { useIronSource } from '../../composables/useIronSource';

const route = useRoute();
const router = useRouter();

const { initialize, showAd: showIronSourceAd, isAdAvailable, isLoading: ironSourceLoading, error: ironSourceError, forceCheckAvailability, trackingPreventionBlocked } = useIronSource();

const initializing = ref(true);
const adShown = ref(false);
const loading = ref(false);
const completed = ref(false);
const statusMessage = ref<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

const checkAdAvailability = async () => {
  try {
    loading.value = true;
    statusMessage.value = {
      type: 'info',
      text: 'Checking ad availability...',
    };
    
    if (!ironSourceLoading.value) {
      await initialize();
    }
    
    const available = await forceCheckAvailability();
    
    if (available) {
      statusMessage.value = {
        type: 'success',
        text: 'Ad available! Click "Watch Ad" to watch.',
      };
    } else {
      statusMessage.value = {
        type: 'error',
        text: 'No ads available. Try again later or ensure ad blocker is disabled.',
      };
    }
  } catch (error: any) {
    console.error('Error checking ad availability:', error);
    statusMessage.value = {
      type: 'error',
      text: error.message || 'Failed to load ad. Disable ad blocker and refresh page.',
    };
  } finally {
    loading.value = false;
  }
};

const showAd = async () => {
  try {
    loading.value = true;
    adShown.value = true;
    statusMessage.value = {
      type: 'info',
      text: 'Loading ad...',
    };

    const result = await showIronSourceAd();

    if (result.success && result.rewarded) {
      await awardPoints();
    } else if (result.success) {
      statusMessage.value = {
        type: 'error',
        text: 'Ad closed before completion. Points not awarded.',
      };
      adShown.value = false;
      loading.value = false;
    }
  } catch (error: any) {
    console.error('Error showing ad:', error);
    statusMessage.value = {
      type: 'error',
      text: error.message || 'Failed to show ad. Please try again.',
    };
    adShown.value = false;
    loading.value = false;
  }
};

const awardPoints = async () => {
  loading.value = true;
  statusMessage.value = {
    type: 'info',
    text: 'Ad completed! Processing your points...',
  };

  try {
    const response = await api.post('/rewards/watch-ad', {
      adMetadata: {
        timestamp: new Date().toISOString(),
        sessionId: route.query.session || '',
        adProvider: 'ironsource',
        appKey: '244d3c355',
        placementName: '0aoy03hfxtsvzcix',
      },
    });

    if (response.data.success) {
      statusMessage.value = {
        type: 'success',
        text: `Congratulations! You earned ${response.data.pointsEarned} points. Total points: ${response.data.totalPoints}`,
      };
      completed.value = true;
    } else {
      statusMessage.value = {
        type: 'error',
        text: response.data.message || 'Failed to earn points',
      };
    }
  } catch (error: any) {
    console.error('Error awarding points:', error);
    statusMessage.value = {
      type: 'error',
      text: error.response?.data?.message || 'Error processing points',
    };
  } finally {
    loading.value = false;
    adShown.value = false;
  }
};

const goBack = () => {
  router.push('/app/rewards');
};

onMounted(async () => {
  try {
    initializing.value = true;
    await initialize();
    
    setTimeout(() => {
      checkAdAvailability();
      initializing.value = false;
    }, 1000);
  } catch (error: any) {
    console.error('Error initializing IronSource:', error);
    statusMessage.value = {
      type: 'error',
      text: 'Failed to initialize ad. Please refresh page.',
    };
    initializing.value = false;
  }
});
</script>
