<template>
  <div v-if="transaction && transaction.payment_instructions" class="bg-dark-2 rounded-3xl p-6 border border-dark">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center">
        <Icon :icon="getPaymentMethodIcon(transaction.payment_method)" class="text-brand" width="24" height="24" />
      </div>
      <div>
        <h3 class="text-xl font-semibold text-white">{{ getPaymentMethodTitle(transaction.payment_method) }}</h3>
        <p class="text-gray-400">{{ subtitle || 'Complete your payment to proceed' }}</p>
      </div>
    </div>

    <!-- Transaction Summary -->
    <div class="bg-dark-3 rounded-2xl p-4 mb-6">
      <h4 class="font-semibold text-white mb-3">Transaction Details</h4>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-400">Amount:</span>
          <span class="text-white">{{ transaction.amount_gsalt_units / 100 }} GSALT</span>
        </div>
        <div v-if="transaction.fee_amount_gsalt_units" class="flex justify-between">
          <span class="text-gray-400">Fee:</span>
          <span class="text-white">{{ transaction.fee_amount_gsalt_units / 100 }} GSALT</span>
        </div>
        <div v-if="transaction.total_amount_gsalt_units" class="flex justify-between">
          <span class="text-gray-400">Total:</span>
          <span class="text-white font-semibold">{{ transaction.total_amount_gsalt_units / 100 }} GSALT</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Payment Method:</span>
          <span class="text-white">{{ getPaymentMethodLabel(transaction.payment_method || '') }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Status:</span>
          <span :class="getStatusColor(transaction.status)" class="capitalize">{{ transaction.status }}</span>
        </div>
        <div v-if="transaction.payment_instructions?.expiry_time" class="flex justify-between">
          <span class="text-gray-400">Expires in:</span>
          <span class="text-orange-400">{{ formatExpiryTime(transaction.payment_instructions.expiry_time) }}</span>
        </div>
        <div v-if="transaction.payment_instructions?.total_amount" class="flex justify-between">
          <span class="text-gray-400">Payment Amount:</span>
          <span class="text-white">{{ transaction.payment_instructions.total_amount.toLocaleString() }} {{
            transaction.payment_instructions.currency }}</span>
        </div>
      </div>
    </div>

    <!-- QRIS Instructions -->
    <div v-if="isQRISPayment && qrisInstructions.qr_code" class="space-y-4">
      <div class="text-center">
        <div class="bg-white rounded-2xl p-4 inline-block mb-4">
          <img v-if="qrisInstructions.qr_code_url" :src="qrisInstructions.qr_code_url" alt="QRIS Payment QR Code"
            class="w-48 h-48 mx-auto" />
          <div v-else class="w-48 h-48 mx-auto flex items-center justify-center bg-gray-100 text-gray-500">
            QR Code
          </div>
        </div>
        <p class="text-gray-300 text-sm">Scan the QR code with any QRIS-compatible app</p>
      </div>

      <div v-if="qrisInstructions.qr_code" class="bg-dark-3 rounded-2xl p-4">
        <h5 class="font-medium text-white mb-2">QR Code String</h5>
        <div class="flex items-center gap-2">
          <code
            class="flex-grow bg-dark text-gray-300 p-2 rounded text-xs break-all">{{ qrisInstructions.qr_code }}</code>
          <button @click="handleCopyText(qrisInstructions.qr_code!, 'QR Code')"
            class="p-2 bg-brand text-black rounded-lg hover:bg-brand/90 transition-colors">
            <Icon icon="tabler:copy" width="16" height="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Virtual Account Instructions -->
    <div v-else-if="isVirtualAccountPayment && virtualAccountInstructions.account_number" class="space-y-4">
      <div class="bg-dark-3 rounded-2xl p-4">
        <h5 class="font-medium text-white mb-3">Transfer Details</h5>
        <div class="space-y-3">
          <div v-if="virtualAccountInstructions.bank_name">
            <label class="block text-gray-400 text-sm mb-1">Bank</label>
            <div class="flex items-center gap-2">
              <span class="text-white font-medium">{{ virtualAccountInstructions.bank_name }}</span>
              <span v-if="virtualAccountInstructions.bank_code" class="text-gray-400 text-sm">({{
                virtualAccountInstructions.bank_code }})</span>
            </div>
          </div>
          <div>
            <label class="block text-gray-400 text-sm mb-1">Virtual Account Number</label>
            <div class="flex items-center gap-2">
              <code
                class="flex-grow bg-dark text-white p-2 rounded font-mono text-lg">{{ formatVirtualAccountNumber(virtualAccountInstructions.account_number) }}</code>
              <button @click="handleCopyText(virtualAccountInstructions.account_number!, 'Virtual Account Number')"
                class="p-2 bg-brand text-black rounded-lg hover:bg-brand/90 transition-colors">
                <Icon icon="tabler:copy" width="16" height="16" />
              </button>
            </div>
          </div>
          <div v-if="virtualAccountInstructions.total_amount">
            <label class="block text-gray-400 text-sm mb-1">Amount</label>
            <div class="flex items-center gap-2">
              <span class="text-white font-medium">{{ virtualAccountInstructions.total_amount.toLocaleString() }} {{
                virtualAccountInstructions.currency }}</span>
              <button @click="handleCopyText(virtualAccountInstructions.total_amount!.toString(), 'Amount')"
                class="p-2 bg-brand text-black rounded-lg hover:bg-brand/90 transition-colors">
                <Icon icon="tabler:copy" width="16" height="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- E-Wallet Instructions -->
    <div v-else-if="isEWalletPayment && ewalletInstructions.checkout_url" class="space-y-4">
      <div class="text-center">
        <div class="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-4">
          <Icon icon="tabler:wallet" class="text-brand" width="32" height="32" />
        </div>
        <h5 class="font-medium text-white mb-2">{{ ewalletInstructions.provider || 'E-Wallet' }} Payment</h5>
        <p class="text-gray-400 text-sm mb-4">You will be redirected to complete the payment</p>
        <a :href="ewalletInstructions.checkout_url" target="_blank"
          class="inline-block px-6 py-3 bg-brand text-black rounded-2xl font-semibold hover:bg-brand/90 transition-colors">
          Open {{ ewalletInstructions.provider || 'E-Wallet' }}
          <Icon icon="tabler:external-link" class="inline ml-2" width="16" height="16" />
        </a>

        <!-- QR Code for E-wallet if available -->
        <div v-if="ewalletInstructions.qr_code" class="mt-4">
          <div class="bg-white rounded-2xl p-4 inline-block">
            <div class="w-32 h-32 mx-auto flex items-center justify-center bg-gray-100 text-gray-500">
              QR Code
            </div>
          </div>
          <p class="text-gray-300 text-sm mt-2">Or scan QR code with the app</p>
        </div>
      </div>
    </div>

    <!-- Card Payment Instructions -->
    <div v-else-if="isCardPayment && cardInstructions.checkout_url" class="space-y-4">
      <div class="text-center">
        <div class="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-4">
          <Icon icon="tabler:credit-card" class="text-brand" width="32" height="32" />
        </div>
        <h5 class="font-medium text-white mb-2">Card Payment</h5>
        <p class="text-gray-400 text-sm mb-4">You will be redirected to secure payment form</p>
        <a :href="cardInstructions.checkout_url" target="_blank"
          class="inline-block px-6 py-3 bg-brand text-black rounded-2xl font-semibold hover:bg-brand/90 transition-colors">
          Continue to Payment
          <Icon icon="tabler:external-link" class="inline ml-2" width="16" height="16" />
        </a>
      </div>
    </div>

    <!-- Retail Payment Instructions -->
    <div v-else-if="isRetailPayment && retailInstructions.payment_code" class="space-y-4">
      <div class="bg-dark-3 rounded-2xl p-4">
        <h5 class="font-medium text-white mb-3">{{ retailInstructions.outlet_name || 'Retail Outlet' }} Payment</h5>
        <div class="space-y-3">
          <div>
            <label class="block text-gray-400 text-sm mb-1">Payment Code</label>
            <div class="flex items-center gap-2">
              <code
                class="flex-grow bg-dark text-white p-2 rounded font-mono text-lg">{{ retailInstructions.payment_code }}</code>
              <button @click="handleCopyText(retailInstructions.payment_code!, 'Payment Code')"
                class="p-2 bg-brand text-black rounded-lg hover:bg-brand/90 transition-colors">
                <Icon icon="tabler:copy" width="16" height="16" />
              </button>
            </div>
          </div>
          <div v-if="retailInstructions.total_amount">
            <label class="block text-gray-400 text-sm mb-1">Amount</label>
            <div class="flex items-center gap-2">
              <span class="text-white font-medium">{{ retailInstructions.total_amount.toLocaleString() }} {{
                retailInstructions.currency }}</span>
              <button @click="handleCopyText(retailInstructions.total_amount!.toString(), 'Amount')"
                class="p-2 bg-brand text-black rounded-lg hover:bg-brand/90 transition-colors">
                <Icon icon="tabler:copy" width="16" height="16" />
              </button>
            </div>
          </div>
          <div v-if="retailInstructions.instructions">
            <label class="block text-gray-400 text-sm mb-1">Instructions</label>
            <p class="text-gray-300 text-sm">{{ retailInstructions.instructions }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Generic Instructions -->
    <div v-else-if="transaction.payment_instructions?.instructions" class="bg-dark-3 rounded-2xl p-4">
      <h5 class="font-medium text-white mb-2">Payment Instructions</h5>
      <p class="text-gray-300 text-sm">{{ transaction.payment_instructions.instructions }}</p>
    </div>

    <!-- Action Buttons -->
    <div v-if="showActions" class="flex gap-3 mt-6">
      <button v-if="onRefresh" @click="onRefresh"
        class="flex-1 py-3 bg-brand text-black rounded-2xl font-semibold hover:bg-brand/90 transition-colors">
        <Icon icon="tabler:refresh" class="inline mr-2" width="20" height="20" />
        {{ refreshLabel || 'Check Payment Status' }}
      </button>
      <button v-if="onGoBack" @click="onGoBack"
        class="px-6 py-3 bg-dark-3 text-white rounded-2xl font-semibold hover:bg-dark hover:border-brand transition-colors border border-dark">
        <Icon icon="tabler:arrow-left" class="inline mr-2" width="20" height="20" />
        {{ backLabel || 'Back' }}
      </button>
    </div>

    <!-- Notes -->
    <div v-if="showNotes" class="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mt-6">
      <div class="flex items-start gap-3">
        <Icon icon="tabler:info-circle" class="text-blue-400 flex-shrink-0 mt-0.5" width="20" height="20" />
        <div>
          <h4 class="font-semibold text-blue-400 mb-2">Important Notes</h4>
          <ul class="text-blue-200 text-sm space-y-1">
            <li>• Payment confirmation is automatic</li>
            <li>• Your balance will be updated once payment is confirmed</li>
            <li>• Keep this page open until payment is completed</li>
            <li v-if="transaction.payment_instructions?.expiry_time">• Payment must be completed before expiry time</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { GSaltTransaction, PaymentMethod } from '~/types/gsalt_api';
import { usePaymentInstructions } from '~/composables/gsalt/usePaymentInstructions';
import { useGSaltToast } from '~/composables/gsalt/useGSaltToast';

interface Props {
  transaction: GSaltTransaction | null;
  subtitle?: string;
  showActions?: boolean;
  showNotes?: boolean;
  refreshLabel?: string;
  backLabel?: string;
  onRefresh?: () => void;
  onGoBack?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  showNotes: true,
});

// Define interfaces for instruction types
interface QRISInstructions {
  qr_code?: string;
  qr_code_url?: string;
  amount?: number;
  currency?: string;
  fee_amount?: number;
  total_amount?: number;
  expiry_time?: string;
}

interface VirtualAccountInstructions {
  bank_code?: string;
  account_number?: string;
  bank_name?: string;
  amount?: number;
  currency?: string;
  fee_amount?: number;
  total_amount?: number;
  expiry_time?: string;
}

interface EWalletInstructions {
  provider?: string;
  checkout_url?: string;
  qr_code?: string;
  deep_link?: string;
  amount?: number;
  currency?: string;
  fee_amount?: number;
  total_amount?: number;
  expiry_time?: string;
}

interface CardInstructions {
  checkout_url?: string;
  payment_form_url?: string;
  secure_form_url?: string;
  amount?: number;
  currency?: string;
  fee_amount?: number;
  total_amount?: number;
  expiry_time?: string;
}

interface RetailInstructions {
  outlet_name?: string;
  payment_code?: string;
  instructions?: string;
  locations?: string[];
  amount?: number;
  currency?: string;
  fee_amount?: number;
  total_amount?: number;
  expiry_time?: string;
}

const { showToastNotification } = useGSaltToast();
const {
  copyToClipboard,
  formatVirtualAccountNumber,
  formatExpiryTime,
  getQRISInstructions,
  getVirtualAccountInstructions,
  getEWalletInstructions,
  getCardInstructions,
  getRetailInstructions,
} = usePaymentInstructions();

// Computed properties for payment instructions
const qrisInstructions = computed((): QRISInstructions => {
  if (!props.transaction?.payment_instructions) return {};
  return getQRISInstructions(props.transaction.payment_instructions);
});

const virtualAccountInstructions = computed((): VirtualAccountInstructions => {
  if (!props.transaction?.payment_instructions) return {};
  return getVirtualAccountInstructions(props.transaction.payment_instructions);
});

const ewalletInstructions = computed((): EWalletInstructions => {
  if (!props.transaction?.payment_instructions) return {};
  return getEWalletInstructions(props.transaction.payment_instructions);
});

const cardInstructions = computed((): CardInstructions => {
  if (!props.transaction?.payment_instructions) return {};
  return getCardInstructions(props.transaction.payment_instructions);
});

const retailInstructions = computed((): RetailInstructions => {
  if (!props.transaction?.payment_instructions) return {};
  return getRetailInstructions(props.transaction.payment_instructions);
});

// Payment method type checking
const isQRISPayment = computed(() => {
  return props.transaction?.payment_method === 'QRIS';
});

const isVirtualAccountPayment = computed(() => {
  const method = props.transaction?.payment_method;
  return method?.startsWith('VA_') || method === 'VIRTUAL_ACCOUNT';
});

const isEWalletPayment = computed(() => {
  const method = props.transaction?.payment_method;
  return method?.startsWith('EWALLET_') || method === 'EWALLET';
});

const isCardPayment = computed(() => {
  const method = props.transaction?.payment_method;
  return method === 'CREDIT_CARD' || method === 'DEBIT_CARD' || method === 'CARD';
});

const isRetailPayment = computed(() => {
  const method = props.transaction?.payment_method;
  return method?.startsWith('RETAIL_') || method === 'RETAIL_OUTLET';
});

const getPaymentMethodIcon = (method?: PaymentMethod): string => {
  if (!method) return 'tabler:credit-card';
  if (method === 'QRIS') return 'tabler:qrcode';
  if (method?.startsWith('VA_') || method === 'VIRTUAL_ACCOUNT') return 'tabler:building-bank';
  if (method?.startsWith('EWALLET_') || method === 'EWALLET') return 'tabler:wallet';
  if (method === 'CREDIT_CARD' || method === 'DEBIT_CARD' || method === 'CARD') return 'tabler:credit-card';
  if (method?.startsWith('RETAIL_') || method === 'RETAIL_OUTLET') return 'tabler:building-store';
  if (method === 'DIRECT_DEBIT') return 'tabler:credit-card-off';
  if (method === 'BANK_TRANSFER') return 'tabler:building-bank';
  return 'tabler:credit-card';
};

const getPaymentMethodTitle = (method?: PaymentMethod): string => {
  if (!method) return 'Complete Payment';
  if (method === 'QRIS') return 'Scan QR Code to Pay';
  if (method?.startsWith('VA_')) return `Transfer to ${method.replace('VA_', '')} Virtual Account`;
  if (method === 'VIRTUAL_ACCOUNT') return 'Transfer to Virtual Account';
  if (method?.startsWith('EWALLET_')) return `Pay with ${method.replace('EWALLET_', '')}`;
  if (method === 'EWALLET') return 'Pay with E-Wallet';
  if (method === 'CREDIT_CARD') return 'Credit Card Payment';
  if (method === 'DEBIT_CARD') return 'Debit Card Payment';
  if (method === 'CARD') return 'Card Payment';
  if (method?.startsWith('RETAIL_')) return `Pay at ${method.replace('RETAIL_', '')}`;
  if (method === 'RETAIL_OUTLET') return 'Pay at Retail Outlet';
  if (method === 'DIRECT_DEBIT') return 'Direct Debit Payment';
  if (method === 'BANK_TRANSFER') return 'Bank Transfer';
  return 'Complete Payment';
};

const getPaymentMethodLabel = (method: string): string => {
  // Use the method as-is since the API should provide proper labels
  return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'text-yellow-400',
    processing: 'text-blue-400',
    completed: 'text-green-400',
    failed: 'text-red-400',
    cancelled: 'text-gray-400',
  };
  return colors[status] || 'text-gray-400';
};

const handleCopyText = async (text: string, description: string) => {
  const success = await copyToClipboard(text);
  if (success) {
    showToastNotification(`${description} copied to clipboard!`);
  } else {
    showToastNotification(`Failed to copy ${description}`, 'error');
  }
};
</script>