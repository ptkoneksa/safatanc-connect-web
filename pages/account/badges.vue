<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useBadgeStore } from '~/stores/badge';
import { Icon } from '@iconify/vue';
import type { Badge } from '~/types/api';

definePageMeta({
  layout: 'account',
  middleware: 'auth'
});

// SEO Meta Tags
useHead({
  title: 'My Badges - Safatanc Connect',
  meta: [
    { name: 'description', content: 'View and manage your earned badges on Safatanc Connect.' },
    // Open Graph
    { property: 'og:title', content: 'My Badges - Safatanc Connect' },
    { property: 'og:description', content: 'View and manage your earned badges on Safatanc Connect.' },
    { property: 'og:image', content: '/images/stech_logo_gradient.png' },
    { property: 'og:url', content: 'https://connect.safatanc.com/account/badges' },
    { property: 'og:type', content: 'website' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'My Badges - Safatanc Connect' },
    { name: 'twitter:description', content: 'View and manage your earned badges on Safatanc Connect.' },
    { name: 'twitter:image', content: '/images/stech_logo_gradient.png' },
    // Theme Color
    { name: 'theme-color', content: '#ffbf00' } // Using brand color
  ],
}, { mode: 'server' });

const authStore = useAuthStore();
const badgeStore = useBadgeStore();
const currentUser = ref(authStore.getUser);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Badge details modal
const showBadgeDetails = ref(false);
const selectedBadge = ref<Badge | null>(null);

// Load badges on mounted
onMounted(async () => {
  if (!currentUser.value?.id) return;

  await badgeStore.fetchUserBadges(currentUser.value.id);
});

const openBadgeDetails = (badge: Badge) => {
  selectedBadge.value = badge;
  showBadgeDetails.value = true;
};

const closeBadgeDetails = () => {
  showBadgeDetails.value = false;
  setTimeout(() => {
    selectedBadge.value = null;
  }, 300); // Wait for animation to complete
};

// Computed properties
const userBadges = computed(() => {
  if (!currentUser.value?.id) return [];
  return badgeStore.getUserBadges(currentUser.value.id);
});

const isLoading = computed(() => badgeStore.isLoading);
const error = computed(() => badgeStore.getError);
</script>

<template>
  <div class="space-y-6">
    <div class="bg-dark-2 border border-dark rounded-3xl p-6">
      <h1 class="text-2xl font-bold text-white mb-6">My Badges</h1>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="p-4 rounded-3xl bg-red-900/30 border border-red-500 text-red-200 text-sm mb-4">
        {{ error }}
      </div>

      <!-- Empty state -->
      <div v-else-if="userBadges.length === 0" class="text-center py-8 text-gray-400">
        <Icon icon="tabler:award-off" class="mx-auto text-gray-600" width="48" height="48" />
        <p class="mt-4">You haven't earned any badges yet.</p>
      </div>

      <!-- Badges grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="badge in userBadges" :key="badge.id"
          class="p-4 bg-dark-3 border border-dark rounded-3xl transition-all duration-300 hover:border-brand cursor-pointer"
          @click="openBadgeDetails(badge)">
          <div class="flex flex-col items-center">
            <img :src="badge.image_url" :alt="badge.name" class="w-24 h-24 object-contain mb-4 rounded-lg" />
            <h3 class="text-lg font-medium text-white text-center">{{ badge.name }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Badge Details Modal -->
    <transition name="fade">
      <div v-if="showBadgeDetails" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="bg-dark-2 border border-dark rounded-3xl p-6 max-w-lg w-full">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-white">Badge Details</h2>
            <button @click="closeBadgeDetails" class="text-gray-400 hover:text-white transition-colors">
              <Icon icon="tabler:x" width="24" height="24" />
            </button>
          </div>

          <div v-if="selectedBadge" class="flex flex-col items-center mb-6">
            <img :src="selectedBadge.image_url" :alt="selectedBadge.name"
              class="w-32 h-32 object-contain mb-4 rounded-lg" />
            <h3 class="text-xl font-medium text-white text-center mb-2">{{ selectedBadge.name }}</h3>
            <p class="text-gray-300 text-center">{{ selectedBadge.description }}</p>
            <p class="text-gray-400 text-sm mt-4">Earned on: {{ new Date(selectedBadge.created_at).toLocaleDateString()
            }}</p>
          </div>

          <div class="flex justify-end">
            <button @click="closeBadgeDetails"
              class="px-4 py-2 bg-dark-3 text-white rounded-full hover:bg-dark-4 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>