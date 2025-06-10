<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Icon } from '@iconify/vue';

definePageMeta({
  layout: 'auth'
});

// SEO Meta Tags
useHead({
  title: 'Authentication - Safatanc Connect',
  meta: [
    { name: 'description', content: 'Processing authentication for Safatanc Connect.' },
    // Open Graph
    { property: 'og:title', content: 'Authentication - Safatanc Connect' },
    { property: 'og:description', content: 'Processing authentication for Safatanc Connect.' },
    { property: 'og:image', content: '/images/stech_logo_gradient.png' },
    { property: 'og:url', content: 'https://connect.safatanc.com/auth/callback' },
    { property: 'og:type', content: 'website' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Authentication - Safatanc Connect' },
    { name: 'twitter:description', content: 'Processing authentication for Safatanc Connect.' },
    { name: 'twitter:image', content: '/images/stech_logo_gradient.png' },
    // Theme Color
    { name: 'theme-color', content: '#ffbf00' } // Using brand color
  ],
}, { mode: 'server' });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// State management
const isLoading = ref(true);
const error = ref<string | null>(null);

// Extract tokens from URL
const token = route.query.token as string;
const refreshToken = route.query.refresh_token as string;
const redirectUri = route.query.redirect_uri as string;

// Process tokens on mount
onMounted(async () => {
  try {
    if (!token) {
      error.value = 'Authentication failed: No token received';
      isLoading.value = false;
      return;
    }

    // Process the OAuth authentication
    await authStore.processOAuthCallback(token, refreshToken || '', redirectUri || '');

    // Clean the URL (remove query parameters) using Nuxt's router
    // await router.replace({ path: route.path, query: {} });

    // Note: the navigation to final destination happens in the store method
  } catch (err: any) {
    console.error('Authentication error:', err);
    error.value = err.message || 'Failed to complete authentication';
    isLoading.value = false;
  }
});

// Handle going back to login page
const goToLogin = () => {
  navigateTo('/auth/login', { external: true });
};
</script>

<template>
  <div class="max-w-md mx-auto px-4 py-8 text-white">
    <div class="text-center mb-8">
      <img src="/images/stech_logo_gradient.png" alt="Safatanc Connect Logo" class="h-16 mx-auto mb-4" />
      <h1 class="text-2xl font-bold mb-2">Authentication</h1>
    </div>

    <div v-if="isLoading" class="bg-dark-2 border border-dark p-6 rounded-2xl text-center">
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center animate-pulse">
          <Icon icon="tabler:loader" class="text-brand animate-spin" width="32" height="32" />
        </div>
      </div>
      <p class="text-gray-300">Processing authentication...</p>
      <p class="text-gray-400 text-sm mt-2">Please wait while we complete your login</p>
    </div>

    <div v-if="error" class="bg-dark-2 border border-red-800 p-6 rounded-2xl text-center">
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <Icon icon="tabler:alert-triangle" class="text-red-500" width="32" height="32" />
        </div>
      </div>
      <h2 class="text-xl font-semibold text-red-400 mb-2">Authentication Failed</h2>
      <p class="text-gray-300 mb-4">{{ error }}</p>
      <button @click="goToLogin"
        class="bg-brand hover:bg-brand/90 text-dark font-medium py-2 px-6 rounded-full transition-all duration-300 inline-flex items-center">
        <Icon icon="tabler:arrow-left" class="mr-2" />
        Back to Login
      </button>
    </div>
  </div>
</template>