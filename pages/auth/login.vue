<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Icon } from '@iconify/vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import type { OAuthProvider } from '~/types/api';

definePageMeta({
  layout: 'account'
});

// SEO Meta Tags
useHead({
  title: 'Login - Safatanc Connect',
  meta: [
    { name: 'description', content: 'Log in to Safatanc Connect to access your account. Seamless connectivity for all your Safatanc services.' },
    // Open Graph
    { property: 'og:title', content: 'Login to Safatanc Connect' },
    { property: 'og:description', content: 'Log in to Safatanc Connect to access your account. Seamless connectivity for all your Safatanc services.' },
    { property: 'og:image', content: '/images/stech_logo_gradient.png' },
    { property: 'og:url', content: 'https://connect.safatanc.com/auth/login' },
    { property: 'og:type', content: 'website' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Login to Safatanc Connect' },
    { name: 'twitter:description', content: 'Log in to Safatanc Connect to access your account. Seamless connectivity for all your Safatanc services.' },
    { name: 'twitter:image', content: '/images/stech_logo_gradient.png' },
    // Theme Color
    { name: 'theme-color', content: '#ffbf00' } // Using brand color
  ],
}, { mode: 'server' });

const router = useRouter();
const authStore = useAuthStore();

// Form values
const email = ref('');
const password = ref('');

// Define validation schema
const validationSchema = toTypedSchema(z.object({
  email: z.string().email('Please enter a valid email').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
}));

// Initialize form with vee-validate
const { handleSubmit, isSubmitting, errors } = useForm({
  validationSchema,
  initialValues: {
    email: '',
    password: ''
  }
});

const apiError = ref<string>('');
const loginSuccess = ref<boolean>(false);
const oauthLoading = ref<OAuthProvider | null>(null);

const onSubmit = handleSubmit(async (values) => {
  apiError.value = '';

  try {
    await authStore.login({
      email: values.email,
      password: values.password
    });

    loginSuccess.value = true;

    // Redirect to dashboard after a short delay for animation
    setTimeout(() => {
      router.push('/account');
    }, 800);
  } catch (err: any) {
    apiError.value = err.message || 'Login failed. Please check your credentials.';
  }
});

// Handle OAuth login
const loginWithOAuth = (provider: OAuthProvider) => {
  apiError.value = '';
  oauthLoading.value = provider;

  try {
    authStore.initiateOAuthLogin(provider);
  } catch (err: any) {
    oauthLoading.value = null;
    apiError.value = err.message || `Failed to initiate ${provider} login`;
  }
};
</script>

<template>
  <div class="p-8 bg-dark-2 border border-dark rounded-3xl transition-all duration-300 hover:shadow-xl">
    <h2 class="text-2xl font-bold mb-8 text-center text-white">Login</h2>

    <form @submit.prevent="onSubmit" class="space-y-6">
      <transition name="fade">
        <div v-if="apiError"
          class="p-4 rounded-3xl bg-red-900/30 border border-red-500 text-red-200 text-sm mb-4 shake">
          {{ apiError }}
        </div>
      </transition>

      <transition name="fade">
        <div v-if="loginSuccess"
          class="p-4 rounded-3xl bg-green-900/30 border border-green-500 text-green-200 text-sm mb-4">
          Login successful! Redirecting to your account...
        </div>
      </transition>

      <div class="form-field">
        <InputField name="email" type="email" label="Email" icon="tabler:mail" autocomplete="email"
          placeholder="Enter your email" rules="required|email" v-model="email" />
      </div>

      <div class="form-field">
        <InputField name="password" type="password" label="Password" icon="tabler:lock" autocomplete="current-password"
          placeholder="Enter your password" rules="required" v-model="password" />
        <div>
          <p class="text-sm text-white/70">
            Forgot your password?
            <NuxtLink to="/auth/password-reset-request" class="text-brand hover:text-opacity-80 transition-opacity">
              Reset it
            </NuxtLink>
          </p>
        </div>
      </div>

      <div>
        <Button type="submit" :disabled="isSubmitting" bg="bg-brand" color="text-black" class="w-full">
          <template #icon>
            <Icon icon="tabler:login" width="20" height="20" />
          </template>
          <template #text>
            <span class="relative">
              <transition name="fade" mode="out-in">
                <span v-if="isSubmitting" key="loading">Logging in...</span>
                <span v-else key="default">Login</span>
              </transition>
            </span>
          </template>
        </Button>
      </div>

      <!-- OAuth Buttons -->
      <div class="relative mt-8 mb-4">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-dark"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-dark-2 text-gray-400">Or continue with</span>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <!-- Google -->
        <button type="button" @click="loginWithOAuth('google')" :class="{
          'opacity-70': oauthLoading && oauthLoading !== 'google',
          'animate-pulse': oauthLoading === 'google'
        }"
          class="flex justify-center items-center py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-dark rounded-xl transition-all duration-300">
          <span v-if="oauthLoading === 'google'">
            <Icon icon="tabler:loader" class="text-red-500 animate-spin" width="24" height="24" />
          </span>
          <span v-else>
            <Icon icon="tabler:brand-google" class="text-red-500" width="24" height="24" />
          </span>
        </button>

        <!-- GitHub -->
        <button type="button" @click="loginWithOAuth('github')" :class="{
          'opacity-70': oauthLoading && oauthLoading !== 'github',
          'animate-pulse': oauthLoading === 'github'
        }"
          class="flex justify-center items-center py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-dark rounded-xl transition-all duration-300">
          <span v-if="oauthLoading === 'github'">
            <Icon icon="tabler:loader" class="text-white animate-spin" width="24" height="24" />
          </span>
          <span v-else>
            <Icon icon="tabler:brand-github" class="text-white" width="24" height="24" />
          </span>
        </button>

        <!-- Facebook -->
        <button type="button" @click="loginWithOAuth('facebook')" :class="{
          'opacity-70': oauthLoading && oauthLoading !== 'facebook',
          'animate-pulse': oauthLoading === 'facebook'
        }"
          class="flex justify-center items-center py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-dark rounded-xl transition-all duration-300">
          <span v-if="oauthLoading === 'facebook'">
            <Icon icon="tabler:loader" class="text-blue-500 animate-spin" width="24" height="24" />
          </span>
          <span v-else>
            <Icon icon="tabler:brand-facebook" class="text-blue-500" width="24" height="24" />
          </span>
        </button>
      </div>
    </form>
  </div>
</template>