<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { GSaltTransaction } from '~/types/gsalt_api';
import { useGSaltApi } from '~/composables/gsalt/useGSaltApi';
import { useGSaltToast } from '~/composables/gsalt/useGSaltToast';

definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

useHead({
  title: 'GSalt Transactions - Konek',
});

// Composables
const { fetchTransactions, formatGSaltAmount } = useGSaltApi();
const { showToast, toastMessage, toastType, showToastNotification, hideToast } = useGSaltToast();

// State
const transactions = ref<GSaltTransaction[]>([]);
const isLoading = ref(false);
const error = ref<string>('');
const currentPage = ref(1);
const totalPages = ref(1);

// Transaction utility functions
const getTransactionIcon = (type: string) => {
  const icons: Record<string, string> = {
    topup: 'tabler:plus',
    transfer_in: 'tabler:arrow-down',
    transfer_out: 'tabler:arrow-up',
    payment: 'tabler:credit-card',
    voucher_redemption: 'tabler:ticket',
    gift_in: 'tabler:gift',
    gift_out: 'tabler:gift',
  };
  return icons[type] || 'tabler:circle';
};

const getTransactionColor = (type: string) => {
  const colors: Record<string, string> = {
    topup: 'text-green-400',
    transfer_in: 'text-green-400',
    transfer_out: 'text-red-400',
    payment: 'text-blue-400',
    voucher_redemption: 'text-purple-400',
    gift_in: 'text-green-400',
    gift_out: 'text-red-400',
  };
  return colors[type] || 'text-gray-400';
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    completed: 'text-green-400',
    pending: 'text-yellow-400',
    failed: 'text-red-400',
    cancelled: 'text-gray-400',
  };
  return colors[status] || 'text-gray-400';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Load transactions
const loadTransactions = async (page: number = 1) => {
  try {
    isLoading.value = true;
    error.value = '';

    const result = await fetchTransactions(page, 10);
    transactions.value = result.data;
    currentPage.value = result.page;
    totalPages.value = result.total_pages;
  } catch (err: any) {
    error.value = err.message || 'Failed to load transactions';
    showToastNotification(error.value, 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleReload = () => {
  loadTransactions(currentPage.value);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadTransactions(page);
};

// Load data on mount
onMounted(() => {
  loadTransactions();
});
</script>

<template>
  <div class="py-6">
    <div class="container mx-auto px-4 md:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <NuxtLink to="/gsalt" class="p-2 rounded-full bg-dark-2 hover:bg-brand hover:text-black transition-colors">
            <Icon icon="tabler:arrow-left" width="20" height="20" />
          </NuxtLink>
          <div>
            <h1 class="text-3xl font-bold text-white">Transaction History</h1>
            <p class="text-gray-400">View all your GSalt transactions</p>
          </div>
        </div>
      </div>

      <!-- Transactions -->
      <div class="bg-dark-2 rounded-3xl p-6 border border-dark">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-white">All Transactions</h3>
          <div class="flex items-center gap-2">
            <button @click="handleReload"
              class="p-2 rounded-full bg-dark-3 hover:bg-brand hover:text-black transition-colors duration-300">
              <Icon icon="tabler:refresh" width="16" height="16" />
            </button>
            <NuxtLink to="/gsalt/voucher"
              class="px-4 py-2 bg-brand text-black rounded-2xl font-medium hover:bg-brand/90 transition-colors duration-300">
              Redeem Voucher
            </NuxtLink>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-400 mb-4">{{ error }}</div>
          <button @click="handleReload"
            class="px-4 py-2 bg-brand text-black rounded-2xl font-medium hover:bg-brand/90 transition-colors duration-300">
            Retry
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="transactions.length === 0" class="text-center py-12">
          <div class="w-16 h-16 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
            <Icon icon="tabler:receipt-off" class="text-gray-400" width="32" height="32" />
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">No Transactions Yet</h3>
          <p class="text-gray-400 mb-4">Start by topping up your GSalt balance!</p>
          <NuxtLink to="/gsalt/topup"
            class="inline-block px-6 py-2 bg-brand text-black rounded-2xl font-medium hover:bg-brand/90 transition-colors duration-300">
            Top Up Now
          </NuxtLink>
        </div>

        <!-- Transactions List -->
        <div v-else class="space-y-4">
          <div v-for="transaction in transactions" :key="transaction.id"
            class="flex items-center gap-4 p-4 bg-dark-3 rounded-2xl hover:bg-dark border border-transparent hover:border-brand/20 transition-all duration-300">
            <div
              :class="['w-12 h-12 rounded-full flex items-center justify-center bg-dark-2', getTransactionColor(transaction.type)]">
              <Icon :icon="getTransactionIcon(transaction.type)" width="24" height="24" />
            </div>
            <div class="flex-grow">
              <div class="flex items-center justify-between mb-1">
                <h4 class="font-semibold text-white capitalize">{{ transaction.type.replace('_', ' ') }}</h4>
                <p class="text-lg font-bold text-white">{{ formatGSaltAmount(transaction.amount_gsalt_units) }} GSALT
                </p>
              </div>
              <div class="flex items-center justify-between">
                <div class="space-y-1">
                  <p class="text-gray-400 text-sm">{{ formatDate(transaction.created_at) }}</p>
                  <p v-if="transaction.description" class="text-gray-300 text-sm">{{ transaction.description }}</p>
                </div>
                <div class="text-right">
                  <p :class="['text-sm font-medium capitalize', getStatusColor(transaction.status)]">{{
                    transaction.status }}</p>
                  <p v-if="transaction.payment_method" class="text-gray-400 text-xs">{{ transaction.payment_method }}
                  </p>
                </div>
              </div>

              <!-- Additional details for different transaction types -->
              <div v-if="transaction.type.includes('transfer') && (transaction as any).destination_connect_id"
                class="mt-2">
                <p class="text-gray-400 text-xs">
                  To: {{ (transaction as any).destination_connect_id }}
                </p>
              </div>
              <div v-if="transaction.type.includes('transfer') && (transaction as any).source_connect_id" class="mt-2">
                <p class="text-gray-400 text-xs">
                  From: {{ (transaction as any).source_connect_id }}
                </p>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center mt-8 gap-2">
            <button @click="handlePageChange(currentPage - 1)" :disabled="currentPage <= 1" :class="[
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              currentPage <= 1
                ? 'bg-dark-3 text-gray-600 cursor-not-allowed'
                : 'bg-dark-3 text-white hover:bg-brand hover:text-black'
            ]">
              <Icon icon="tabler:chevron-left" width="20" height="20" />
            </button>

            <!-- Page Numbers -->
            <div class="flex gap-1">
              <template v-for="page in Array.from({ length: totalPages }, (_, i) => i + 1)" :key="page">
                <button v-if="page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)"
                  @click="handlePageChange(page)" :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors text-sm font-medium',
                    page === currentPage
                      ? 'bg-brand text-black'
                      : 'bg-dark-3 text-white hover:bg-brand hover:text-black'
                  ]">
                  {{ page }}
                </button>
                <span v-else-if="page === currentPage - 3 || page === currentPage + 3"
                  class="flex items-center text-gray-400">
                  ...
                </span>
              </template>
            </div>

            <button @click="handlePageChange(currentPage + 1)" :disabled="currentPage >= totalPages" :class="[
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              currentPage >= totalPages
                ? 'bg-dark-3 text-gray-600 cursor-not-allowed'
                : 'bg-dark-3 text-white hover:bg-brand hover:text-black'
            ]">
              <Icon icon="tabler:chevron-right" width="20" height="20" />
            </button>
          </div>

          <!-- Page Info -->
          <div class="text-center text-gray-400 text-sm mt-4">
            Page {{ currentPage }} of {{ totalPages }} • {{ transactions.length }} transactions
          </div>
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