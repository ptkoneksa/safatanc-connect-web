<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useBadgeStore } from '~/stores/badge';
import { Icon } from '@iconify/vue';
import type { Badge, User } from '~/types/api';

definePageMeta({
  layout: 'account',
  middleware: 'auth'
});

const route = useRoute();
const authStore = useAuthStore();
const badgeStore = useBadgeStore();

// Get badge ID from route params
const badgeId = route.params.id as string;

// State
const loading = ref(true);
const error = ref<string | null>(null);
const badge = ref<Badge | null>(null);
const users = ref<User[]>([]);

// Load badge details and users with this badge
onMounted(async () => {
  try {
    // Fetch badge details
    await badgeStore.fetchBadge(badgeId);
    badge.value = badgeStore.getSelectedBadge;

    if (!badge.value) {
      error.value = 'Badge not found';
      return;
    }

    // Set page title and meta tags
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

    // TODO: Fetch users with this badge
    // This would be implemented when the API is available
    // For now, we'll just show placeholder data

  } catch (err: any) {
    error.value = err.message || 'Failed to load badge details';
  } finally {
    loading.value = false;
  }
});

// Computed properties
const isAdmin = computed(() => {
  const user = authStore.getUser;
  return user && user.global_role === 'ADMIN';
});
</script>

<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="p-4 rounded-3xl bg-red-900/30 border border-red-500 text-red-200 text-sm mb-4">
      {{ error }}
    </div>

    <template v-else-if="badge">
      <!-- Badge details -->
      <div class="bg-dark-2 border border-dark rounded-3xl p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <NuxtLink to="/account/badges" class="text-gray-400 hover:text-white mr-4">
              <Icon icon="tabler:arrow-left" width="24" height="24" />
            </NuxtLink>
            <h1 class="text-2xl font-bold text-white">Badge Details</h1>
          </div>

          <NuxtLink v-if="isAdmin" :to="`/admin/badges`" class="text-sm text-brand hover:text-opacity-80">
            Manage Badges
          </NuxtLink>
        </div>

        <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div class="flex-shrink-0">
            <img :src="badge.image_url" :alt="badge.name" class="w-40 h-40 object-contain rounded-lg" />
          </div>

          <div class="flex-grow">
            <h2 class="text-2xl font-bold text-white mb-2">{{ badge.name }}</h2>
            <p class="text-gray-300 mb-4">{{ badge.description }}</p>

            <div class="text-sm text-gray-400">
              <p>Created: {{ new Date(badge.created_at).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Users with this badge -->
      <div class="bg-dark-2 border border-dark rounded-3xl p-6">
        <h2 class="text-xl font-bold text-white mb-6">Users with this Badge</h2>

        <!-- Empty state -->
        <div class="text-center py-8 text-gray-400">
          <Icon icon="tabler:users" class="mx-auto text-gray-600" width="48" height="48" />
          <p class="mt-4">No users have earned this badge yet.</p>
        </div>

        <!-- TODO: Implement users list when API is available -->
      </div>
    </template>
  </div>
</template>