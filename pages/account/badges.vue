<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Icon } from '@iconify/vue';
import type { Badge, User, ApiResponse } from '~/types/api';

definePageMeta({
  layout: 'default',
  middleware: 'auth'
});

// SEO Meta Tags
useHead({
  title: 'My Badges - Koneksa',
  meta: [
    { name: 'description', content: 'View and manage your earned badges on Koneksa.' },
    // Open Graph
    { property: 'og:title', content: 'My Badges - Koneksa' },
    { property: 'og:description', content: 'View and manage your earned badges on Koneksa.' },
    { property: 'og:image', content: '/images/koneksa_logotype.png' },
    { property: 'og:url', content: 'https://koneksa.id/account/badges' },
    { property: 'og:type', content: 'website' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'My Badges - Koneksa' },
    { name: 'twitter:description', content: 'View and manage your earned badges on Koneksa.' },
    { name: 'twitter:image', content: '/images/koneksa_logotype.png' },
    // Theme Color
    { name: 'theme-color', content: '#DC4E0C' } // Using brand color
  ],
}, { mode: 'server' });

const authStore = useAuthStore();
const config = useRuntimeConfig();
const currentUser = computed(() => authStore.getUser);

// Badge details modal
const showBadgeDetails = ref(false);
const selectedBadge = ref<Badge | null>(null);

// Fetch user badges directly if user is logged in
const userBadgeData = useState<Badge[]>('userBadges', () => []);
const isPending = ref(false);
const fetchError = ref<string | null>(null);

// Function to fetch user badges
const fetchUserBadges = async () => {
  if (!currentUser.value?.id) return;

  isPending.value = true;
  fetchError.value = null;

  try {
    const { data } = await useFetch<ApiResponse<{ user: User; badges: Badge[] }>>(
      `${config.public.apiBaseUrl}/badges/users/${currentUser.value.id}`,
      {
        key: `user-badges-${currentUser.value.id}`,
        server: false,
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        onRequest({ options }) {
          options.timeout = 10000;
        },
        retry: 1,
      }
    );

    if (!data.value) {
      throw new Error('Failed to fetch user badges');
    }

    if (!data.value.success) {
      throw new Error(data.value.message || 'Failed to fetch user badges');
    }

    userBadgeData.value = data.value.data?.badges || [];
  } catch (err: any) {
    console.error('Error fetching user badges:', err);
    fetchError.value = err.message || 'Failed to fetch user badges';
  } finally {
    isPending.value = false;
  }
};

// Load badges when component is mounted and user is available
onMounted(() => {
  if (currentUser.value?.id) {
    fetchUserBadges();
  }
});

// Watch for user changes to reload badges
watch(() => currentUser.value?.id, (newId) => {
  if (newId) {
    fetchUserBadges();
  } else {
    userBadgeData.value = [];
  }
});

// For template references
const userBadges = computed(() => userBadgeData.value);
const pending = isPending;
const error = fetchError;

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
</script>

<template>
  <div class="space-y-6">
    <div class="bg-dark-2 border border-dark rounded-3xl p-6">
      <h1 class="text-2xl font-bold text-white mb-6">My Badges</h1>

      <!-- Loading state -->
      <div v-if="pending" class="flex justify-center py-8">
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