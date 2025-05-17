<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Icon } from '@iconify/vue';
import type { ApiResponse } from '~/types/api';

definePageMeta({
  layout: 'account'
});

// SEO Meta Tags
useHead({
  title: 'Email Verification - Safatanc Connect',
  meta: [
    { name: 'description', content: 'Verify your email address to complete your Safatanc Connect account registration.' },
    // Open Graph
    { property: 'og:title', content: 'Email Verification - Safatanc Connect' },
    { property: 'og:description', content: 'Verify your email address to complete your Safatanc Connect account registration.' },
    { property: 'og:image', content: '/images/stech_logo_gradient.png' },
    { property: 'og:url', content: 'https://connect.safatanc.com/auth/verify-email' },
    { property: 'og:type', content: 'website' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Email Verification - Safatanc Connect' },
    { name: 'twitter:description', content: 'Verify your email address to complete your Safatanc Connect account registration.' },
    { name: 'twitter:image', content: '/images/stech_logo_gradient.png' },
    // Theme Color
    { name: 'theme-color', content: '#ffbf00' } // Using brand color
  ],
}, { mode: 'server' });

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref<boolean>(true);
const error = ref<string>('');
const success = ref<string>('');

// Extract token from route params
const token = route.params.token as string;

// Verify email on component mount
onMounted(async () => {
  if (!token) {
    error.value = 'Verification token is missing';
    loading.value = false;
    return;
  }

  try {
    const config = useRuntimeConfig();
    const { data, error: apiError } = await useFetch<ApiResponse>(
      `${config.public.apiBaseUrl}/auth/verify-email/${token}`,
      {
        method: 'GET',
      }
    );

    if (apiError.value) {
      throw new Error(apiError.value.message || 'Email verification failed');
    }

    if (!data.value?.success) {
      throw new Error(data.value?.message || 'Email verification failed');
    }

    success.value = 'Your email has been successfully verified! You can now login to your account.';
  } catch (err: any) {
    error.value = err.message || 'Email verification failed. The token may be invalid or expired.';
  } finally {
    loading.value = false;
  }
});

const goToLogin = (): void => {
  router.push('/auth/login');
};
</script>

<template>
  <div class="p-8 bg-dark-2 border border-dark rounded-3xl transition-all duration-300 hover:border-brand">
    <h2 class="text-2xl font-bold mb-6 text-center text-white">Email Verification</h2>

    <div v-if="loading" class="text-center py-4">
      <div class="w-full flex justify-center mb-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
      <p class="text-gray-300">Verifying your email...</p>
    </div>

    <div v-else>
      <div v-if="error" class="p-4 rounded-3xl bg-red-900/30 border border-red-500 text-red-200 text-sm mb-4">
        {{ error }}
      </div>

      <div v-if="success" class="p-4 rounded-3xl bg-green-900/30 border border-green-500 text-green-200 text-sm mb-4">
        {{ success }}
      </div>

      <div class="mt-6">
        <Button @click="goToLogin" bg="bg-brand" color="text-black">
          <template #icon>
            <Icon icon="tabler:login" width="24" height="24" />
          </template>
          <template #text>
            Go to Login
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>