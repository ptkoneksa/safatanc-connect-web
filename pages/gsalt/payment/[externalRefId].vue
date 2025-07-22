<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { GSaltTransaction } from '~/types/gsalt_api';
import { useGSaltApi } from '~/composables/gsalt/useGSaltApi';
import { useGSaltToast } from '~/composables/gsalt/useGSaltToast';
import { usePaymentInstructions } from '~/composables/gsalt/usePaymentInstructions';
import { GSaltErrorCode } from '~/types/gsalt_api';

definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

const route = useRoute();
const externalRefId = route.params.externalRefId as string;

useHead({
  title: 'Payment Instructions - Konek',
});

// Composables
const { fetchTransactionById, fetchTransactionByRef } = useGSaltApi();
const { showToast, toastMessage, toastType, showToastNotification, hideToast } = useGSaltToast();
const {
  copyToClipboard,
  formatVirtualAccountNumber,
  formatExpiryTime,
  isPaymentExpired,
  getTimeRemaining
} = usePaymentInstructions();

// State
const isLoading = ref(true);
const transaction = ref<GSaltTransaction | null>(null);
const timeRemaining = ref({ hours: 0, minutes: 0, seconds: 0 });
const isExpired = ref(false);

// Payment methods info
const paymentMethods = [
  { value: 'QRIS', label: 'QRIS', icon: 'tabler:qrcode' },
  { value: 'VA_BCA', label: 'BCA Virtual Account', icon: 'tabler:building-bank' },
  { value: 'VA_BNI', label: 'BNI Virtual Account', icon: 'tabler:building-bank' },
  { value: 'VA_BRI', label: 'BRI Virtual Account', icon: 'tabler:building-bank' },
  { value: 'VA_MANDIRI', label: 'Mandiri Virtual Account', icon: 'tabler:building-bank' },
  { value: 'VA_CIMB', label: 'CIMB Virtual Account', icon: 'tabler:building-bank' },
  { value: 'VA_PERMATA', label: 'Permata Virtual Account', icon: 'tabler:building-bank' },
  { value: 'VA_BSI', label: 'BSI Virtual Account', icon: 'tabler:building-bank' },
  { value: 'VA_DANAMON', label: 'Danamon Virtual Account', icon: 'tabler:building-bank' },
  { value: 'VA_MAYBANK', label: 'Maybank Virtual Account', icon: 'tabler:building-bank' },
  { value: 'EWALLET_OVO', label: 'OVO', icon: 'tabler:wallet' },
  { value: 'EWALLET_DANA', label: 'DANA', icon: 'tabler:wallet' },
  { value: 'EWALLET_GOPAY', label: 'GoPay', icon: 'tabler:wallet' },
  { value: 'EWALLET_LINKAJA', label: 'LinkAja', icon: 'tabler:wallet' },
  { value: 'EWALLET_SHOPEEPAY', label: 'ShopeePay', icon: 'tabler:wallet' }
];

// Helper functions
const getPaymentMethodInfo = (method: string) => {
  return paymentMethods.find(m => m.value === method);
};

const getPaymentMethodIcon = (method: string) => {
  const info = getPaymentMethodInfo(method);
  return info?.icon || 'tabler:credit-card';
};

const getPaymentMethodLabel = (method: string) => {
  const info = getPaymentMethodInfo(method);
  return info?.label || method;
};

// Generate QR Code Data URL
const generateQRCodeDataURL = (qrString: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrString)}`;
};

// Helper functions for payment method checking
const isVirtualAccountMethod = (method: string) => {
  return method?.startsWith('VA_');
};

const isEWalletMethod = (method: string) => {
  return method?.startsWith('EWALLET_');
};

// Remove unused methods
const isRetailMethod = (method: string) => {
  return false; // Retail methods are not supported in the API
};

const isCardMethod = (method: string) => {
  return false; // Card methods are not supported in the API
};

// Get bank name from bank code
const getBankName = (bankCode: string): string => {
  const bankNames: Record<string, string> = {
    'BCA': 'BCA',
    'BNI': 'BNI',
    'BRI': 'BRI',
    'MANDIRI': 'Mandiri',
    'CIMB': 'CIMB Niaga',
    'PERMATA': 'Permata',
    'BSI': 'BSI',
    'DANAMON': 'Danamon',
    'MAYBANK': 'Maybank'
  };
  return bankNames[bankCode] || bankCode;
};

// Get e-wallet name
const getEWalletName = (method: string): string => {
  const ewalletNames: Record<string, string> = {
    'EWALLET_OVO': 'OVO',
    'EWALLET_DANA': 'DANA',
    'EWALLET_GOPAY': 'GoPay',
    'EWALLET_LINKAJA': 'LinkAja',
    'EWALLET_SHOPEEPAY': 'ShopeePay'
  };
  return ewalletNames[method] || method;
};

const handleCopyText = async (text: string, description: string) => {
  const success = await copyToClipboard(text);
  if (success) {
    showToastNotification(`${description} copied to clipboard!`);
  } else {
    showToastNotification(`Failed to copy ${description}`, 'error');
  }
};

const checkPaymentStatus = () => {
  showToastNotification('Checking payment status...');
  // Refresh the transaction data
  fetchTransaction();
};

const goBackToGSalt = () => {
  navigateTo('/gsalt');
};

// Fetch transaction data
const fetchTransaction = async () => {
  try {
    isLoading.value = true;
    let result;

    // Use fetchTransactionByRef if ID starts with GSALT-
    if (externalRefId.startsWith('GSALT-')) {
      result = await fetchTransactionByRef(externalRefId);
    } else {
      result = await fetchTransactionById(externalRefId);
    }

    if (!result) {
      showToastNotification('Transaction not found', 'error');
      // Give user time to read the error message before redirect
      setTimeout(() => {
        navigateTo('/gsalt');
      }, 3000);
      return;
    }

    transaction.value = result;

    // Update expiry status
    if (result.payment_details?.expiry_time) {
      isExpired.value = isPaymentExpired(result.payment_details.expiry_time);
      if (!isExpired.value) {
        timeRemaining.value = getTimeRemaining(result.payment_details.expiry_time);
      }
    }
  } catch (error: any) {
    // Handle specific error cases
    if (error.message === GSaltErrorCode.INTERNAL_ERROR) {
      showToastNotification('Service temporarily unavailable. Please try again later.', 'error');
    } else if (error.message === GSaltErrorCode.UNAUTHORIZED) {
      showToastNotification('Session expired. Please login again.', 'error');
    } else {
      showToastNotification(error.message || 'Failed to load transaction', 'error');
    }

    // Give user time to read the error message before redirect
    setTimeout(() => {
      if (error.message === GSaltErrorCode.UNAUTHORIZED) {
        // If unauthorized, redirect to login
        navigateTo('/login');
      } else {
        // For other errors, redirect to GSalt page
        navigateTo('/gsalt');
      }
    }, 3000);
  } finally {
    isLoading.value = false;
  }
};

// Update timer every second
let timerInterval: NodeJS.Timeout | null = null;

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (transaction.value?.payment_details?.expiry_time) {
      isExpired.value = isPaymentExpired(transaction.value.payment_details.expiry_time);
      if (!isExpired.value) {
        timeRemaining.value = getTimeRemaining(transaction.value.payment_details.expiry_time);
      } else {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      }
    }
  }, 1000);
};

// Lifecycle
onMounted(() => {
  fetchTransaction();
});

watch(transaction, (newTransaction) => {
  if (newTransaction?.payment_details?.expiry_time && !isExpired.value) {
    startTimer();
  }
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
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
            <h1 class="text-3xl font-bold text-white">Payment Instructions</h1>
            <p class="text-gray-400">Complete your payment to receive GSalt</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-dark-2 rounded-3xl p-6 border border-dark">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p class="text-gray-300">Loading payment instructions...</p>
        </div>
      </div>

      <!-- Payment Instructions -->
      <div v-else-if="transaction" class="space-y-6">
        <!-- Payment Instructions Header -->
        <div class="bg-dark-2 rounded-3xl p-6 border border-dark">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center">
              <Icon :icon="getPaymentMethodIcon(transaction.payment_method || '')" class="text-brand" width="24"
                height="24" />
            </div>
            <div>
              <h3 class="text-xl font-semibold text-white">{{ getPaymentMethodLabel(transaction.payment_method || '') }}
              </h3>
              <p class="text-gray-400">Complete your payment to receive GSalt</p>
            </div>
          </div>

          <!-- Transaction Summary -->
          <div class="bg-dark-3 rounded-2xl p-4 mb-6">
            <h4 class="font-semibold text-white mb-3">Transaction Details</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Amount:</span>
                <span class="text-white">{{ (transaction.amount_gsalt_units / 100).toFixed(2) }} GSALT</span>
              </div>
              <div v-if="transaction.fee_gsalt_units" class="flex justify-between">
                <span class="text-gray-400">Fee:</span>
                <span class="text-white">{{ (transaction.fee_gsalt_units / 100).toFixed(2) }} GSALT</span>
              </div>
              <div v-if="transaction.total_amount_gsalt_units" class="flex justify-between">
                <span class="text-gray-400">Total:</span>
                <span class="text-white font-semibold">{{ (transaction.total_amount_gsalt_units / 100).toFixed(2) }}
                  GSALT</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Payment Method:</span>
                <span class="text-white">{{ getPaymentMethodLabel(transaction.payment_method || '') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Status:</span>
                <span :class="{
                  'text-yellow-400': transaction.status === 'PENDING',
                  'text-green-400': transaction.status === 'COMPLETED',
                  'text-red-400': transaction.status === 'FAILED',
                  'text-gray-400': transaction.status === 'CANCELLED'
                }" class="capitalize">{{ transaction.status.toLowerCase() }}</span>
              </div>
              <div v-if="transaction.payment_details?.expiry_time && !isExpired" class="flex justify-between">
                <span class="text-gray-400">Expires in:</span>
                <span class="text-orange-400">{{ timeRemaining.hours }}h {{ timeRemaining.minutes }}m {{
                  timeRemaining.seconds }}s</span>
              </div>
              <div v-else-if="isExpired" class="flex justify-between">
                <span class="text-gray-400">Status:</span>
                <span class="text-red-400">Expired</span>
              </div>
            </div>
          </div>

          <!-- Payment Expired Warning -->
          <div v-if="isExpired" class="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
            <div class="flex items-start gap-3">
              <Icon icon="tabler:alert-triangle" class="text-red-400 flex-shrink-0 mt-0.5" width="20" height="20" />
              <div>
                <h4 class="font-semibold text-red-400 mb-1">Payment Expired</h4>
                <p class="text-red-200 text-sm">This payment has expired. Please create a new top-up request.</p>
              </div>
            </div>
          </div>

          <!-- QRIS Instructions -->
          <div v-if="!isExpired && transaction?.payment_method === 'QRIS' && transaction.payment_details?.qr_code"
            class="space-y-4">
            <div class="text-center">
              <div class="bg-white rounded-2xl p-4 inline-block mb-4">
                <img :src="generateQRCodeDataURL(transaction.payment_details.qr_code)" alt="QRIS Payment QR Code"
                  class="w-48 h-48 mx-auto" />
              </div>
              <p class="text-gray-300 text-sm">Scan the QR code with any QRIS-compatible app</p>
            </div>

            <div class="bg-dark-3 rounded-2xl p-4">
              <h5 class="font-medium text-white mb-2">QR Code String</h5>
              <div class="flex items-center gap-2">
                <code
                  class="flex-grow bg-dark text-gray-300 p-2 rounded text-xs break-all">{{ transaction.payment_details.qr_code }}</code>
                <button @click="handleCopyText(transaction.payment_details.qr_code, 'QR Code')"
                  class="px-3 py-2 bg-brand text-black rounded font-medium hover:bg-brand/90 transition-colors">
                  <Icon icon="tabler:copy" width="16" height="16" />
                </button>
              </div>
            </div>
          </div>

          <!-- Virtual Account Instructions -->
          <div
            v-else-if="!isExpired && transaction && isVirtualAccountMethod(transaction.payment_method || '') && transaction.payment_details?.virtual_account_number"
            class="space-y-4">
            <div class="bg-dark-3 rounded-2xl p-4">
              <h5 class="font-medium text-white mb-2">{{ getBankName(transaction.payment_details.virtual_account_bank ||
                '')
              }} Virtual Account</h5>
              <div class="space-y-3">
                <div>
                  <p class="text-gray-400 text-sm">Virtual Account Number</p>
                  <div class="flex items-center gap-2">
                    <code class="flex-grow bg-dark text-white p-2 rounded font-mono text-lg">
                      {{ formatVirtualAccountNumber(transaction.payment_details?.virtual_account_number || '') }}
                    </code>
                    <button
                      @click="handleCopyText(transaction.payment_details.virtual_account_number, 'Virtual Account Number')"
                      class="px-3 py-2 bg-brand text-black rounded font-medium hover:bg-brand/90 transition-colors">
                      <Icon icon="tabler:copy" width="16" height="16" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Steps -->
            <div class="bg-dark-3 rounded-2xl p-4">
              <h5 class="font-medium text-white mb-3">How to Pay</h5>
              <div class="space-y-4">
                <div v-if="transaction.payment_details?.payment_url" class="text-gray-300 text-sm space-y-2">
                  <div v-for="(instruction, index) in transaction.payment_details.payment_url.split('\n')" :key="index">
                    {{ instruction }}
                  </div>
                </div>
                <div v-else>
                  <p class="text-gray-300 text-sm">Transfer the exact amount to the virtual account number above using
                    {{ getBankName(transaction.payment_details?.virtual_account_bank || '') }} mobile banking,
                    internet banking, or ATM.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- E-Wallet Instructions -->
          <div
            v-else-if="!isExpired && transaction && isEWalletMethod(transaction.payment_method || '') && transaction.payment_details?.payment_url"
            class="space-y-4">
            <div class="text-center">
              <p class="text-gray-300 mb-4">You will be redirected to {{ getEWalletName(transaction.payment_method ||
                '') }} to complete the payment</p>
              <a :href="transaction.payment_details.payment_url" target="_blank"
                class="inline-block px-6 py-3 bg-brand text-black rounded-2xl font-semibold hover:bg-brand/90 transition-colors">
                Open {{ getEWalletName(transaction.payment_method || '') }}
              </a>
            </div>
          </div>

          <!-- Generic Instructions -->
          <div v-else-if="!isExpired && transaction?.payment_details" class="space-y-4">
            <div class="bg-dark-3 rounded-2xl p-4">
              <h5 class="font-medium text-white mb-2">Payment Instructions</h5>
              <p class="text-gray-300 text-sm">{{ transaction.payment_details.payment_url }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 mt-6">
            <button v-if="!isExpired && transaction.status === 'PENDING'" @click="checkPaymentStatus"
              class="flex-1 py-3 bg-brand text-black rounded-2xl font-semibold hover:bg-brand/90 transition-colors">
              <Icon icon="tabler:refresh" class="inline mr-2" width="20" height="20" />
              Check Payment Status
            </button>
            <button v-else @click="goBackToGSalt"
              class="flex-1 py-3 bg-brand text-black rounded-2xl font-semibold hover:bg-brand/90 transition-colors">
              <Icon icon="tabler:arrow-left" class="inline mr-2" width="20" height="20" />
              Back to GSalt
            </button>
          </div>
        </div>

        <!-- Important Notes -->
        <div v-if="!isExpired" class="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
          <div class="flex items-start gap-3">
            <Icon icon="tabler:info-circle" class="text-blue-400 flex-shrink-0 mt-0.5" width="20" height="20" />
            <div>
              <h4 class="font-semibold text-blue-400 mb-2">Important Notes</h4>
              <ul class="text-blue-200 text-sm space-y-1">
                <li>• Payment confirmation is automatic</li>
                <li>• GSalt will be added to your balance once payment is confirmed</li>
                <li>• Keep this page open until payment is completed</li>
                <li v-if="transaction.payment_details?.expiry_time">• Payment must be completed before expiry time
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="bg-dark-2 rounded-3xl p-6 border border-dark">
        <div class="text-center">
          <Icon icon="tabler:alert-circle" class="text-red-400 mx-auto mb-4" width="48" height="48" />
          <h3 class="text-xl font-semibold text-white mb-2">Transaction Not Found</h3>
          <p class="text-gray-400 mb-4">The requested transaction could not be found.</p>
          <NuxtLink to="/gsalt"
            class="inline-block px-6 py-3 bg-brand text-black rounded-2xl font-semibold hover:bg-brand/90 transition-colors">
            Back to GSalt
          </NuxtLink>
        </div>
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