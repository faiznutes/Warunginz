/**
 * PWA Composable
 * Handles PWA installation and service worker registration
 */

import { ref, onMounted } from 'vue';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const installPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isInstalled = ref(false);
const isStandalone = ref(false);
const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);
const isSWActive = ref(false);
const lastSWCheck = ref<Date | null>(null);

let pwaLifecycleBound = false;
let serviceWorkerRegistered = false;

function bindPWALifecycleListeners() {
  if (pwaLifecycleBound || typeof window === 'undefined') {
    return;
  }

  window.addEventListener('beforeinstallprompt', (event: Event) => {
    const promptEvent = event as BeforeInstallPromptEvent;
    promptEvent.preventDefault();
    installPrompt.value = promptEvent;
    console.log('PWA install prompt captured for custom install UI');
  });

  window.addEventListener('appinstalled', () => {
    isInstalled.value = true;
    installPrompt.value = null;
    console.log('PWA installed');
  });

  window.addEventListener('online', () => {
    isOnline.value = true;
  });

  window.addEventListener('offline', () => {
    isOnline.value = false;
  });

  pwaLifecycleBound = true;
}

export function usePWA() {

  // Check if app is installed
  const checkInstallation = () => {
    // Check if running in standalone mode (installed PWA)
    isStandalone.value = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    // Check if app is already installed
    if (isStandalone.value) {
      isInstalled.value = true;
    }
  };

  // Register service worker
  const registerServiceWorker = async () => {
    if (!serviceWorkerRegistered && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        console.log('Service Worker registered:', registration);

        isSWActive.value = !!registration.active;
        lastSWCheck.value = new Date();
        serviceWorkerRegistered = true;

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('New service worker available');
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        isSWActive.value = false;
      }
    }
  };

  // Check Service Worker Status (Health Check)
  const checkSWStatus = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      isSWActive.value = !!registration?.active && !!navigator.serviceWorker.controller;
      lastSWCheck.value = new Date();
      return isSWActive.value;
    }
    return false;
  };

  // Show install prompt
  const showInstallPrompt = async () => {
    if (installPrompt.value) {
      await installPrompt.value.prompt();
      const choice = await installPrompt.value.userChoice;
      if (choice.outcome === 'accepted') {
        isInstalled.value = true;
        console.log('User accepted PWA install');
      }
      installPrompt.value = null;
    }
  };

  // Update online status
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine;
  };

  onMounted(() => {
    checkInstallation();
    registerServiceWorker();
    bindPWALifecycleListeners();
    updateOnlineStatus();
  });

  return {
    installPrompt,
    isInstalled,
    isStandalone,
    isOnline,
    isSWActive,
    lastSWCheck,
    showInstallPrompt,
    checkInstallation,
    checkSWStatus,
  };
}

