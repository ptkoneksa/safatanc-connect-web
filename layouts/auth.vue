<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const redirectUri = ref(route.query.redirect_uri);

const isLoginPage = computed(() => route.path.includes('/auth/login'));
const isRegisterPage = computed(() => route.path.includes('/auth/register'));
const isPasswordResetPage = computed(() => route.path.includes('/auth/password-reset-request'));

const showLogin = ref(isLoginPage.value);
const showRegister = ref(isRegisterPage.value);
const showPasswordReset = ref(isPasswordResetPage.value);

const loginPath = computed(() => '/auth/login' + (redirectUri.value ? '?redirect_uri=' + redirectUri.value : ''));
const registerPath = computed(() => '/auth/register' + (redirectUri.value ? '?redirect_uri=' + redirectUri.value : ''));
const passwordResetPath = computed(() => '/auth/password-reset-request');

// Monitor route changes to update active state
watch(() => route.path, (newPath) => {
  showLogin.value = newPath.includes('/auth/login');
  showRegister.value = newPath.includes('/auth/register');
  showPasswordReset.value = newPath.includes('/auth/password-reset-request');
});
</script>

<template>
  <div class="min-h-screen bg-dark-1 grid grid-cols-1 md:grid-cols-3">
    <!-- Left panel - Brand panel (hidden on mobile) -->
    <div class="hidden md:block md:col-span-1 bg-brand relative overflow-hidden p-12">
      <!-- Textured background pattern - larger and more prominent -->
      <div class="absolute inset-0 bg-brand"
        style="background-image: radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px); background-size: 20px 20px;">
      </div>

      <!-- More prominent decorative shapes -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-yellow-500/30 rounded-bl-full"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-red-600/30 rounded-tr-full"></div>

      <!-- Additional decorative elements -->
      <div class="absolute right-40 top-40 w-24 h-24 rounded-full border-4 border-white/20"></div>
      <div class="absolute left-20 bottom-60 w-16 h-16 bg-white/10 rotate-45"></div>

      <!-- Larger, more visible blob decorations -->
      <div class="absolute top-10 left-10 w-96 h-96 rounded-full bg-yellow-400 opacity-40 blur-3xl"></div>
      <div class="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-red-500 opacity-40 blur-3xl"></div>

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
                <NuxtLink :to="registerPath" class="text-brand hover:text-opacity-80 transition-opacity">
                  Register
                </NuxtLink>
              </p>
            </div>

            <div v-else-if="showRegister" key="register-links">
              <p class="text-sm text-white/70">
                Already have an account?
                <NuxtLink :to="loginPath" class="text-brand hover:text-opacity-80 transition-opacity">
                  Log In
                </NuxtLink>
              </p>
            </div>

            <div v-else-if="showPasswordReset" key="reset-links">
              <p class="text-sm text-white/70">
                Remember your password?
                <NuxtLink :to="loginPath" class="text-brand hover:text-opacity-80 transition-opacity">
                  Back to Login
                </NuxtLink>
              </p>
            </div>
          </transition>
        </div>
      </div>

      <!-- Certificate -->
      <div class="absolute bottom-0 left-0 w-full">
        <p class="text-white/70 text-center text-xs">Certified by</p>
        <div class="flex justify-center items-center mt-2">
          <NuxtLink to="https://komdigi.com" target="_blank">
            <NuxtImg src="/images/komdigi.png" alt="Komdigi" class="h-16 w-auto mx-auto mb-4" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>