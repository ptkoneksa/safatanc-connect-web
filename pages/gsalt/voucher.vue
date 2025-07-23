<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useGSaltApi } from '~/composables/gsalt/useGSaltApi';
import { useGSaltToast } from '~/composables/gsalt/useGSaltToast';

definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

useHead({
  title: 'Redeem Voucher - Koneksa',
});

// Composables
const { redeemVoucher } = useGSaltApi();
const { showToast, toastMessage, toastType, showToastNotification, hideToast } = useGSaltToast();

// State
const isLoading = ref(false);
const voucherCode = ref('');

const handleSubmit = async () => {
  if (!voucherCode.value.trim()) {
    showToastNotification('Please enter a voucher code', 'error');
    return;
  }

  try {
    isLoading.value = true;

    const result = await redeemVoucher(voucherCode.value.trim());
    showToastNotification(`Voucher redeemed successfully! You received ${result.transaction.amount_gsalt_units / 100} GSALT`);

    // Reset form
    voucherCode.value = '';

    // Redirect back to main GSalt page after success
    setTimeout(() => {
      navigateTo('/gsalt');
    }, 3000);

  } catch (error: any) {
    showToastNotification(error.message || 'Failed to redeem voucher', 'error');
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
            <h1 class="text-3xl font-bold text-white">Redeem Voucher</h1>
            <p class="text-gray-400">Enter your voucher code to claim GSalt</p>
          </div>
        </div>
      </div>

      <!-- Voucher Form -->
      <div class="bg-dark-2 rounded-3xl p-6 border border-dark">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center">
            <Icon icon="tabler:ticket" class="text-brand" width="24" height="24" />
          </div>
          <h3 class="text-xl font-semibold text-white">Enter Voucher Code</h3>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Voucher Code</label>
            <input v-model="voucherCode" type="text" required
              class="w-full px-4 py-3 bg-dark-3 border border-dark rounded-2xl text-white focus:border-brand focus:bg-dark-2 transition-colors text-center text-lg font-mono tracking-wider"
              placeholder="Enter your voucher code" style="text-transform: uppercase;"
              @input="voucherCode = voucherCode.toUpperCase()">
            <p class="text-gray-400 text-sm mt-2">
              Voucher codes are case-insensitive and will be automatically formatted.
            </p>
          </div>

          <div class="bg-dark-3 rounded-2xl p-4">
            <h4 class="font-semibold text-white mb-2">How to redeem vouchers:</h4>
            <ul class="text-gray-300 text-sm space-y-2">
              <li class="flex items-start gap-2">
                <Icon icon="tabler:check" class="text-green-400 flex-shrink-0 mt-0.5" width="16" height="16" />
                <span>Enter the voucher code exactly as provided</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon icon="tabler:check" class="text-green-400 flex-shrink-0 mt-0.5" width="16" height="16" />
                <span>Each voucher can only be used once</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon icon="tabler:check" class="text-green-400 flex-shrink-0 mt-0.5" width="16" height="16" />
                <span>GSalt will be added to your account immediately</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon icon="tabler:check" class="text-green-400 flex-shrink-0 mt-0.5" width="16" height="16" />
                <span>Check your transaction history for confirmation</span>
              </li>
            </ul>
          </div>

          <div class="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
            <div class="flex items-start gap-3">
              <Icon icon="tabler:info-circle" class="text-blue-400 flex-shrink-0 mt-0.5" width="20" height="20" />
              <div>
                <h4 class="font-semibold text-blue-400 mb-1">Where to find vouchers?</h4>
                <p class="text-blue-200 text-sm">
                  Voucher codes are distributed through Koneksa promotions, events, partnerships,
                  and special campaigns. Follow our social media for the latest voucher opportunities!
                </p>
              </div>
            </div>
          </div>

          <button type="submit" :disabled="isLoading || !voucherCode.trim()"
            class="w-full py-3 bg-brand text-black rounded-2xl font-semibold hover:bg-brand/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <Icon v-if="isLoading" icon="tabler:loader" class="animate-spin mr-2" width="20" height="20" />
            {{ isLoading ? 'Redeeming...' : 'Redeem Voucher' }}
          </button>

          <div class="text-center">
            <NuxtLink to="/gsalt" class="text-gray-400 hover:text-white text-sm transition-colors">
              Cancel and go back
            </NuxtLink>
          </div>
        </form>
      </div>

      <!-- Recent Vouchers Section -->
      <div class="mt-8 bg-dark-2 rounded-3xl p-6 border border-dark">
        <h3 class="text-lg font-semibold text-white mb-4">Don't have a voucher?</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-dark-3 rounded-2xl p-4">
            <div class="flex items-center gap-3 mb-3">
              <Icon icon="tabler:brand-twitter" class="text-blue-400" width="20" height="20" />
              <span class="font-medium text-white">Follow on Twitter</span>
            </div>
            <p class="text-gray-400 text-sm mb-3">
              Get exclusive voucher codes from our Twitter announcements and giveaways.
            </p>
            <a href="https://twitter.com/safatanc" target="_blank"
              class="inline-block px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
              Follow @safatanc
            </a>
          </div>

          <div class="bg-dark-3 rounded-2xl p-4">
            <div class="flex items-center gap-3 mb-3">
              <Icon icon="tabler:calendar-event" class="text-purple-400" width="20" height="20" />
              <span class="font-medium text-white">Join Events</span>
            </div>
            <p class="text-gray-400 text-sm mb-3">
              Participate in Koneksa events and competitions to earn voucher rewards.
            </p>
            <NuxtLink to="/events"
              class="inline-block px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-colors">
              View Events
            </NuxtLink>
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