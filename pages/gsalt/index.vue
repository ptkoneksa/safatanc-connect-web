<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Icon } from '@iconify/vue';
import type { GSaltAccount, GSaltTransaction } from '~/types/gsalt_api';
import { useGSaltApi } from '~/composables/gsalt/useGSaltApi';
import { useGSaltToast } from '~/composables/gsalt/useGSaltToast';

definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

// SEO Meta Tags
useHead({
  title: 'GSalt Wallet - Safatanc Connect',
  meta: [
    { name: 'description', content: 'Manage your GSalt (Global Safatanc Loyalty Token) balance, transactions, and payments on Safatanc Connect.' },
    { property: 'og:title', content: 'GSalt Wallet - Safatanc Connect' },
    { property: 'og:description', content: 'Manage your GSalt (Global Safatanc Loyalty Token) balance, transactions, and payments on Safatanc Connect.' },
    { property: 'og:image', content: '/images/stech_logo_gradient.png' },
    { property: 'og:url', content: 'https://connect.safatanc.com/gsalt' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'GSalt Wallet - Safatanc Connect' },
    { name: 'twitter:description', content: 'Manage your GSalt (Global Safatanc Loyalty Token) balance, transactions, and payments on Safatanc Connect.' },
    { name: 'twitter:image', content: '/images/stech_logo_gradient.png' },
    { name: 'theme-color', content: '#ffbf00' }
  ],
}, { mode: 'server' });

// Composables
const {
  fetchAccount,
  createAccount,
  fetchTransactions,
  formatGSaltAmount,
  healthCheck
} = useGSaltApi();
const {
  showToast,
  toastMessage,
  toastType,
  showToastNotification,
  hideToast
} = useGSaltToast();

// State
const account = ref<GSaltAccount | null>(null);
const isLoading = ref(false);
const isAccountNotFound = ref(false);
const isCreatingAccount = ref(false);
const recentTransactions = ref<GSaltTransaction[]>([]);
const transactionsLoading = ref(false);
const healthStatus = ref<'checking' | 'healthy' | 'unhealthy'>('checking');

// Features menu
const features = [
  {
    title: 'Top Up',
    description: 'Add GSalt to your balance',
    icon: 'tabler:plus',
    route: '/gsalt/topup',
    color: 'bg-green-500/20 text-green-400',
    active: true
  },
  {
    title: 'Transfer',
    description: 'Send GSalt to others',
    icon: 'tabler:send',
    route: '/gsalt/transfer',
    color: 'bg-blue-500/20 text-blue-400',
    active: false
  },
  {
    title: 'Payment',
    description: 'Pay for services',
    icon: 'tabler:credit-card',
    route: '/gsalt/payment',
    color: 'bg-purple-500/20 text-purple-400',
    active: false
  },
  {
    title: 'Gift',
    description: 'Send gifts to friends',
    icon: 'tabler:gift',
    route: '/gsalt/gift',
    color: 'bg-pink-500/20 text-pink-400',
    active: false
  },
  {
    title: 'Voucher',
    description: 'Redeem voucher codes',
    icon: 'tabler:ticket',
    route: '/gsalt/voucher',
    color: 'bg-orange-500/20 text-orange-400',
    active: false
  },
  {
    title: 'Transactions',
    description: 'View transaction history',
    icon: 'tabler:list',
    route: '/gsalt/transactions',
    color: 'bg-gray-500/20 text-gray-400',
    active: false
  }
];

// Health check
const checkHealth = async () => {
  try {
    healthStatus.value = 'checking';
    const health = await healthCheck();
    healthStatus.value = health.status;
  } catch (error) {
    healthStatus.value = 'unhealthy';
    console.error('Health check failed:', error);
  }
};

// Load GSalt account
const loadAccount = async () => {
  try {
    isLoading.value = true;
    isAccountNotFound.value = false;

    await checkHealth();

    const result = await fetchAccount();
    if (result) {
      account.value = result;
      isAccountNotFound.value = false;
    } else {
      account.value = null;
      isAccountNotFound.value = true;
    }
  } catch (error: any) {
    console.error('Error loading account:', error);
    account.value = null;

    if (error.message?.includes('not registered')) {
      isAccountNotFound.value = true;
    } else if (!error.message?.includes('Network error')) {
      showToastNotification(error.message || 'Failed to load account', 'error');
    }
  } finally {
    isLoading.value = false;
  }
};

const handleCreateAccount = async () => {
  try {
    isCreatingAccount.value = true;
    const result = await createAccount();
    account.value = result;
    isAccountNotFound.value = false;
    showToastNotification('GSalt account created successfully!');
    await loadRecentTransactions();
  } catch (error: any) {
    console.error('Error creating account:', error);
    showToastNotification(error.message || 'Failed to create GSalt account', 'error');
  } finally {
    isCreatingAccount.value = false;
  }
};

const refreshAccount = async () => {
  await loadAccount();
  if (account.value) {
    await loadRecentTransactions();
  }
  showToastNotification('Account data refreshed successfully!');
};

// Load recent transactions
const loadRecentTransactions = async () => {
  if (!account.value) return;

  try {
    transactionsLoading.value = true;
    const result = await fetchTransactions(1, 5);
    recentTransactions.value = result.data;
  } catch (error: any) {
    console.error('Error loading recent transactions:', error);
  } finally {
    transactionsLoading.value = false;
  }
};

// Transaction utility functions
const getTransactionIcon = (type: string) => {
  const icons: Record<string, string> = {
    topup: 'tabler:plus',
    transfer_in: 'tabler:arrow-down',
    transfer_out: 'tabler:arrow-up',
    payment: 'tabler:credit-card',
    withdrawal: 'tabler:cash',
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
    payment: 'text-purple-400',
    withdrawal: 'text-red-400',
    voucher_redemption: 'text-orange-400',
    gift_in: 'text-pink-400',
    gift_out: 'text-pink-400',
  };
  return colors[type] || 'text-gray-400';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Load data on mount
onMounted(async () => {
  // Check health first
  await checkHealth();

  // Load account if health is good
  if (healthStatus.value === 'healthy') {
    await loadAccount();
    if (account.value) {
      await loadRecentTransactions();
    }
  }
});
</script>

<template>
  <div class="py-6">
    <div v-if="healthStatus === 'unhealthy'" class="container mx-auto px-4 md:px-8">
      <div class="bg-brand/20 rounded-2xl p-4 text-center">
        <h2 class="text-brand font-bold">Service Unavailable</h2>
        <p class="text-brand">The GSalt service is currently unavailable. Please try again later.</p>
        <NuxtLink to="/">
          <Button class="mt-4">
            <template #icon>
              <Icon icon="tabler:arrow-left" width="20" height="20" />
            </template>
            <template #text>
              Back to Home
            </template>
          </Button>
        </NuxtLink>
      </div>
    </div>
    <div v-if="healthStatus === 'healthy'" class="container mx-auto px-4 md:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="flex items-center gap-2">
              <NuxtImg src="/images/GSalt.png" alt="GSalt" class="h-12 aspect-square object-contain" />
              <h2 class="font-bold">GSalt</h2>
            </div>
            <p class="text-brand font-semibold text-2xl">Global Safatanc Asset Loyalty Token</p>
            <p class="text-gray-400">View your GSalt balance and transactions</p>
          </div>
        </div>
      </div>

      <!-- Account Not Found - Show Create Account UI -->
      <div v-if="isAccountNotFound && !isLoading"
        class="bg-dark-2 rounded-3xl p-8 border border-brand/30 text-center mb-8">
        <div class="mb-6">
          <div class="w-20 h-20 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-4">
            <Icon icon="tabler:wallet-off" class="text-brand" width="40" height="40" />
          </div>
          <h3 class="text-2xl font-bold text-white mb-2">GSalt Account Required</h3>
          <p class="text-gray-400 max-w-md mx-auto">
            You don't have a GSalt account yet. Create one now to start using GSalt (Global Safatanc Loyalty Token)
            for payments, transfers, and earning rewards.
          </p>
        </div>

        <div class="bg-dark-3 rounded-2xl p-6 mb-6 max-w-md mx-auto">
          <h4 class="font-semibold text-white mb-3">GSalt Benefits:</h4>
          <ul class="text-gray-300 text-sm space-y-2 text-left">
            <li class="flex items-center gap-2">
              <Icon icon="tabler:check" class="text-green-400 flex-shrink-0" width="16" height="16" />
              <span>Instant payments and transfers</span>
            </li>
            <li class="flex items-center gap-2">
              <Icon icon="tabler:check" class="text-green-400 flex-shrink-0" width="16" height="16" />
              <span>Earn loyalty points on transactions</span>
            </li>
            <li class="flex items-center gap-2">
              <Icon icon="tabler:check" class="text-green-400 flex-shrink-0" width="16" height="16" />
              <span>Access to exclusive vouchers and gifts</span>
            </li>
            <li class="flex items-center gap-2">
              <Icon icon="tabler:check" class="text-green-400 flex-shrink-0" width="16" height="16" />
              <span>Seamless integration with Safatanc services</span>
            </li>
          </ul>
        </div>

        <button @click="handleCreateAccount" :disabled="isCreatingAccount"
          class="px-8 py-4 bg-brand text-black rounded-2xl font-semibold hover:bg-brand/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
          <Icon v-if="isCreatingAccount" icon="tabler:loader" class="animate-spin mr-2" width="20" height="20" />
          {{ isCreatingAccount ? 'Creating Account...' : 'Create GSalt Account' }}
        </button>

        <p class="text-gray-500 text-sm mt-4">
          Creating an account is free and takes just a few seconds
        </p>
      </div>

      <!-- Balance Card when account exists -->
      <div v-else-if="account" class="space-y-8">
        <!-- Balance Card -->
        <div class="bg-dark-2 rounded-3xl p-6 border border-dark hover:border-brand transition-colors duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <NuxtImg src="/images/GSalt_Coin.png" alt="GSalt" class="h-12 aspect-square object-contain" />
              <div>
                <h3 class="text-lg font-semibold text-white">GSalt Balance</h3>
                <p class="text-gray-400 text-sm">1 GSALT = 1,000 IDR</p>
              </div>
            </div>
            <button @click="refreshAccount"
              class="p-2 rounded-full bg-dark-3 hover:bg-brand hover:text-black transition-colors duration-300">
              <Icon icon="tabler:refresh" width="20" height="20" />
            </button>
          </div>

          <div class="space-y-4">
            <div class="flex items-baseline gap-2">
              <span class="text-4xl font-bold text-white">{{ formatGSaltAmount(account.balance) }}</span>
              <span class="text-lg text-gray-400">GSALT</span>
            </div>

            <div class="flex items-center gap-4 text-sm text-gray-400">
              <div>Points: {{ account.points.toLocaleString() }}</div>
            </div>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <NuxtLink v-for="feature in features" :key="feature.title" :to="feature.active ? feature.route : '#'"
            class="relative z-50 bg-dark-2 rounded-3xl p-6 border border-dark hover:border-brand transition-all duration-300 group"
            :class="{ 'opacity-50 cursor-not-allowed': !feature.active }">
            <div :class="['w-12 h-12 rounded-full flex items-center justify-center mb-4', feature.color]">
              <Icon :icon="feature.icon" width="24" height="24" />
            </div>
            <h3 class="font-semibold text-white mb-2">{{ feature.title }}</h3>
            <p class="text-gray-400 text-sm">{{ feature.description }}</p>
            <p v-if="!feature.active" class="absolute top-5 right-5 text-brand/50 text-sm">Coming Soon</p>
          </NuxtLink>
        </div>

        <!-- Recent Transactions -->
        <div class="bg-dark-2 rounded-3xl p-6 border border-dark">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-white">Recent Transactions</h3>
            <NuxtLink to="/gsalt/transactions"
              class="text-brand hover:text-brand/80 text-sm font-medium transition-colors">
              View All
            </NuxtLink>
          </div>

          <div v-if="transactionsLoading" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>

          <div v-else-if="recentTransactions.length === 0" class="text-center py-8 text-gray-400">
            No transactions yet
          </div>

          <div v-else class="space-y-4">
            <div v-for="transaction in recentTransactions" :key="transaction.id"
              class="flex items-center gap-4 py-3 border-b border-dark last:border-0">
              <div
                :class="['w-10 h-10 rounded-full flex items-center justify-center bg-dark-3', getTransactionColor(transaction.type)]">
                <Icon :icon="getTransactionIcon(transaction.type)" width="20" height="20" />
              </div>
              <div class="flex-grow">
                <div class="flex items-center justify-between">
                  <p class="font-medium text-white capitalize">{{ transaction.type.replace('_', ' ') }}</p>
                  <p class="font-semibold text-white">{{ formatGSaltAmount(transaction.amount_gsalt_units) }} GSALT</p>
                </div>
                <div class="flex items-center justify-between">
                  <p class="text-gray-400 text-sm">{{ formatDate(transaction.created_at) }}</p>
                  <p class="text-sm font-medium text-green-400 capitalize">{{ transaction.status }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-else-if="isLoading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
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
