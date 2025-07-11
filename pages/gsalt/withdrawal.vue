<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { GSaltWithdrawalRequest, WithdrawalResponse } from '~/types/gsalt_api';
import { useGSaltApi } from '~/composables/gsalt/useGSaltApi';
import { useGSaltToast } from '~/composables/gsalt/useGSaltToast';

definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

useHead({
  title: 'Withdraw GSalt - Safatanc Connect',
});

// Composables
const { withdrawal, validateBankAccount, getWithdrawalBalance, getSupportedBanks } = useGSaltApi();
const { showToast, toastMessage, toastType, showToastNotification, hideToast } = useGSaltToast();

// State
const isLoading = ref(false);
const isValidating = ref(false);
const isLoadingBanks = ref(false);
const isLoadingBalance = ref(false);
const availableBalance = ref<any>(null);
const supportedBanks = ref<Array<{ code: string; name: string; available: boolean }>>([]);
const bankValidation = ref<{ valid: boolean; account_holder_name?: string; bank_name?: string } | null>(null);

// Constants
const ESTIMATED_TIME = "1-3 business days";

const form = reactive<GSaltWithdrawalRequest>({
  amount_gsalt: '',
  bank_code: '',
  account_number: '',
  recipient_name: '',
  description: '', // Add description field
});

// Load supported banks on mount
const loadSupportedBanks = async () => {
  try {
    isLoadingBanks.value = true;
    const result = await getSupportedBanks();
    supportedBanks.value = result.filter((bank: any) => bank.available);
  } catch (error: any) {
    console.error('Error loading banks:', error);
    showToastNotification('Failed to load supported banks', 'error');
  } finally {
    isLoadingBanks.value = false;
  }
};

// Load available balance
const loadAvailableBalance = async () => {
  try {
    isLoadingBalance.value = true;
    availableBalance.value = await getWithdrawalBalance();
  } catch (error: any) {
    console.error('Error loading balance:', error);
    showToastNotification('Failed to load available balance', 'error');
  } finally {
    isLoadingBalance.value = false;
  }
};

// Validate bank account
const handleBankValidation = async () => {
  if (!form.bank_code || !form.account_number) {
    bankValidation.value = null;
    return;
  }

  try {
    isValidating.value = true;
    bankValidation.value = null;

    const result = await validateBankAccount({
      bank_code: form.bank_code,
      account_number: form.account_number
    });

    bankValidation.value = result;

    if (result.valid && result.account_holder_name) {
      form.recipient_name = result.account_holder_name;
      showToastNotification('Bank account validated successfully!');
    }
  } catch (error: any) {
    console.error('Bank validation error:', error);
    bankValidation.value = { valid: false };
    showToastNotification(error.message || 'Bank account validation failed', 'error');
  } finally {
    isValidating.value = false;
  }
};

// Watch bank code and account number changes
watch([() => form.bank_code, () => form.account_number], () => {
  bankValidation.value = null;
});

// Handle form submission
const handleSubmit = async () => {
  // Validate amount
  const amount = parseFloat(form.amount_gsalt);
  if (isNaN(amount) || amount <= 0) {
    showToastNotification('Please enter a valid amount greater than 0', 'error');
    return;
  }

  // Check minimum withdrawal (1 GSALT)
  if (amount < 1) {
    showToastNotification('Minimum withdrawal is 1 GSALT', 'error');
    return;
  }

  // Check maximum withdrawal (25,000 GSALT)
  if (amount > 25000) {
    showToastNotification('Maximum withdrawal is 25,000 GSALT per transaction', 'error');
    return;
  }

  // Check available balance
  if (availableBalance.value && amount > parseFloat(availableBalance.value.balance_gsalt)) {
    showToastNotification('Insufficient balance for withdrawal', 'error');
    return;
  }

  try {
    isLoading.value = true;

    const request: GSaltWithdrawalRequest = {
      amount_gsalt: form.amount_gsalt.trim(),
      bank_code: form.bank_code,
      account_number: form.account_number.trim(),
      recipient_name: form.recipient_name.trim(),
      description: form.description?.trim() || undefined,
    };

    const result: WithdrawalResponse = await withdrawal(request);
    showToastNotification(
      `Withdrawal request submitted! Transaction ID: ${result.transaction.id.substring(0, 8)}... 
      Disbursement ID: ${result.disbursement_id}
      Estimated time: ${result.estimated_time}`
    );

    // Reset form
    Object.assign(form, {
      amount_gsalt: '',
      bank_code: '',
      account_number: '',
      recipient_name: '',
      description: '',
    });
    bankValidation.value = null;

    // Redirect back to main GSalt page after success
    setTimeout(() => {
      navigateTo('/gsalt');
    }, 3000);

  } catch (error: any) {
    showToastNotification(error.message || 'Withdrawal failed', 'error');
  } finally {
    isLoading.value = false;
  }
};

// Quick amount selection
const setQuickAmount = (percentage: number) => {
  if (availableBalance.value) {
    const amount = (parseFloat(availableBalance.value.balance_gsalt) * percentage / 100).toFixed(2);
    form.amount_gsalt = amount;
  }
};

// Initialize data
onMounted(() => {
  loadSupportedBanks();
  loadAvailableBalance();
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
            <h1 class="text-3xl font-bold text-white">Withdraw GSalt</h1>
            <p class="text-gray-400">Convert GSalt to IDR and transfer to your bank account</p>
          </div>
        </div>
      </div>

      <!-- Available Balance Card -->
      <div class="bg-dark-2 rounded-3xl p-6 border border-dark mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <Icon icon="tabler:wallet" class="text-green-400" width="24" height="24" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white">Available Balance</h3>
            <p class="text-gray-400 text-sm">Balance available for withdrawal</p>
          </div>
        </div>

        <div v-if="isLoadingBalance" class="animate-pulse">
          <div class="h-8 bg-dark-3 rounded mb-2"></div>
          <div class="h-4 bg-dark-3 rounded w-1/2"></div>
        </div>
        <div v-else-if="availableBalance" class="space-y-2">
          <p class="text-2xl font-bold text-white">{{ availableBalance.balance_gsalt }} GSALT</p>
          <p class="text-gray-400 text-sm">≈ {{ availableBalance.balance_idr }} IDR</p>

          <!-- Quick Amount Buttons -->
          <div class="flex gap-2 mt-4">
            <button @click="setQuickAmount(25)"
              class="px-3 py-1 bg-dark-3 text-gray-300 rounded-lg text-sm hover:bg-dark hover:text-white transition-colors">
              25%
            </button>
            <button @click="setQuickAmount(50)"
              class="px-3 py-1 bg-dark-3 text-gray-300 rounded-lg text-sm hover:bg-dark hover:text-white transition-colors">
              50%
            </button>
            <button @click="setQuickAmount(75)"
              class="px-3 py-1 bg-dark-3 text-gray-300 rounded-lg text-sm hover:bg-dark hover:text-white transition-colors">
              75%
            </button>
            <button @click="setQuickAmount(100)"
              class="px-3 py-1 bg-dark-3 text-gray-300 rounded-lg text-sm hover:bg-dark hover:text-white transition-colors">
              Max
            </button>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-400">
          Failed to load balance
        </div>
      </div>

      <!-- Withdrawal Form -->
      <div class="bg-dark-2 rounded-3xl p-6 border border-dark">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <Icon icon="tabler:cash" class="text-red-400" width="24" height="24" />
          </div>
          <h3 class="text-xl font-semibold text-white">Withdraw to Bank Account</h3>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Amount Input -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Amount (GSALT)</label>
            <input v-model="form.amount_gsalt" type="text" inputmode="decimal" pattern="[0-9]+(\.[0-9]+)?" required
              class="w-full px-4 py-3 bg-dark-3 border border-dark rounded-2xl text-white focus:border-brand focus:bg-dark-2 transition-colors"
              placeholder="Enter GSALT amount (e.g., 100.00)">
            <p class="text-gray-400 text-sm mt-2">
              Min: 1 GSALT | Max: 25,000 GSALT per transaction | 1 GSALT = 1,000 IDR
            </p>
          </div>

          <!-- Bank Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Bank</label>
            <select v-model="form.bank_code" required
              class="w-full px-4 py-3 bg-dark-3 border border-dark rounded-2xl text-white focus:border-brand focus:bg-dark-2 transition-colors">
              <option value="">Select your bank</option>
              <option v-for="bank in supportedBanks" :key="bank.code" :value="bank.code">
                {{ bank.name }} ({{ bank.code }})
              </option>
            </select>
            <div v-if="isLoadingBanks" class="text-gray-400 text-sm mt-2">
              Loading supported banks...
            </div>
          </div>

          <!-- Account Number -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Account Number</label>
            <div class="flex gap-2">
              <input v-model="form.account_number" type="text" required
                class="flex-grow px-4 py-3 bg-dark-3 border border-dark rounded-2xl text-white focus:border-brand focus:bg-dark-2 transition-colors"
                placeholder="Enter your bank account number">
              <button type="button" @click="handleBankValidation"
                :disabled="!form.bank_code || !form.account_number || isValidating"
                class="px-4 py-3 bg-brand text-black rounded-2xl font-medium hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon v-if="isValidating" icon="tabler:loader" class="animate-spin" width="20" height="20" />
                <Icon v-else icon="tabler:check" width="20" height="20" />
              </button>
            </div>

            <!-- Bank Validation Result -->
            <div v-if="bankValidation" class="mt-2">
              <div v-if="bankValidation.valid" class="flex items-center gap-2 text-green-400 text-sm">
                <Icon icon="tabler:check-circle" width="16" height="16" />
                <span>Account validated: {{ bankValidation.account_holder_name }}</span>
              </div>
              <div v-else class="flex items-center gap-2 text-red-400 text-sm">
                <Icon icon="tabler:x-circle" width="16" height="16" />
                <span>Invalid account number or account not found</span>
              </div>
            </div>
          </div>

          <!-- Recipient Name -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Account Holder Name</label>
            <input v-model="form.recipient_name" type="text" required
              class="w-full px-4 py-3 bg-dark-3 border border-dark rounded-2xl text-white focus:border-brand focus:bg-dark-2 transition-colors"
              placeholder="Enter account holder name (must match bank records)">
            <p class="text-gray-400 text-sm mt-2">
              Must match exactly with the name registered at the bank
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
            <textarea v-model="form.description" rows="3"
              class="w-full px-4 py-3 bg-dark-3 border border-dark rounded-2xl text-white focus:border-brand focus:bg-dark-2 transition-colors resize-none"
              placeholder="Add a note for this withdrawal (optional)"></textarea>
          </div>

          <!-- Withdrawal Summary -->
          <div class="bg-dark-3 rounded-2xl p-4">
            <h4 class="font-semibold text-white mb-2">Withdrawal Summary</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Amount (GSALT):</span>
                <span class="text-white">{{ form.amount_gsalt || '0' }} GSALT</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Amount (IDR):</span>
                <span class="text-white">{{ form.amount_gsalt ? (parseFloat(form.amount_gsalt) * 1000).toLocaleString()
                  : '0' }} IDR</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Bank:</span>
                <span class="text-white">{{supportedBanks.find(b => b.code === form.bank_code)?.name || 'Not selected'
                  }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Account:</span>
                <span class="text-white">{{ form.account_number || 'Not specified' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Recipient:</span>
                <span class="text-white">{{ form.recipient_name || 'Not specified' }}</span>
              </div>
            </div>
          </div>

          <!-- Important Notice -->
          <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
            <div class="flex items-start gap-3">
              <Icon icon="tabler:alert-triangle" class="text-yellow-400 flex-shrink-0 mt-0.5" width="20" height="20" />
              <div>
                <h4 class="font-semibold text-yellow-400 mb-1">Important Information</h4>
                <ul class="text-yellow-200 text-sm space-y-1">
                  <li>• Bank transfers usually take 1-3 business days to complete</li>
                  <li>• Daily withdrawal limit: 100,000 GSALT (100,000,000 IDR)</li>
                  <li>• Withdrawals cannot be cancelled once processed</li>
                  <li>• Ensure bank account details are correct before confirming</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit"
            :disabled="isLoading || !form.amount_gsalt || !form.bank_code || !form.account_number || !form.recipient_name"
            class="w-full py-3 bg-red-500 text-white rounded-2xl font-semibold hover:bg-red-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <Icon v-if="isLoading" icon="tabler:loader" class="animate-spin mr-2" width="20" height="20" />
            {{ isLoading ? 'Processing Withdrawal...' : 'Confirm Withdrawal' }}
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