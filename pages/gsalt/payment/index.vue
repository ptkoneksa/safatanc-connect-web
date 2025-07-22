<script setup lang="ts">
import { Icon } from '@iconify/vue';

definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

useHead({
  title: 'GSalt Payment - Konek',
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
            <h1 class="text-3xl font-bold text-white">GSalt Payment</h1>
            <p class="text-gray-400">Pay for services using GSalt</p>
          </div>
        </div>
      </div>

      <!-- Coming Soon -->
      <div class="bg-dark-2 rounded-3xl p-8 border border-dark text-center">
        <div class="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
          <Icon icon="tabler:credit-card" class="text-purple-400" width="40" height="40" />
        </div>
        <h2 class="text-2xl font-bold text-white mb-4">Payment Feature Coming Soon</h2>
        <p class="text-gray-400 mb-6 max-w-md mx-auto">
          We're working on bringing you the ability to pay for various services using your GSalt balance.
          This feature will be available soon!
        </p>

        <div class="bg-dark-3 rounded-2xl p-4 mb-6">
          <h3 class="font-semibold text-white mb-3">What you'll be able to do:</h3>
          <ul class="text-gray-300 text-sm space-y-2 text-left max-w-sm mx-auto">
            <li class="flex items-center gap-2">
              <Icon icon="tabler:check" class="text-green-400 flex-shrink-0" width="16" height="16" />
              <span>Pay for Koneksa services</span>
            </li>
            <li class="flex items-center gap-2">
              <Icon icon="tabler:check" class="text-green-400 flex-shrink-0" width="16" height="16" />
              <span>Purchase digital products</span>
            </li>
            <li class="flex items-center gap-2">
              <Icon icon="tabler:check" class="text-green-400 flex-shrink-0" width="16" height="16" />
              <span>Subscribe to premium features</span>
            </li>
            <li class="flex items-center gap-2">
              <Icon icon="tabler:check" class="text-green-400 flex-shrink-0" width="16" height="16" />
              <span>Pay for third-party integrations</span>
            </li>
          </ul>
        </div>

        <NuxtLink to="/gsalt"
          class="inline-block px-6 py-3 bg-brand text-black rounded-2xl font-semibold hover:bg-brand/90 transition-colors duration-300">
          Back to GSalt Dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>