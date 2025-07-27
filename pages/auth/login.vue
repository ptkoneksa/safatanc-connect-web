<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Icon } from '@iconify/vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import type { OAuthProvider } from '~/types/api';
import { useAuthApi } from '~/composables/useAuthApi';

definePageMeta({
  layout: 'auth'
});

// SEO Meta Tags
useSeoMeta({
  title: 'Login - Koneksa',
  description: 'Log in to Koneksa to access your account. Seamless connectivity for all your Koneksa services.',
  // Open Graph
  ogTitle: 'Login to Koneksa',
  ogDescription: 'Log in to Koneksa to access your account. Seamless connectivity for all your Koneksa services.',
  ogImage: '/images/koneksa_logotype.png',
  ogUrl: 'https://koneksa.id/auth/login',
  ogType: 'website',
  // Twitter Card
  twitterCard: 'summary',
  twitterTitle: 'Login to Koneksa',
  twitterDescription: 'Log in to Koneksa to access your account. Seamless connectivity for all your Koneksa services.',
  twitterImage: '/images/koneksa_logotype.png',
  // Theme Color
  themeColor: '#DC4E0C', // Using brand color
}, { mode: 'server' });

const route = useRoute();
const authStore = useAuthStore();
const { login, initiateOAuthLogin } = useAuthApi();

// Check for redirect_uri and close_on_success in query parameters
const redirectUri = route.query.redirect_uri ? String(route.query.redirect_uri) : undefined;

const showLogin = ref(!authStore.isAuthenticated);
const showEmailForm = ref(false);

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
    const response = await login({
      email: values.email,
      password: values.password
    });

    loginSuccess.value = response.success;

    // Redirect to dashboard or specified redirect URI after a short delay
    setTimeout(() => {
      if (redirectUri && response.data) {
        const redirectUriWithToken = new URL(redirectUri);
        redirectUriWithToken.searchParams.set('token', response.data.token);
        redirectUriWithToken.searchParams.set('refresh_token', response.data.refresh_token);

        navigateTo(redirectUriWithToken, { external: true });
      } else {
        navigateTo('/account');
      }
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
    initiateOAuthLogin(provider, redirectUri);
  } catch (err: any) {
    oauthLoading.value = null;
    apiError.value = err.message || `Failed to initiate ${provider} login`;
  }
};

const handleContinue = async () => {
  if (redirectUri) {
    const redirectUriWithToken = new URL(redirectUri);
    redirectUriWithToken.searchParams.set('token', authStore.token || '');
    redirectUriWithToken.searchParams.set('refresh_token', authStore.refresh_token || '');

    await navigateTo(redirectUriWithToken.toString(), { external: true });
  } else {
    await navigateTo('/account');
  }
};
</script>

<template>
  <div class="auth-container">
    <div>
      <NuxtImg src="/images/koneksa_logotype.png" alt="Koneksa" class="mx-auto h-16 mb-8" />
      <div v-if="!showLogin"
        class="p-8 bg-dark-2 border border-dark rounded-3xl transition-all duration-300 hover:shadow-xl">
        <h2 class="text-center text-white">Confirmation</h2>
        <div class="flex justify-center items-center gap-2 my-5">
          <Icon icon="tabler:user-circle" class="text-white" width="64" height="64" />
          <div>
            <h3 class="text-white">{{ authStore.user?.full_name }}</h3>
            <p class="text-white/70">{{ authStore.user?.email }}</p>
          </div>
        </div>
        <h4 class="text-center text-white">You are already logged in, do you want to login with another account or
          continue with this account?</h4>
        <div class="mt-5">
          <Button bg="bg-white/5 hover:bg-white/10" color="text-white" class="w-full" @click="showLogin = true">
            <template #icon>
              <Icon icon="tabler:logout" width="24" height="24" />
            </template>
            <template #text>
              <p class="text-xs md:text-base">Login with another account</p>
            </template>
          </Button>
          <Button bg="bg-brand" color="text-black" class="w-full mt-5" @click="handleContinue">
            <template #icon>
              <Icon icon="tabler:arrow-right" width="24" height="24" />
            </template>
            <template #text>
              <p class="text-xs md:text-base">Continue with this account</p>
            </template>
          </Button>
        </div>
      </div>
      <div v-else="showLogin"
        class="p-8 bg-dark-2 border border-dark rounded-3xl transition-all duration-300 hover:shadow-xl">
        <h2 class="text-2xl font-bold text-center text-white mt-5">Login</h2>

        <!-- OAuth Buttons -->
        <div v-if="!showEmailForm" class="space-y-4 mt-8">
          <!-- Google -->
          <Button bg="bg-white/5 hover:bg-white/10" color="text-white" class="w-full" @click="loginWithOAuth('google')">
            <template #icon>
              <Icon v-if="oauthLoading === 'google'" icon="tabler:loader" class="text-white animate-spin" width="24"
                height="24" />
              <Icon v-else icon="tabler:brand-google-filled" class="text-white" width="24" height="24" />
            </template>
            <template #text>
              <p v-if="oauthLoading === 'google'"></p>
              <p v-else>Google</p>
            </template>
          </Button>

          <!-- GitHub -->
          <Button bg="bg-white/5 hover:bg-white/10" color="text-white" class="w-full" @click="loginWithOAuth('github')">
            <template #icon>
              <Icon v-if="oauthLoading === 'github'" icon="tabler:loader" class="text-white animate-spin" width="24"
                height="24" />
              <Icon v-else icon="tabler:brand-github" class="text-white" width="24" height="24" />
            </template>
            <template #text>
              <p v-if="oauthLoading === 'github'"></p>
              <p v-else>GitHub</p>
            </template>
          </Button>
        </div>

        <!-- Switcher -->
        <div class="relative mt-8 mb-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-dark"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-dark-2 text-gray-400">Or continue with</span>
          </div>
        </div>
        <Button v-if="!showEmailForm" bg="bg-white/5 hover:bg-white/10" color="text-white" class="w-full"
          @click="showEmailForm = !showEmailForm">
          <template #icon>
            <Icon icon="tabler:mail" width="24" height="24" />
          </template>
          <template #text>
            <p>Email / Password</p>
          </template>
        </Button>
        <Button v-else bg="bg-white/5 hover:bg-white/10" color="text-white" class="w-full"
          @click="showEmailForm = !showEmailForm">
          <template #icon>
            <Icon icon="tabler:brand-google-filled" width="24" height="24" />
          </template>
          <template #text>
            <p>Google / GitHub</p>
          </template>
        </Button>

        <!-- Email/Password Form -->
        <form v-if="showEmailForm" @submit.prevent="onSubmit" class="space-y-6 mt-5">
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
            <InputField name="password" type="password" label="Password" icon="tabler:lock"
              autocomplete="current-password" placeholder="Enter your password" rules="required" v-model="password" />
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
                <Icon icon="tabler:login" width="24" height="24" />
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
        </form>
      </div>
      <div class="mt-5">
        <p v-if="redirectUri" class="text-center text-white/70 text-xs italic">
          You will be redirected to <NuxtLink :to="redirectUri" target="_blank" class="text-brand">{{ redirectUri }}
          </NuxtLink> after
          login
        </p>
      </div>
    </div>
  </div>
</template>