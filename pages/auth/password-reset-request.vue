<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Icon } from '@iconify/vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

definePageMeta({
  layout: 'auth'
});

// SEO Meta Tags
useSeoMeta({
  title: 'Reset Password - Koneksa',
  description: 'Reset your Koneksa account password. We will send you instructions to regain access to your account.',
  // Open Graph
  ogTitle: 'Reset Password - Koneksa',
  ogDescription: 'Reset your Koneksa account password. We will send you instructions to regain access to your account.',
  ogImage: '/images/koneksa_logotype.png',
  ogUrl: 'https://koneksa.id/auth/password-reset-request',
  ogType: 'website',
  // Twitter Card
  twitterCard: 'summary',
  twitterTitle: 'Reset Password - Koneksa',
  twitterDescription: 'Reset your Koneksa account password. We will send you instructions to regain access to your account.',
  twitterImage: '/images/koneksa_logotype.png',
  // Theme Color
  themeColor: '#DC4E0C', // Using brand color
}, { mode: 'server' });

const router = useRouter();
const authStore = useAuthStore();

// Form values
const email = ref('');

// Define validation schema
const validationSchema = toTypedSchema(z.object({
  email: z.string().email('Please enter a valid email').min(1, 'Email is required'),
}));

// Initialize form with vee-validate
const { handleSubmit, isSubmitting, errors } = useForm({
  validationSchema,
  initialValues: {
    email: ''
  }
});

const resetRequestSuccess = ref<boolean>(false);
const apiError = ref<string>('');

const onSubmit = handleSubmit(async (values) => {
  // Reset messages
  resetRequestSuccess.value = false;
  apiError.value = '';

  try {
    await authStore.requestPasswordReset(values.email);
    resetRequestSuccess.value = true;
  } catch (err: any) {
    apiError.value = err.message || 'Password reset request failed. Please try again.';
  }
});
</script>

<template>
  <div class="auth-container">
    <div>
      <div class="p-8 bg-dark-2 border border-dark rounded-3xl transition-all duration-300 hover:shadow-xl"
        v-auto-animate>
        <h2 class="text-2xl font-bold mb-8 text-center text-white">Reset Your Password</h2>

        <form @submit.prevent="onSubmit" class="space-y-6" v-auto-animate>
          <div v-if="apiError" class="p-4 rounded-3xl bg-red-900/30 border border-red-500 text-red-200 text-sm mb-4"
            v-auto-animate>
            {{ apiError }}
          </div>

          <div v-if="resetRequestSuccess"
            class="p-4 rounded-3xl bg-green-900/30 border border-green-500 text-green-200 text-sm mb-4" v-auto-animate>
            Password reset instructions have been sent to your email address.
          </div>

          <div>
            <p class="text-sm text-gray-300 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <InputField name="email" type="email" label="Email" icon="tabler:mail" autocomplete="email"
            placeholder="Enter your email" rules="required|email" v-model="email" />

          <div>
            <Button type="submit" :disabled="isSubmitting" bg="bg-brand" color="text-black" class="w-full">
              <template #icon>
                <Icon icon="tabler:mail-forward" width="24" height="24" />
              </template>
              <template #text>
                {{ isSubmitting ? 'Sending...' : 'Send Reset Link' }}
              </template>
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>