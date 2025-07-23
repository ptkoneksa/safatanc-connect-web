<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { GSaltTopupRequest, TopupResponse, PaymentMethodCode, PaymentMethod } from '~/types/gsalt_api';
import { useGSaltApi } from '~/composables/gsalt/useGSaltApi';
import { useGSaltToast } from '~/composables/gsalt/useGSaltToast';
import { usePaymentInstructions } from '~/composables/gsalt/usePaymentInstructions';

definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

useHead({
  title: 'Top Up GSalt - Koneksa',
});

// Composables
const { topup, getPaymentMethods } = useGSaltApi();
const { showToast, toastMessage, toastType, showToastNotification, hideToast } = useGSaltToast();
const {
  copyToClipboard,
  formatVirtualAccountNumber,
  formatExpiryTime,
  isPaymentExpired
} = usePaymentInstructions();

// State
const isLoading = ref(false);
const isLoadingPaymentMethods = ref(false);
const paymentMethods = ref<PaymentMethod[]>([]);

const form = reactive({
  amount_gsalt: '',
  payment_method: 'QRIS' as PaymentMethodCode,
  payment_currency: 'IDR',
  external_reference_id: '',
});

// Load payment methods from API
const loadPaymentMethods = async () => {
  try {
    isLoadingPaymentMethods.value = true;
    const response = await getPaymentMethods({
      currency: 'IDR',
      is_active: true,
      is_available_for_topup: true
    });
    paymentMethods.value = response.data;
  } catch (error: any) {
    console.error('Error loading payment methods:', error);
    showToastNotification('Failed to load payment methods', 'error');
  } finally {
    isLoadingPaymentMethods.value = false;
  }
};

const formatFeeText = (method: PaymentMethod) => {
  const parts = [];
  if (method.payment_fee_percent) parts.push(`${method.payment_fee_percent}%`);
  if (method.payment_fee_flat) parts.push(`+${method.payment_fee_flat / 1000} GSALT`);
  return parts.join(' ');
};

// Remove min/max amount validations since they're not in the API
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
      payment_amount: Math.round(parseFloat(form.amount_gsalt) * 1000), // Convert to IDR (1 GSALT = 1000 IDR)
      payment_currency: form.payment_currency,
      external_reference_id: form.external_reference_id.trim() || undefined,
    };

    const result: TopupResponse = await topup(request);

    if (result.transaction.status === 'PENDING') {
      showToastNotification('Payment instructions created! Redirecting to payment page...');

      // Redirect to payment page with transaction ID
      const paymentId = result.transaction.id;
      setTimeout(() => {
        navigateTo(`/gsalt/payment/${paymentId}`);
      }, 1500);
    } else {
      showToastNotification('Top up request created successfully!');
      // Reset form
      Object.assign(form, {
        amount_gsalt: '',
        payment_method: 'QRIS',
        payment_currency: 'IDR',
        external_reference_id: '',
      });

      setTimeout(() => {
        navigateTo('/gsalt');
      }, 2000);
    }

  } catch (error: any) {
    showToastNotification(error.message || 'Top up failed', 'error');
  } finally {
    isLoading.value = false;
  }
};

// Initialize data
onMounted(() => {
  loadPaymentMethods();
});

// Computed properties for payment method display
const getPaymentMethodIcon = (code: string) => {
  if (code.toLowerCase().includes('qris')) return 'tabler:qrcode';
  if (code.toLowerCase().includes('va_')) return 'tabler:building-bank';
  if (code.toLowerCase().includes('ewallet')) return 'tabler:wallet';
  return 'tabler:credit-card';
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
          <!-- Payment Method Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
            <div v-if="isLoadingPaymentMethods" class="animate-pulse space-y-3">
              <div v-for="i in 3" :key="i" class="h-16 bg-dark-3 rounded-2xl"></div>
            </div>
            <div v-else class="grid gap-3">
              <div v-for="method in paymentMethods" :key="method.code" class="relative">
                <input v-model="form.payment_method" :value="method.code" type="radio" :id="method.code"
                  class="sr-only peer">
                <label :for="method.code"
                  class="flex items-center gap-4 p-4 bg-dark-3 border border-dark rounded-2xl cursor-pointer hover:bg-dark-2 peer-checked:border-brand peer-checked:bg-brand/10 transition-all duration-300">
                  <Icon :icon="getPaymentMethodIcon(method.code)" class="text-brand flex-shrink-0" width="24"
                    height="24" />
                  <div class="flex-grow">
                    <div class="flex items-center justify-between">
                      <h4 class="font-medium text-white">{{ method.name }}</h4>
                      <span class="text-xs text-brand font-medium">{{ formatFeeText(method) }}</span>
                    </div>
                    <p class="text-gray-400 text-sm">{{ method.method_type }} via {{ method.provider_code }}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Amount Input -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Amount (GSALT)</label>
            <input v-model="form.amount_gsalt" type="text" inputmode="decimal" pattern="[0-9]+(\.[0-9]+)?" required
              class="w-full px-4 py-3 bg-dark-3 border border-dark rounded-2xl text-white focus:border-brand focus:bg-dark-2 transition-colors"
              placeholder="Enter GSALT amount (e.g., 10.50)">
            <p class="text-gray-400 text-sm mt-2">
              1 GSALT = 1,000 IDR
            </p>
          </div>

          <!-- External Reference ID -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">External Reference ID (Optional)</label>
            <input v-model="form.external_reference_id" type="text"
              class="w-full px-4 py-3 bg-dark-3 border border-dark rounded-2xl text-white focus:border-brand focus:bg-dark-2 transition-colors"
              placeholder="Enter your reference ID">
            <p class="text-gray-400 text-sm mt-2">
              Custom reference ID for tracking this transaction
            </p>
          </div>

          <!-- Transaction Summary -->
          <div class="bg-dark-3 rounded-2xl p-4">
            <h4 class="font-semibold text-white mb-2">Transaction Summary</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Amount:</span>
                <span class="text-white">{{ form.amount_gsalt || '0' }} GSALT</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Payment Method:</span>
                <span class="text-white">{{paymentMethods.find(m => m.code === form.payment_method)?.name ||
                  'Not selected'}}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Currency:</span>
                <span class="text-white">IDR</span>
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