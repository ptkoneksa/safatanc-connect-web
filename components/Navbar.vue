<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, onMounted } from 'vue';

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const scrollToSection = (sectionId: string) => {
  isMenuOpen.value = false;

  // Use a small timeout to ensure navigation works properly
  setTimeout(() => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
};
</script>

<template>
  <nav class="sticky top-0 z-50 bg-black/70 backdrop-blur-md">
    <div class="container mx-auto px-8 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center">
            <NuxtImg src="/images/stech_logo_gradient.png" alt="Safatanc"
              class="h-12 w-auto aspect-video object-cover hover:scale-105 transition-transform duration-300" />
          </NuxtLink>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-8">
          <NuxtLink @click="scrollToSection('home')" to="#home"
            class="text-white hover:text-brand transition-colors duration-200 cursor-pointer">Home</NuxtLink>
          <NuxtLink @click="scrollToSection('features')" to="#features"
            class="text-white hover:text-brand transition-colors duration-200 cursor-pointer">Features</NuxtLink>
          <NuxtLink @click="scrollToSection('about')" to="#about"
            class="text-white hover:text-brand transition-colors duration-200 cursor-pointer">GSalt</NuxtLink>
        </div>

        <!-- Auth Buttons -->
        <div class="hidden md:flex items-center gap-4">
          <NuxtLink to="/auth" class="text-white">
            <Button bg="bg-brand" color="text-black">
              <template #icon>
                <Icon icon="tabler:arrow-autofit-right-filled" width="24" height="24" />
              </template>
              <template #text>
                Sign In
              </template>
            </Button>
          </NuxtLink>
        </div>

        <!-- Mobile Menu Toggle -->
        <div class="md:hidden">
          <button @click="toggleMenu" class="text-white p-2">
            <Icon :icon="isMenuOpen ? 'tabler:x' : 'tabler:menu'" width="24" height="24" />
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isMenuOpen" class="md:hidden mt-4 py-4 border-t border-dark animate-slide-down">
        <div class="flex flex-col gap-4">
          <NuxtLink @click="scrollToSection('home')" to="#home"
            class="text-white hover:text-brand transition-colors duration-200 py-2 cursor-pointer">Home</NuxtLink>
          <NuxtLink @click="scrollToSection('features')" to="#features"
            class="text-white hover:text-brand transition-colors duration-200 py-2 cursor-pointer">Features</NuxtLink>
          <NuxtLink @click="scrollToSection('about')" to="#about"
            class="text-white hover:text-brand transition-colors duration-200 py-2 cursor-pointer">GSalt</NuxtLink>
          <NuxtLink to="/auth" class="text-white py-2">
            <Button bg="bg-brand" color="text-black">
              <template #icon>
                <Icon icon="tabler:arrow-autofit-right-filled" width="24" height="24" />
              </template>
              <template #text>
                Sign In
              </template>
            </Button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>