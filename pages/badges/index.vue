<script setup lang="ts">
import { useBadgeStore } from '~/stores/badge';
import { Icon } from '@iconify/vue';
import type { Badge } from '~/types/api';

definePageMeta({
  layout: 'account',
});

// SEO Meta Tags
useHead({
  title: 'Badges - Safatanc Connect',
  meta: [
    { name: 'description', content: 'Explore available badges on Safatanc Connect.' },
    // Open Graph
    { property: 'og:title', content: 'Badges - Safatanc Connect' },
    { property: 'og:description', content: 'Explore available badges on Safatanc Connect.' },
    { property: 'og:image', content: '/images/stech_logo_gradient.png' },
    { property: 'og:url', content: 'https://connect.safatanc.com/badges' },
    { property: 'og:type', content: 'website' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Badges - Safatanc Connect' },
    { name: 'twitter:description', content: 'Explore available badges on Safatanc Connect.' },
    { name: 'twitter:image', content: '/images/stech_logo_gradient.png' },
    // Theme Color
    { name: 'theme-color', content: '#ffbf00' } // Using brand color
  ],
}, { mode: 'server' });

const router = useRouter();
const badgeStore = useBadgeStore();

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(12);

// Load badges on mounted
onMounted(async () => {
  await badgeStore.fetchBadges(currentPage.value, itemsPerPage.value);
});

const viewBadgeDetails = (badge: Badge) => {
  router.push(`/badges/${badge.id}`);
};

// Computed properties
const badges = computed(() => badgeStore.getBadges);
const isLoading = computed(() => badgeStore.isLoading);
const error = computed(() => badgeStore.getError);
</script>

<template>
  <div class="space-y-6">
    <div class="bg-dark-2 border border-dark rounded-3xl p-6">
      <h1 class="text-2xl font-bold text-white mb-6">Badges</h1>
      <p class="text-gray-300 mb-8">Explore badges that you can earn on Safatanc Connect.</p>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="p-4 rounded-3xl bg-red-900/30 border border-red-500 text-red-200 text-sm mb-4">
        {{ error }}
      </div>

      <!-- Empty state -->
      <div v-else-if="badges.length === 0" class="text-center py-8 text-gray-400">
        <Icon icon="tabler:award-off" class="mx-auto text-gray-600" width="48" height="48" />
        <p class="mt-4">No badges found.</p>
      </div>

      <!-- Badges grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="badge in badges" :key="badge.id"
          class="p-4 bg-dark-3 border border-dark rounded-3xl transition-all duration-300 hover:border-brand cursor-pointer"
          @click="viewBadgeDetails(badge)">
          <div class="flex flex-col items-center">
            <img :src="badge.image_url" :alt="badge.name" class="w-24 h-24 object-contain mb-4 rounded-lg" />
            <h3 class="text-lg font-medium text-white text-center">{{ badge.name }}</h3>
            <p class="text-sm text-gray-400 text-center mt-2 line-clamp-2">{{ badge.description }}</p>
          </div>
        </div>
      </div>

      <!-- Pagination controls -->
      <!-- TODO: Implement pagination when needed -->
    </div>
  </div>
</template>