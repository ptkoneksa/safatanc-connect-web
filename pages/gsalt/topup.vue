<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { GSaltTopupRequest } from '~/types/gsalt_api';
import { useGSaltApi } from '~/composables/gsalt/useGSaltApi';
import { useGSaltToast } from '~/composables/gsalt/useGSaltToast';

definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

useHead({
  title: 'Top Up GSalt - Safatanc Connect',
});

// Composables
const { topup } = useGSaltApi();
const { showToast, toastMessage, toastType, showToastNotification, hideToast } = useGSaltToast();

// State
const isLoading = ref(false);
const form = reactive<GSaltTopupRequest>({
  amount_gsalt: '',
  payment_method: 'QRIS',
  payment_currency: 'IDR',
});

// Payment methods
const paymentMethods = [
  { value: 'QRIS', label: 'QRIS', icon: 'tabler:qrcode' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'tabler:building-bank' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: 'tabler:credit-card' },
  { value: 'DEBIT_CARD', label: 'Debit Card', icon: 'tabler:credit-card' },
  { value: 'GOPAY', label: 'GoPay', icon: 'tabler:wallet' },
  { value: 'OVO', label: 'OVO', icon: 'tabler:wallet' },
  { value: 'DANA', label: 'DANA', icon: 'tabler:wallet' },
];

const handleSubmit = async () => {
  // Validate amount_gsalt is a valid number
  const amount = parseFloat(form.amount_gsalt);
  if (isNaN(amount) || amount <= 0) {
    showToastNotification('Please enter a valid amount greater than 0', 'error');
    return;
  }

  try {
    isLoading.value = true;

    const request: GSaltTopupRequest = {
      amount_gsalt: form.amount_gsalt.trim(),
      payment_method: form.payment_method,
      payment_currency: form.payment_currency,
    };

    await topup(request);
    showToastNotification('Top up successful!');

    // Reset form
    Object.assign(form, {
      amount_gsalt: '',
      payment_method: 'QRIS',
      payment_currency: 'IDR',
    });

    // Redirect back to main GSalt page after success
    setTimeout(() => {
      navigateTo('/gsalt');
    }, 2000);

  } catch (error: any) {
    showToastNotification(error.message || 'Top up failed', 'error');
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
            <h1 class="text-3xl font-bold text-white">Top Up GSalt</h1>
            <p class="text-gray-400">Add funds to your GSalt balance</p>
          </div>
        </div>
      </div>

      <!-- Top Up Form -->
      <div class="bg-dark-2 rounded-3xl p-6 border border-dark">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center">
            <Icon icon="tabler:plus" class="text-brand" width="24" height="24" />
          </div>
          <h3 class="text-xl font-semibold text-white">Add GSalt to Your Account</h3>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
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
            <label class="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label v-for="method in paymentMethods" :key="method.value" :class="[
                'flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all',
                form.payment_method === method.value
                  ? 'border-brand bg-brand/10'
                  : 'border-dark bg-dark-3 hover:border-gray-600'
              ]">
                <input type="radio" :value="method.value" v-model="form.payment_method" class="sr-only">
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  form.payment_method === method.value ? 'bg-brand/20 text-brand' : 'bg-gray-600 text-gray-400'
                ]">
                  <Icon :icon="method.icon" width="16" height="16" />
                </div>
                <span :class="[
                  'font-medium',
                  form.payment_method === method.value ? 'text-white' : 'text-gray-300'
                ]">
                  {{ method.label }}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Payment Currency</label>
            <select v-model="form.payment_currency" required
              class="w-full px-4 py-3 bg-dark-3 border border-dark rounded-2xl text-white focus:border-brand focus:bg-dark-2 transition-colors">
              <option value="IDR">Indonesian Rupiah (IDR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="SGD">Singapore Dollar (SGD)</option>
            </select>
          </div>

          <div class="bg-dark-3 rounded-2xl p-4">
            <h4 class="font-semibold text-white mb-2">Transaction Summary</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Amount:</span>
                <span class="text-white">{{ form.amount_gsalt || '0' }} GSALT</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Payment Method:</span>
                <span class="text-white">{{paymentMethods.find(m => m.value === form.payment_method)?.label}}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Currency:</span>
                <span class="text-white">{{ form.payment_currency }}</span>
              </div>
            </div>
          </div>

          <button type="submit" :disabled="isLoading || !form.amount_gsalt"
            class="w-full py-3 bg-brand text-black rounded-2xl font-semibold hover:bg-brand/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <Icon v-if="isLoading" icon="tabler:loader" class="animate-spin mr-2" width="20" height="20" />
            {{ isLoading ? 'Processing...' : 'Top Up GSalt' }}
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