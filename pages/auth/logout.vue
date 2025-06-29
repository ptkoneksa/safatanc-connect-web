<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useAuthApi } from '~/composables/useAuthApi';

definePageMeta({
  layout: 'auth'
});

const router = useRouter();
const authStore = useAuthStore();
const { logoutApi } = useAuthApi();

onMounted(async () => {
  try {
    await logoutApi();
  } catch (error: any) {
    console.error('Logout error:', error);
  } finally {
    // Always redirect to login page even if there was an error with the API call
    router.push('/auth/login');
  }
});
</script>

<template>
  <div class="p-8 bg-dark-2 border border-dark rounded-3xl transition-all duration-300 hover:border-brand">
    <h2 class="text-2xl font-bold mb-6 text-center text-white">Logging Out</h2>
    <div class="text-center">
      <p class="mb-4 text-gray-300">Please wait, logging you out...</p>
      <div class="w-full flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    </div>
  </div>
</template>