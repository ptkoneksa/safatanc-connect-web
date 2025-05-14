<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Icon } from '@iconify/vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

definePageMeta({
  layout: 'account'
});

// SEO Meta Tags
useHead({
  title: 'Create Account - Safatanc Connect',
  meta: [
    { name: 'description', content: 'Register for a Safatanc Connect account to access all Safatanc services in one place. Join our community today.' },
    // Open Graph
    { property: 'og:title', content: 'Create Account - Safatanc Connect' },
    { property: 'og:description', content: 'Register for a Safatanc Connect account to access all Safatanc services in one place. Join our community today.' },
    { property: 'og:image', content: '/images/stech_logo_gradient.png' },
    { property: 'og:url', content: 'https://connect.safatanc.com/auth/register' },
    { property: 'og:type', content: 'website' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Create Account - Safatanc Connect' },
    { name: 'twitter:description', content: 'Register for a Safatanc Connect account to access all Safatanc services in one place. Join our community today.' },
    { name: 'twitter:image', content: '/images/stech_logo_gradient.png' },
    // Theme Color
    { name: 'theme-color', content: '#ffbf00' } // Using brand color
  ],
}, { mode: 'server' });

const router = useRouter();
const authStore = useAuthStore();

// Form values
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

// Username pattern: 3-30 chars, only letters, numbers, underscores, hyphens
const usernamePattern = /^[a-zA-Z0-9_-]{3,30}$/;
// Password pattern: must have at least one uppercase letter
const passwordPattern = /^(?=.*[A-Z]).{6,}$/;

// Define validation schema
const validationSchema = toTypedSchema(z.object({
  name: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(usernamePattern, 'Username must contain only letters, numbers, underscores, or hyphens'),
  email: z.string()
    .email('Please enter a valid email')
    .min(1, 'Email is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(passwordPattern, 'Password must contain at least one uppercase letter'),
  confirmPassword: z.string()
    .min(1, 'Confirm password is required'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}));

// Initialize form with vee-validate
const { handleSubmit, isSubmitting, errors } = useForm({
  validationSchema,
  initialValues: {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  }
});

const registrationSuccess = ref<boolean>(false);
const apiError = ref<string>('');

const onSubmit = handleSubmit(async (values) => {
  registrationSuccess.value = false;
  apiError.value = '';

  try {
    await authStore.register({
      username: values.name,
      email: values.email,
      password: values.password
    });

    registrationSuccess.value = true;

    // Redirect to registration confirmation page after a short delay
    setTimeout(() => {
      router.push('/auth/registration-confirmation');
    }, 2000);
  } catch (err: any) {
    apiError.value = err.message || 'Registration failed. Please try again.';
  }
});
</script>

<template>
  <div class="p-8 bg-dark-2 border border-dark rounded-3xl transition-all duration-300 hover:shadow-xl">
    <h2 class="text-2xl font-bold mb-8 text-center text-white">Create an Account</h2>

    <form @submit.prevent="onSubmit" class="space-y-6">
      <transition name="fade">
        <div v-if="apiError"
          class="p-4 rounded-3xl bg-red-900/30 border border-red-500 text-red-200 text-sm mb-4 shake">
          {{ apiError }}
        </div>
      </transition>

      <transition name="fade">
        <div v-if="registrationSuccess"
          class="p-4 rounded-3xl bg-green-900/30 border border-green-500 text-green-200 text-sm mb-4">
          Registration successful! Redirecting to registration confirmation...
        </div>
      </transition>

      <div class="form-field">
        <InputField name="name" type="text" label="Username" icon="tabler:user" autocomplete="username"
          placeholder="3-30 chars: letters, numbers, _, -" rules="required" v-model="name" />
      </div>

      <div class="form-field">
        <InputField name="email" type="email" label="Email" icon="tabler:mail" autocomplete="email"
          placeholder="Enter your email" rules="required|email" v-model="email" />
      </div>

      <div class="form-field">
        <InputField name="password" type="password" label="Password" icon="tabler:lock" autocomplete="new-password"
          placeholder="Min 6 chars with 1 uppercase letter" rules="required|min:6" v-model="password" />
      </div>

      <div class="form-field">
        <InputField name="confirmPassword" type="password" label="Confirm Password" icon="tabler:lock-check"
          autocomplete="new-password" placeholder="Confirm your password" rules="required|confirmed:password"
          v-model="confirmPassword" />
      </div>

      <div>
        <Button type="submit" :disabled="isSubmitting" bg="bg-brand" color="text-black" class="w-full">
          <template #icon>
            <Icon icon="tabler:user-plus" width="20" height="20" />
          </template>
          <template #text>
            <span class="relative">
              <transition name="fade" mode="out-in">
                <span v-if="isSubmitting" key="loading">Registering...</span>
                <span v-else key="default">Register</span>
              </transition>
            </span>
          </template>
        </Button>
      </div>
    </form>
  </div>
</template>