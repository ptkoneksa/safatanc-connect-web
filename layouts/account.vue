<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const isLoginPage = computed(() => route.path === '/auth/login');
const isRegisterPage = computed(() => route.path === '/auth/register');
const isPasswordResetPage = computed(() => route.path === '/auth/password-reset-request');

const showLogin = ref(isLoginPage.value);
const showRegister = ref(isRegisterPage.value);
const showPasswordReset = ref(isPasswordResetPage.value);

// Monitor route changes to update active state
watch(() => route.path, (newPath) => {
  showLogin.value = newPath === '/auth/login';
  showRegister.value = newPath === '/auth/register';
  showPasswordReset.value = newPath === '/auth/password-reset-request';
});
</script>

<template>
  <div class="min-h-screen bg-dark-1 grid grid-cols-1 md:grid-cols-3">
    <!-- Left panel - Brand panel (hidden on mobile) -->
    <div class="hidden md:block md:col-span-1 bg-brand relative overflow-hidden p-12">
      <div class="absolute inset-0 pattern-grid-white/[0.15] opacity-50"></div>

      <!-- Design elements -->
      <div class="absolute top-10 left-10 w-64 h-64 rounded-full bg-yellow-400 opacity-20 blur-3xl"></div>
      <div class="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-red-500 opacity-20 blur-3xl"></div>

      <!-- Empty container for SVG content -->
      <div class="relative z-10 w-full h-full flex items-center justify-center">
        <!-- SVG content will be added here -->
      </div>

      <div class="absolute bottom-6 left-0 right-0 text-center text-black text-sm">
        <p>
          &copy; {{ new Date().getFullYear() }} PT SAFATANC TECHNOLOGY DIGITAL
        </p>
        <p>
          All rights reserved.
        </p>
      </div>
    </div>

    <!-- Right panel - Auth forms -->
    <div class="col-span-1 md:col-span-2 flex items-center justify-center p-6 md:p-12 relative">
      <!-- Mobile logo -->
      <div class="md:hidden text-center mb-8 absolute top-8 left-0 right-0">
        <NuxtImg src="/images/stech_logo_gradient.png" alt="Safatanc" class="h-16 w-auto mx-auto mb-4" />
        <h1 class="gradient-text text-2xl">SAFATANC CONNECT</h1>
        <h3 class="text-sm text-white/80 mb-8">Together, Made Simple.</h3>
      </div>

      <!-- Auth form card -->
      <div class="w-full max-w-md mt-16 md:mt-0">
        <transition name="scale" mode="out-in">
          <div class="relative">
            <slot />
          </div>
        </transition>

        <!-- Quick links for authentication -->
        <div class="mt-8 text-center">
          <transition name="fade" mode="out-in">
            <div v-if="showLogin" key="login-links" class="space-y-4">
              <p class="text-sm text-white/70">
                Don't have an account?
                <NuxtLink to="/auth/register" class="text-brand hover:text-opacity-80 transition-opacity">
                  Register
                </NuxtLink>
              </p>
              <p class="text-sm text-white/70">
                Forgot your password?
                <NuxtLink to="/auth/password-reset-request" class="text-brand hover:text-opacity-80 transition-opacity">
                  Reset it
                </NuxtLink>
              </p>
            </div>

            <div v-else-if="showRegister" key="register-links">
              <p class="text-sm text-white/70">
                Already have an account?
                <NuxtLink to="/auth/login" class="text-brand hover:text-opacity-80 transition-opacity">
                  Log In
                </NuxtLink>
              </p>
            </div>

            <div v-else-if="showPasswordReset" key="reset-links">
              <p class="text-sm text-white/70">
                Remember your password?
                <NuxtLink to="/auth/login" class="text-brand hover:text-opacity-80 transition-opacity">
                  Back to Login
                </NuxtLink>
              </p>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>