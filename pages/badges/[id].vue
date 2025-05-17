<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Icon } from '@iconify/vue';
import type { Badge, User, ApiResponse } from '~/types/api';

definePageMeta({
  layout: 'default',
  middleware: 'auth'
});

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const authStore = useAuthStore();

// Get badge ID from route params
const badgeId = route.params.id as string;

// API fetch for badge details
const { data, pending, error: fetchError, refresh } = useFetch<ApiResponse<Badge>>(
  () => `${config.public.apiBaseUrl}/badges/${badgeId}`,
  {
    key: () => `badge-${badgeId}`,
    server: false,
    onRequest({ options }) {
      options.timeout = 10000;
    },
    retry: 1,
  }
);

// Computed values
const badge = computed(() => data.value?.data || null);
const error = computed(() => {
  if (fetchError.value) return fetchError.value.message;
  if (data.value?.success === false) return data.value.message;
  if (!pending.value && !badge.value) return 'Badge not found';
  return null;
});

// Set page meta based on badge data
watchEffect(() => {
  if (badge.value) {
    useHead({
      title: `${badge.value.name} - Badges - Safatanc Connect`,
      meta: [
        { name: 'description', content: badge.value.description },
        // Open Graph
        { property: 'og:title', content: `${badge.value.name} - Badges - Safatanc Connect` },
        { property: 'og:description', content: badge.value.description },
        { property: 'og:image', content: badge.value.image_url },
        { property: 'og:type', content: 'website' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: `${badge.value.name} - Badges - Safatanc Connect` },
        { name: 'twitter:description', content: badge.value.description },
        { name: 'twitter:image', content: badge.value.image_url },
        // Theme Color
        { name: 'theme-color', content: '#ffbf00' } // Using brand color
      ],
    }, { mode: 'client' });
  }
});

// Progress for demo
const progress = ref(Math.floor(Math.random() * 100));
// Check if user has earned this badge (for demo)
const hasEarned = ref(Math.random() > 0.7);

// Format date for display
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

// Admin check
const isAdmin = computed(() => {
  const user = authStore.getUser;
  return user && user.global_role === 'ADMIN';
});

// Go back function
const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="py-6">
    <div class="container mx-auto px-4 md:px-8">
      <!-- Loading state -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-16">
        <div class="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center animate-pulse mb-4">
          <Icon icon="tabler:award" class="text-brand animate-spin" width="32" height="32" />
        </div>
        <p class="text-gray-400">Loading badge details...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="p-6 rounded-3xl bg-red-900/30 border border-red-500 text-center">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <Icon icon="tabler:alert-triangle" class="text-red-500" width="32" height="32" />
          </div>
        </div>
        <h3 class="text-xl font-semibold text-red-200 mb-2">Error Loading Badge</h3>
        <p class="text-red-200 mb-6">{{ error }}</p>
        <button @click="goBack"
          class="bg-dark-3 hover:bg-dark-4 text-white font-medium py-2 px-6 rounded-full transition-all duration-300 inline-flex items-center">
          <Icon icon="tabler:arrow-left" class="mr-2" />
          Go Back
        </button>
      </div>

      <div v-else-if="badge" class="space-y-6">
        <!-- Navigation & Actions -->
        <div class="flex items-center justify-between mb-4">
          <button @click="goBack" class="flex items-center text-gray-400 hover:text-white transition-colors">
            <Icon icon="tabler:arrow-left" class="mr-2" width="24" height="24" />
            <span>Back to Badges</span>
          </button>

          <div v-if="isAdmin" class="flex gap-2">
            <NuxtLink :to="`/admin/badges/${badge.id}/edit`"
              class="bg-dark-3 hover:bg-dark-4 text-brand font-medium py-2 px-4 rounded-full transition-all duration-300 inline-flex items-center">
              <Icon icon="tabler:edit" class="mr-2" width="18" height="18" />
              Edit Badge
            </NuxtLink>
          </div>
        </div>

        <!-- Badge details card -->
        <div
          class="bg-dark-2 border border-dark rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div class="relative h-40 bg-gradient-to-r from-brand/20 to-purple-600/20 flex items-end">
            <div class="absolute inset-0 bg-[url('/images/pattern-dots.png')] opacity-10"></div>
            <div class="absolute top-0 right-0 m-4">
              <div v-if="hasEarned"
                class="bg-green-500/20 border border-green-500 text-green-300 text-sm px-4 py-1 rounded-full flex items-center">
                <Icon icon="tabler:check" class="mr-1" width="16" height="16" />
                Earned
              </div>
              <div v-else
                class="bg-yellow-500/20 border border-yellow-500 text-yellow-300 text-sm px-4 py-1 rounded-full flex items-center">
                <Icon icon="tabler:lock" class="mr-1" width="16" height="16" />
                Not Earned
              </div>
            </div>
          </div>

          <div class="p-8 pt-0 -mt-16 flex flex-col md:flex-row gap-8">
            <!-- Badge image -->
            <div class="md:w-1/4 flex-shrink-0">
              <div
                class="w-32 h-32 md:w-48 md:h-48 mx-auto md:mx-0 rounded-2xl border-4 border-dark-2 overflow-hidden bg-dark-3 flex items-center justify-center p-4">
                <img :src="badge.image_url" :alt="badge.name" class="max-w-full max-h-full object-contain" />
              </div>
            </div>

            <!-- Badge info -->
            <div class="md:w-3/4">
              <h1 class="text-3xl font-bold text-white mb-2">{{ badge.name }}</h1>
              <p class="text-gray-300 text-lg mb-6">{{ badge.description }}</p>

              <div v-if="!hasEarned" class="mb-6">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-gray-400">Progress: {{ progress }}%</span>
                  <span class="text-sm text-brand">{{ progress }}/100</span>
                </div>
                <div class="h-2 w-full bg-dark-3 rounded-full overflow-hidden">
                  <div class="h-full bg-brand transition-all duration-500" :style="{ width: `${progress}%` }"></div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-dark-3 p-4 rounded-2xl">
                  <div class="text-sm text-gray-400 mb-1">Created</div>
                  <div class="text-white">{{ formatDate(badge.created_at) }}</div>
                </div>

                <div class="bg-dark-3 p-4 rounded-2xl">
                  <div class="text-sm text-gray-400 mb-1">Rarity</div>
                  <div class="text-white">Common</div>
                </div>
              </div>

              <div v-if="!hasEarned" class="mt-6">
                <button
                  class="bg-brand hover:bg-brand/90 text-black font-medium py-3 px-6 rounded-full transition-all duration-300 inline-flex items-center">
                  <Icon icon="tabler:info-circle" class="mr-2" width="24" height="24" />
                  How to Earn This Badge
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Users with this badge -->
        <div class="bg-dark-2 border border-dark rounded-3xl p-6 transition-all duration-300 hover:shadow-xl">
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center">
            <Icon icon="tabler:users" class="mr-2" width="24" height="24" />
            Users with this Badge
          </h2>

          <!-- Empty state -->
          <div class="text-center py-10 text-gray-400">
            <div class="w-20 h-20 rounded-full bg-dark-3 mx-auto flex items-center justify-center mb-4">
              <Icon icon="tabler:users" class="text-gray-600" width="40" height="40" />
            </div>
            <h3 class="text-xl font-medium text-white mb-2">No Users Yet</h3>
            <p class="text-gray-400 text-center max-w-md mx-auto">
              Be the first to earn this badge and join the leaderboard!
            </p>
          </div>

          <!-- TODO: Implement users list when API is available -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any needed styles here */
</style>