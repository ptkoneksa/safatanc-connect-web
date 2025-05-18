<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Icon } from '@iconify/vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import type { OAuthProvider } from '~/types/api';

definePageMeta({
  layout: 'auth'
});

// SEO Meta Tags
useSeoMeta({
  title: 'Login - Safatanc Connect',
  description: 'Log in to Safatanc Connect to access your account. Seamless connectivity for all your Safatanc services.',
  // Open Graph
  ogTitle: 'Login to Safatanc Connect',
  ogDescription: 'Log in to Safatanc Connect to access your account. Seamless connectivity for all your Safatanc services.',
  ogImage: '/images/stech_logo_gradient.png',
  ogUrl: 'https://connect.safatanc.com/auth/login',
  ogType: 'website',
  // Twitter Card
  twitterCard: 'summary',
  twitterTitle: 'Login to Safatanc Connect',
  twitterDescription: 'Log in to Safatanc Connect to access your account. Seamless connectivity for all your Safatanc services.',
  twitterImage: '/images/stech_logo_gradient.png',
  // Theme Color
  themeColor: '#ffbf00', // Using brand color
}, { mode: 'server' });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Check for redirect_uri in query parameters
const redirectUri = route.query.redirect_uri ? String(route.query.redirect_uri) : undefined;

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

    // Redirect to dashboard or specified redirect URI after a short delay
    setTimeout(() => {
      if (redirectUri) {
        navigateTo(redirectUri, { external: true });
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
    authStore.initiateOAuthLogin(provider, redirectUri);
  } catch (err: any) {
    oauthLoading.value = null;
    apiError.value = err.message || `Failed to initiate ${provider} login`;
  }
};
</script>

<template>
  <div class="auth-container">
    <div>
      <div class="p-8 bg-dark-2 border border-dark rounded-3xl transition-all duration-300 hover:shadow-xl">
        <h2 class="text-2xl font-bold text-center text-white">Login</h2>

        <form @submit.prevent="onSubmit" class="space-y-6 mt-8">
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
        <!-- OAuth Buttons -->
        <div class="relative mt-8 mb-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-dark"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-dark-2 text-gray-400">Or continue with</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
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