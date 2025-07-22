<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { Badge, ApiResponse, PaginatedResponse } from '~/types/api';

definePageMeta({
  layout: 'default',
});

// SEO Meta Tags
useHead({
  title: 'Badges - Konek',
  meta: [
    { name: 'description', content: 'Explore available badges on Konek.' },
    // Open Graph
    { property: 'og:title', content: 'Badges - Konek' },
    { property: 'og:description', content: 'Explore available badges on Konek.' },
    { property: 'og:image', content: '/images/koneksa_logotype.png' },
    { property: 'og:url', content: 'https://connect.safatanc.com/badges' },
    { property: 'og:type', content: 'website' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Badges - Konek' },
    { name: 'twitter:description', content: 'Explore available badges on Konek.' },
    { name: 'twitter:image', content: '/images/koneksa_logotype.png' },
    // Theme Color
    { name: 'theme-color', content: '#ffbf00' } // Using brand color
  ],
}, { mode: 'server' });

const router = useRouter();
const config = useRuntimeConfig();

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(12);

// API fetch
const { data, pending, error: fetchError, refresh } = useFetch<ApiResponse<PaginatedResponse<Badge>>>(
  () => `${config.public.apiBaseUrl}/badges?page=${currentPage.value}&limit=${itemsPerPage.value}`,
  {
    key: () => `badges-${currentPage.value}-${itemsPerPage.value}`,
    server: false,
    onRequest({ options }) {
      options.timeout = 10000;
    },
    retry: 1,
  }
);

// Computed values
const badges = computed(() => data.value?.data?.data || []);
const error = computed(() => fetchError.value?.message || (data.value?.success === false ? data.value?.message : null));
const totalPages = computed(() => Math.ceil((badges.value.length || 0) / itemsPerPage.value));

// Search functionality
const searchQuery = ref('');
const filteredBadges = computed(() => {
  if (!searchQuery.value.trim()) return badges.value;

  const query = searchQuery.value.toLowerCase().trim();
  return badges.value.filter(badge =>
    badge.name.toLowerCase().includes(query) ||
    badge.description.toLowerCase().includes(query)
  );
});

const viewBadgeDetails = (badge: Badge) => {
  router.push(`/badges/${badge.id}`);
};

// Pagination controls
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};
</script>

<template>
  <div class="py-6">
    <div class="container mx-auto px-4 md:px-8">
      <!-- Header with search -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2 gradient-text">Explore Badges</h1>
          <p class="text-gray-300">Discover and earn Konek badges to showcase your achievements.</p>
        </div>

        <div class="relative w-full md:w-64">
          <input type="text" v-model="searchQuery" placeholder="Search badges..."
            class="w-full bg-dark-3 border border-dark rounded-full px-4 py-2 pl-10 text-white focus:outline-none focus:border-brand transition-colors" />
          <Icon icon="tabler:search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20"
            height="20" />
        </div>
      </div>

      <!-- Main content -->
      <div class="bg-dark-2 border border-dark rounded-3xl p-6 transition-all duration-300 hover:shadow-xl">
        <!-- Client-only wrapper to prevent hydration issues -->
        <ClientOnly>
          <!-- Loading state -->
          <div v-if="pending" class="flex flex-col items-center justify-center py-12">
            <div class="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center animate-pulse mb-4">
              <Icon icon="tabler:award" class="text-brand animate-spin" width="32" height="32" />
            </div>
            <p class="text-gray-400">Loading badges...</p>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="p-6 rounded-3xl bg-red-900/30 border border-red-500 text-center">
            <div class="flex justify-center mb-4">
              <div class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <Icon icon="tabler:alert-triangle" class="text-red-500" width="32" height="32" />
              </div>
            </div>
            <h3 class="text-xl font-semibold text-red-200 mb-2">Error Loading Badges</h3>
            <p class="text-red-200 mb-6">{{ error }}</p>
            <button @click="() => refresh()"
              class="bg-dark-3 hover:bg-dark-4 text-white font-medium py-2 px-6 rounded-full transition-all duration-300 inline-flex items-center">
              <Icon icon="tabler:refresh" class="mr-2" width="24" height="24" />
              Try Again
            </button>
          </div>

          <!-- Content -->
          <template v-else>
            <!-- Empty state with no badges -->
            <div v-if="badges.length === 0" class="flex flex-col items-center justify-center py-16">
              <div class="w-20 h-20 rounded-full bg-dark-3 flex items-center justify-center mb-4">
                <Icon icon="tabler:award-off" class="text-gray-600" width="40" height="40" />
              </div>
              <h3 class="text-xl font-medium text-white mb-2">No Badges Found</h3>
              <p class="text-gray-400 text-center max-w-md">
                There are no badges available at the moment. Check back later for new additions.
              </p>
            </div>

            <!-- Empty search results -->
            <div v-else-if="filteredBadges.length === 0" class="flex flex-col items-center justify-center py-16">
              <div class="w-20 h-20 rounded-full bg-dark-3 flex items-center justify-center mb-4">
                <Icon icon="tabler:search-off" class="text-gray-600" width="40" height="40" />
              </div>
              <h3 class="text-xl font-medium text-white mb-2">No Matches Found</h3>
              <p class="text-gray-400 text-center max-w-md">
                No badges match your search criteria. Try adjusting your search terms.
              </p>
              <button @click="searchQuery = ''"
                class="mt-4 px-4 py-2 bg-dark-3 hover:bg-dark-4 text-gray-300 rounded-full transition-colors flex items-center gap-2">
                <Icon icon="tabler:x" width="16" height="16" />
                Clear Search
              </button>
            </div>

            <!-- Badges grid -->
            <div v-else>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div v-for="badge in filteredBadges" :key="badge.id" @click="viewBadgeDetails(badge)"
                  class="bg-dark-3 border border-dark rounded-3xl overflow-hidden transition-all duration-300 hover:border-brand hover:shadow-lg hover:scale-[1.02] cursor-pointer group">
                  <div
                    class="aspect-square overflow-hidden bg-gradient-to-br from-dark-4 to-dark-2 flex items-center justify-center p-6">
                    <img :src="badge.image_url" :alt="badge.name"
                      class="w-32 h-32 object-contain transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div class="p-5">
                    <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-brand transition-colors">{{
                      badge.name }}</h3>
                    <p class="text-gray-400 text-sm line-clamp-2">{{ badge.description }}</p>
                  </div>
                </div>
              </div>

              <!-- Pagination controls -->
              <div v-if="totalPages > 1" class="flex justify-center mt-8 gap-2">
                <button @click="prevPage" :disabled="currentPage <= 1" :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  currentPage <= 1 ? 'bg-dark-3 text-gray-600 cursor-not-allowed' : 'bg-dark-3 text-white hover:bg-brand hover:text-dark'
                ]">
                  <Icon icon="tabler:chevron-left" width="24" height="24" />
                </button>

                <div class="px-4 py-2 bg-dark-3 rounded-full text-white">
                  Page {{ currentPage }} of {{ totalPages }}
                </div>

                <button @click="nextPage" :disabled="currentPage >= totalPages" :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  currentPage >= totalPages ? 'bg-dark-3 text-gray-600 cursor-not-allowed' : 'bg-dark-3 text-white hover:bg-brand hover:text-dark'
                ]">
                  <Icon icon="tabler:chevron-right" width="24" height="24" />
                </button>
              </div>
            </div>
          </template>

          <!-- Fallback while client-side rendering -->
          <template #fallback>
            <div class="flex flex-col items-center justify-center py-12">
              <div class="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center animate-pulse mb-4">
                <Icon icon="tabler:award" class="text-brand animate-spin" width="32" height="32" />
              </div>
              <p class="text-gray-400">Loading badges...</p>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gradient-text {
  background: linear-gradient(135deg, #ffbf00, #ff8300);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}
</style>