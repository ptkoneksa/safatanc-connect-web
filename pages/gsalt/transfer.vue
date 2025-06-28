<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { GSaltTransferRequest } from '~/types/gsalt_api';
import { useGSaltApi } from '~/composables/gsalt/useGSaltApi';
import { useGSaltToast } from '~/composables/gsalt/useGSaltToast';

definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

useHead({
  title: 'Transfer GSalt - Safatanc Connect',
});

// Composables
const { transfer } = useGSaltApi();
const { showToast, toastMessage, toastType, showToastNotification, hideToast } = useGSaltToast();

// State
const isLoading = ref(false);
const form = reactive<GSaltTransferRequest>({
  destination_connect_id: '',
  amount_gsalt: '',
  description: '',
});

const handleSubmit = async () => {
  // Validate amount_gsalt is a valid number
  const amount = parseFloat(form.amount_gsalt);
  if (isNaN(amount) || amount <= 0) {
    showToastNotification('Please enter a valid amount greater than 0', 'error');
    return;
  }

  try {
    isLoading.value = true;

    const request: GSaltTransferRequest = {
      destination_connect_id: form.destination_connect_id.trim(),
      amount_gsalt: form.amount_gsalt.trim(),
      description: form.description?.trim() || undefined,
    };

    await transfer(request);
    showToastNotification('Transfer successful!');

    // Reset form
    Object.assign(form, {
      destination_connect_id: '',
      amount_gsalt: '',
      description: '',
    });

    // Redirect back to main GSalt page after success
    setTimeout(() => {
      navigateTo('/gsalt');
    }, 2000);

  } catch (error: any) {
    showToastNotification(error.message || 'Transfer failed', 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="py-6">
    <div class="container mx-auto px-4 md:px-8 max-w-2xl">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <NuxtLink to="/gsalt" class="p-2 rounded-full bg-dark-2 hover:bg-brand hover:text-black transition-colors">
            <Icon icon="tabler:arrow-left" width="20" height="20" />
          </NuxtLink>
          <div>
            <h1 class="text-3xl font-bold text-white">Transfer GSalt</h1>
            <p class="text-gray-400">Send GSalt to another user</p>
          </div>
        </div>
      </div>

      <!-- Transfer Form -->
      <div class="bg-dark-2 rounded-3xl p-6 border border-dark">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center">
            <Icon icon="tabler:send" class="text-brand" width="24" height="24" />
          </div>
          <h3 class="text-xl font-semibold text-white">Send GSalt to Another User</h3>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Recipient Connect ID</label>
            <input v-model="form.destination_connect_id" type="text" required
              class="w-full px-4 py-3 bg-dark-3 border border-dark rounded-2xl text-white focus:border-brand focus:bg-dark-2 transition-colors"
              placeholder="Enter recipient's Connect ID (e.g., user123)">
            <p class="text-gray-400 text-sm mt-2">
              Make sure the Connect ID is correct. This cannot be undone.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Amount (GSALT)</label>
            <input v-model="form.amount_gsalt" type="text" inputmode="decimal" pattern="[0-9]+(\.[0-9]+)?" required
              class="w-full px-4 py-3 bg-dark-3 border border-dark rounded-2xl text-white focus:border-brand focus:bg-dark-2 transition-colors"
              placeholder="Enter GSALT amount (e.g., 10.50)">
            <p class="text-gray-400 text-sm mt-2">
              1 GSALT = 1,000 IDR
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
            <textarea v-model="form.description" rows="3"
              class="w-full px-4 py-3 bg-dark-3 border border-dark rounded-2xl text-white focus:border-brand focus:bg-dark-2 transition-colors resize-none"
              placeholder="Add a note for this transfer (optional)"></textarea>
          </div>

          <div class="bg-dark-3 rounded-2xl p-4">
            <h4 class="font-semibold text-white mb-2">Transfer Summary</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Recipient:</span>
                <span class="text-white">{{ form.destination_connect_id || 'Not specified' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Amount:</span>
                <span class="text-white">{{ form.amount_gsalt || '0' }} GSALT</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Description:</span>
                <span class="text-white">{{ form.description || 'None' }}</span>
              </div>
            </div>
          </div>

          <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
            <div class="flex items-start gap-3">
              <Icon icon="tabler:alert-triangle" class="text-yellow-400 flex-shrink-0 mt-0.5" width="20" height="20" />
              <div>
                <h4 class="font-semibold text-yellow-400 mb-1">Important</h4>
                <p class="text-yellow-200 text-sm">
                  Transfers cannot be reversed. Please double-check the recipient's Connect ID before confirming.
                </p>
              </div>
            </div>
          </div>

          <button type="submit" :disabled="isLoading || !form.amount_gsalt || !form.destination_connect_id"
            class="w-full py-3 bg-brand text-black rounded-2xl font-semibold hover:bg-brand/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <Icon v-if="isLoading" icon="tabler:loader" class="animate-spin mr-2" width="20" height="20" />
            {{ isLoading ? 'Sending Transfer...' : 'Send Transfer' }}
          </button>

          <div class="text-center">
            <NuxtLink to="/gsalt" class="text-gray-400 hover:text-white text-sm transition-colors">
              Cancel and go back
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="showToast" :class="[
      'fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-lg max-w-sm transition-all duration-300',
      toastType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    ]">
      <div class="flex items-center gap-3">
        <Icon :icon="toastType === 'success' ? 'tabler:check-circle' : 'tabler:alert-circle'" width="20" height="20" />
        <p class="font-medium">{{ toastMessage }}</p>
        <button @click="hideToast" class="ml-auto">
          <Icon icon="tabler:x" width="16" height="16" />
        </button>
      </div>
    </div>
  </div>
</template>