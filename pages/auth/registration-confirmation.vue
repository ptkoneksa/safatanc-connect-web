<script setup lang="ts">
import { Icon } from '@iconify/vue';

definePageMeta({
  layout: 'auth'
});

// SEO Meta Tags
useHead({
  title: 'Registration Successful - Koneksa',
  meta: [
    { name: 'description', content: 'Thank you for registering with Koneksa. Please check your email to verify your account and complete the registration process.' },
    // Open Graph
    { property: 'og:title', content: 'Registration Successful - Koneksa' },
    { property: 'og:description', content: 'Thank you for registering with Koneksa. Please check your email to verify your account and complete the registration process.' },
    { property: 'og:image', content: '/images/koneksa_logotype.png' },
    { property: 'og:url', content: 'https://koneksa.id/auth/registration-confirmation' },
    { property: 'og:type', content: 'website' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Registration Successful - Koneksa' },
    { name: 'twitter:description', content: 'Thank you for registering with Koneksa. Please check your email to verify your account and complete the registration process.' },
    { name: 'twitter:image', content: '/images/koneksa_logotype.png' },
    // Theme Color
    { name: 'theme-color', content: '#DC4E0C' } // Using brand color
  ],
}, { mode: 'server' });

const router = useRouter();

const goToLogin = (): void => {
  router.push('/auth/login');
};
</script>

<template>
  <div class="p-8 bg-dark-2 border border-dark rounded-3xl transition-all duration-300 hover:shadow-xl">
    <div class="text-center mb-6">
      <div class="flex justify-center mb-4">
        <div class="rounded-full bg-green-500/20 p-4">
          <Icon icon="tabler:check" class="text-green-400 w-10 h-10" />
        </div>
      </div>
      <h2 class="text-2xl font-bold mb-2 text-white">Registration Successful!</h2>
      <p class="text-sm text-white/70 mb-6">Please check your email for verification instructions</p>
    </div>

    <div class="p-6 rounded-2xl bg-dark-3 mb-6 border border-dark">
      <h3 class="font-semibold text-white mb-2">What's Next?</h3>
      <ul class="space-y-3 text-sm text-white/70">
        <li class="flex items-start">
          <Icon icon="tabler:mail" class="text-brand mr-2 mt-0.5 flex-shrink-0" />
          <span>Check your inbox for a verification email from <span
              class="font-bold">connect@safatanc.com</span></span>
        </li>
        <li class="flex items-start">
          <Icon icon="tabler:click" class="text-brand mr-2 mt-0.5 flex-shrink-0" />
          <span>Click the verification link in the email to activate your account</span>
        </li>
        <li class="flex items-start">
          <Icon icon="tabler:login" class="text-brand mr-2 mt-0.5 flex-shrink-0" />
          <span>Once verified, you can log in to your account</span>
        </li>
      </ul>
    </div>

    <div class="text-center text-sm text-white/50 mb-6">
      <p>Didn't receive the email? Check your spam folder or try again later.</p>
    </div>

    <div>
      <Button @click="goToLogin" bg="bg-brand" color="text-black" class="w-full">
        <template #icon>
          <Icon icon="tabler:login" width="24" height="24" />
        </template>
        <template #text>
          Go to Login
        </template>
      </Button>
    </div>
  </div>
</template>