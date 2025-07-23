<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Icon } from '@iconify/vue';
import type { ApiResponse, User } from '~/types/api';

definePageMeta({
  layout: "default",
  middleware: 'auth'
});

// SEO Meta Tags
useHead({
  title: 'Edit Profile - Koneksa',
  meta: [
    { name: 'description', content: 'Update your profile information on Koneksa.' },
  ],
});

const config = useRuntimeConfig();
const authStore = useAuthStore();
const user = computed(() => authStore.getUser);

// Create our own toast system since there's no built-in one
const toast = {
  success: (message: string) => {
    // Implementation will depend on the actual toast system used in the project
    console.log('Success:', message);
    // Could use a third-party library or custom event bus
  },
  error: (message: string) => {
    // Implementation will depend on the actual toast system used in the project
    console.error('Error:', message);
    // Could use a third-party library or custom event bus
  }
};

// Form data
const formData = reactive({
  username: user.value?.username || '',
  full_name: user.value?.full_name || '',
  email: user.value?.email || '',
  avatar_url: user.value?.avatar_url || '',
});

// Form status
const isSubmitting = ref(false);
const errors = reactive({
  username: '',
  full_name: '',
  email: '',
  avatar_url: '',
  general: '',
});

// Form validation
const validateForm = () => {
  let isValid = true;

  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });

  // Validate username
  if (!formData.username || formData.username.trim() === '') {
    errors.username = 'Username is required';
    isValid = false;
  } else if (formData.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
    isValid = false;
  }

  // Validate email
  if (!formData.email || formData.email.trim() === '') {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  // Validate avatar URL (optional)
  if (formData.avatar_url && !/^(https?:\/\/)/i.test(formData.avatar_url)) {
    errors.avatar_url = 'Avatar URL must start with http:// or https://';
    isValid = false;
  }

  return isValid;
};

// Update profile function
const updateProfile = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  errors.general = '';

  try {
    const { data, error } = await useFetch<ApiResponse<User>>(
      `${config.public.apiBaseUrl}/users/profile`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`
        },
        body: formData
      }
    );

    if (error.value) {
      errors.general = error.value.message || 'Failed to update profile';
      toast.error('Failed to update profile');
      return;
    }

    if (data.value?.success && data.value?.data) {
      // Update user in store
      authStore.setUser(data.value.data);
      toast.success('Profile updated successfully');
    } else {
      errors.general = data.value?.message || 'Failed to update profile';
      toast.error(errors.general);
    }
  } catch (err: any) {
    errors.general = err.message || 'An unexpected error occurred';
    toast.error(errors.general);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <!-- Page container with proper spacing for default layout -->
  <div class="container mx-auto px-8 py-12">
    <div class="max-w-5xl mx-auto">
      <!-- Page header -->
      <div class="mb-12" v-auto-animate>
        <h1 class="text-3xl font-bold mb-4 text-white">
          Edit Profile
        </h1>
        <div class="h-1 w-24 bg-brand rounded-full mb-8"></div>

        <!-- Breadcrumb -->
        <div class="flex items-center text-sm text-gray-400 mb-6">
          <NuxtLink to="/account" class="hover:text-brand transition-colors duration-200">Account</NuxtLink>
          <Icon icon="tabler:chevron-right" class="mx-2 w-4 h-4" />
          <span class="text-white">Edit Profile</span>
        </div>

        <!-- User Info Box -->
        <div v-if="user"
          class="bg-dark-2 rounded-3xl p-8 border border-dark hover:shadow-xl transition-all duration-300 mb-8"
          v-auto-animate>
          <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div class="relative">
              <img v-if="formData.avatar_url" :src="formData.avatar_url" alt="Profile avatar"
                class="w-20 h-20 rounded-full object-cover border-2 border-brand" @error="formData.avatar_url = ''" />
              <div v-else
                class="w-20 h-20 rounded-full bg-dark-3 flex items-center justify-center border border-brand/30">
                <Icon icon="tabler:user" class="text-brand w-10 h-10" />
              </div>
            </div>
            <div>
              <h2 class="text-2xl text-brand mb-2">{{ user.name || user.username || 'User Profile' }}</h2>
              <p class="text-gray-300">{{ user.email || 'Update your personal information' }}</p>
              <p v-if="user && !user.is_email_verified" class="text-yellow-500 text-sm flex items-center gap-2 mt-2">
                <Icon icon="tabler:alert-triangle" class="w-4 h-4" />
                Email not verified
                <button type="button" class="text-brand hover:underline text-xs">Resend verification</button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile form -->
      <div class="mb-8" v-auto-animate>
        <h2 class="text-xl font-bold mb-6 text-white">Personal Information</h2>
        <div class="bg-dark-2 rounded-3xl p-8 border border-dark" v-auto-animate>
          <form @submit.prevent="updateProfile" class="space-y-6">
            <!-- General error message -->
            <div v-if="errors.general" class="bg-red-900/30 border border-red-500 text-red-200 p-6 rounded-3xl mb-6">
              <div class="flex items-center gap-4">
                <Icon icon="tabler:alert-circle" class="text-red-300 w-8 h-8" />
                <p>{{ errors.general }}</p>
              </div>
            </div>

            <!-- Username -->
            <div class="space-y-2">
              <label for="username" class="block text-sm font-medium text-gray-300">
                Username <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon icon="tabler:at" class="text-gray-400 w-5 h-5" />
                </div>
                <input id="username" v-model="formData.username" type="text"
                  class="w-full pl-10 pr-4 py-3 bg-dark-3 border border-dark-4 focus:border-brand focus:ring-1 focus:ring-brand rounded-xl text-white"
                  :class="{ 'border-red-500': errors.username }" placeholder="Enter username" />
              </div>
              <p v-if="errors.username" class="text-red-500 text-sm mt-1">{{ errors.username }}</p>
            </div>

            <!-- Full Name -->
            <div class="space-y-2">
              <label for="full_name" class="block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon icon="tabler:user" class="text-gray-400 w-5 h-5" />
                </div>
                <input id="full_name" v-model="formData.full_name" type="text"
                  class="w-full pl-10 pr-4 py-3 bg-dark-3 border border-dark-4 focus:border-brand focus:ring-1 focus:ring-brand rounded-xl text-white"
                  :class="{ 'border-red-500': errors.full_name }" placeholder="Enter your full name" />
              </div>
              <p v-if="errors.full_name" class="text-red-500 text-sm mt-1">{{ errors.full_name }}</p>
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-gray-300">
                Email <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon icon="tabler:mail" class="text-gray-400 w-5 h-5" />
                </div>
                <input id="email" v-model="formData.email" type="email"
                  class="w-full pl-10 pr-4 py-3 bg-dark-3 border border-dark-4 focus:border-brand focus:ring-1 focus:ring-brand rounded-xl text-white"
                  :class="{ 'border-red-500': errors.email }" placeholder="Enter your email address" />
              </div>
              <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
            </div>

            <!-- Avatar URL -->
            <div class="space-y-2">
              <label for="avatar_url" class="block text-sm font-medium text-gray-300">
                Avatar URL
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon icon="tabler:photo" class="text-gray-400 w-5 h-5" />
                </div>
                <input id="avatar_url" v-model="formData.avatar_url" type="url"
                  class="w-full pl-10 pr-4 py-3 bg-dark-3 border border-dark-4 focus:border-brand focus:ring-1 focus:ring-brand rounded-xl text-white"
                  :class="{ 'border-red-500': errors.avatar_url }" placeholder="https://example.com/avatar.jpg" />
              </div>
              <p v-if="errors.avatar_url" class="text-red-500 text-sm mt-1">{{ errors.avatar_url }}</p>
              <p class="text-gray-400 text-xs mt-1">Enter a URL for your profile picture</p>
            </div>

            <!-- Submit button -->
            <div class="pt-6">
              <button type="submit"
                class="w-full bg-brand hover:bg-brand/90 text-black font-semibold py-3 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center"
                :disabled="isSubmitting">
                <div v-if="isSubmitting"
                  class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                <Icon v-else icon="tabler:check" class="mr-2 w-5 h-5" />
                {{ isSubmitting ? 'Updating...' : 'Update Profile' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Account actions -->
      <div class="mb-8" v-auto-animate>
        <h2 class="text-xl font-bold mb-6 text-white">Danger Zone</h2>
        <div class="bg-dark-2 rounded-3xl p-8 border border-dark" v-auto-animate>
          <div class="space-y-6">
            <div
              class="flex flex-col sm:flex-row items-center justify-between p-4 bg-red-900/20 rounded-xl border border-red-800/30">
              <div class="flex items-center gap-4 mb-4 sm:mb-0">
                <div class="bg-red-900/30 rounded-full p-3">
                  <Icon icon="tabler:trash" class="text-red-400 w-5 h-5" />
                </div>
                <div>
                  <h3 class="text-white font-medium">Delete Account</h3>
                  <p class="text-gray-400 text-sm">Permanently delete your account and all data</p>
                </div>
              </div>
              <button type="button"
                class="py-2 px-4 bg-red-900/30 hover:bg-red-900/50 border border-red-800/30 text-red-300 rounded-lg transition-colors duration-300">
                Delete Account
              </button>
            </div>

            <div
              class="flex flex-col sm:flex-row items-center justify-between p-4 bg-dark-3 rounded-xl border border-dark-4">
              <div class="flex items-center gap-4 mb-4 sm:mb-0">
                <div class="bg-dark-4 rounded-full p-3">
                  <Icon icon="tabler:download" class="text-gray-400 w-5 h-5" />
                </div>
                <div>
                  <h3 class="text-white font-medium">Request All Data</h3>
                  <p class="text-gray-400 text-sm">Download a copy of all your personal data</p>
                </div>
              </div>
              <button type="button"
                class="py-2 px-4 bg-dark-4 hover:bg-dark-3 border border-dark text-gray-300 rounded-lg transition-colors duration-300">
                Request Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>