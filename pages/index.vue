<script setup>
import { Icon } from '@iconify/vue';

definePageMeta({
  layout: 'default'
});
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- Hero Section -->
    <div class="relative container mx-auto px-8 py-16 md:py-24" id="home">
      <div class="pt-20 -mt-20"></div>
      <!-- Background elements -->
      <div class="absolute inset-0 -z-10">
        <div class="absolute top-1/3 left-10 w-64 h-64 rounded-full bg-brand opacity-10 blur-3xl"></div>
        <div class="absolute bottom-1/4 right-5 w-80 h-80 rounded-full bg-accent opacity-10 blur-3xl"></div>
      </div>

      <div class="grid md:grid-cols-2 gap-12 items-center">
        <!-- Hero Content -->
        <div class="md:pr-8 text-center md:text-left space-y-6">
          <h1 class="gradient-text">SAFATANC CONNECT</h1>
          <h3 class="mt-2 mb-8">Together, Made Simple.</h3>
          <p class="max-w-lg">The central hub for all Safatanc Group users. Manage your unified account,
            access all Safatanc services, and control your GSalt balance in one place.</p>

          <div class="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
            <NuxtLink to="/auth">
              <Button bg="bg-brand" color="text-black">
                <template #text>Sign In</template>
              </Button>
            </NuxtLink>
            <NuxtLink to="/auth">
              <Button bg="bg-transparent border border-white" color="text-white">
                <template #text>Create Account</template>
              </Button>
            </NuxtLink>
          </div>
        </div>

        <!-- Hero Visual -->
        <div class="relative hidden md:block">
          <!-- Decorative elements -->
          <div class="absolute right-24 w-48 h-48 rounded-full bg-brand/30 blur-md animate-pulse-slow"></div>
          <div class="absolute -bottom-4 left-24 w-16 h-16 rounded-full bg-accent/30 blur-md animate-bounce-slow"></div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="container mx-auto px-8 py-16 border-t border-dark-3" id="features">
      <div class="pt-20 -mt-20"></div>
      <h2 class="text-center mb-16">Core Features of <span class="gradient-text">SAFATANC CONNECT</span></h2>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div
          class="p-6 bg-dark-2 border border-dark rounded-3xl transition-all duration-300 hover:border-brand hover:scale-[1.02]">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center">
              <Icon icon="tabler:users" class="text-brand" width="32" height="32" />
            </div>
          </div>
          <h3 class="text-center mb-2">Account Management</h3>
          <p class="text-gray-400 text-center">Manage your Safatanc Group account profile, privacy settings, and
            connected
            services in one place.</p>
        </div>

        <!-- Feature 2 -->
        <div
          class="p-6 bg-dark-2 border border-dark rounded-3xl transition-all duration-300 hover:border-brand hover:scale-[1.02]">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center">
              <Icon icon="tabler:login" class="text-brand" width="32" height="32" />
            </div>
          </div>
          <h3 class="text-center mb-2">Single Sign-On (SSO)</h3>
          <p class="text-gray-400 text-center">One account to access all Safatanc Group services and platforms with
            enhanced
            security.</p>
        </div>

        <!-- Feature 3 -->
        <div
          class="p-6 bg-dark-2 border border-dark rounded-3xl transition-all duration-300 hover:border-brand hover:scale-[1.02]">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center">
              <Icon icon="tabler:coin" class="text-brand" width="32" height="32" />
            </div>
          </div>
          <h3 class="text-center mb-2">GSalt</h3>
          <p class="text-gray-400 text-center">Global Safatanc Loyalty Token - Check your balance, top-up, and manage
            your
            loyalty rewards.</p>
        </div>
      </div>
    </div>

    <!-- GSalt Section -->
    <div class="container mx-auto px-8 py-16 border-t border-dark-3" id="about">
      <div class="pt-20 -mt-20"></div>
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div class="order-2 md:order-1">
          <div class="p-6 bg-dark-2 border border-dark rounded-3xl transition-all duration-300 shadow-xl">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center">
                <Icon icon="tabler:coin" class="text-brand" width="24" height="24" />
              </div>
              <h3 class="font-bold">GSalt Platform</h3>
            </div>
            <div class="space-y-2">
              <div
                class="px-8 py-5 rounded-3xl bg-dark-3 border border-dark hover:border-brand transition duration-300">
                <p class="text-sm text-gray-300">Balance Management</p>
              </div>
              <div
                class="px-8 py-5 rounded-3xl bg-dark-3 border border-dark hover:border-brand transition duration-300">
                <p class="text-sm text-gray-300">Top-up Points</p>
              </div>
              <div
                class="px-8 py-5 rounded-3xl bg-dark-3 border border-dark hover:border-brand transition duration-300">
                <p class="text-sm text-gray-300">Payment Gateway</p>
              </div>
              <div
                class="px-8 py-5 rounded-3xl bg-dark-3 border border-dark hover:border-brand transition duration-300">
                <p class="text-sm text-gray-300">Transaction History</p>
              </div>
            </div>
          </div>
        </div>

        <div class="order-1 md:order-2 md:pl-8 text-center md:text-left">
          <h2 class="gradient-text mb-6">Global Safatanc Loyalty Token</h2>
          <p class="mb-6">GSalt is Safatanc Group's loyalty program and payment system. Check your
            balance,
            top-up points, and use GSalt tokens as a convenient payment method across Safatanc services.</p>
          <p class="mb-6"><em>Note: GSalt will have its own dedicated platform for expanded features and
              services.</em></p>
          <NuxtLink to="/gsalt">
            <Button bg="bg-brand" color="text-black">
              <template #icon>
                <Icon icon="tabler:wallet" width="24" height="24" />
              </template>
              <template #text>
                Manage GSalt
              </template>
            </Button>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="container mx-auto px-8 py-16" id="cta">
      <div class="pt-20 -mt-20"></div>
      <div class="relative p-8 md:p-12 rounded-3xl bg-dark-2 border border-dark overflow-hidden">
        <!-- Background elements -->
        <div class="absolute inset-0 -z-10">
          <div class="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-brand opacity-10 blur-2xl"></div>
          <div class="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-accent opacity-10 blur-2xl"></div>
        </div>

        <div class="text-center max-w-2xl mx-auto">
          <h2 class="mb-4">Ready to Connect?</h2>
          <p class="text-gray-400 mb-8">Manage your Safatanc accounts, access all services, and enjoy a seamless
            experience.
          </p>
          <NuxtLink to="/auth">
            <Button bg="bg-brand" color="text-black">
              <template #icon>
                <Icon icon="tabler:arrow-right" width="24" height="24" />
              </template>
              <template #text>
                Sign In Now
              </template>
            </Button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-bounce-slow {
  animation: bounce 5s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}
</style>