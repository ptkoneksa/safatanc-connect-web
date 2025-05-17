<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Icon } from '@iconify/vue';
import type { ApiResponse, Badge } from '~/types/api';

definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

// SEO Meta Tags
useHead({
  title: 'Account Dashboard - Safatanc Connect',
  meta: [
    { name: 'description', content: 'Manage your Safatanc Connect account, view activity, and access all Safatanc services from your personalized dashboard.' },
    // Open Graph
    { property: 'og:title', content: 'Account Dashboard - Safatanc Connect' },
    { property: 'og:description', content: 'Manage your Safatanc Connect account, view activity, and access all Safatanc services from your personalized dashboard.' },
    { property: 'og:image', content: '/images/stech_logo_gradient.png' },
    { property: 'og:url', content: 'https://connect.safatanc.com/account' },
    { property: 'og:type', content: 'website' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Account Dashboard - Safatanc Connect' },
    { name: 'twitter:description', content: 'Manage your Safatanc Connect account, view activity, and access all Safatanc services from your personalized dashboard.' },
    { name: 'twitter:image', content: '/images/stech_logo_gradient.png' },
    // Theme Color
    { name: 'theme-color', content: '#ffbf00' } // Using brand color
  ],
}, { mode: 'server' });

const config = useRuntimeConfig();
const authStore = useAuthStore();
const user = computed(() => authStore.getUser);

const { data: userBadges, error: userBadgesError, pending: isLoadingBadges } = useFetch<ApiResponse<Badge[]>>(
  `${config.public.apiBaseUrl}/badges/users/${user.value?.id}`,
  {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authStore.token}`,
      'Content-Type': 'application/json'
    },
  }
);

// Sample dashboard stats for demo
const stats = ref([
  { id: 1, name: 'Profile Completion', value: '75%', icon: 'tabler:user-check' },
  { id: 2, name: 'Projects', value: '3', icon: 'tabler:folder' },
  { id: 3, name: 'Connections', value: '12', icon: 'tabler:users' },
  { id: 4, name: 'Last Login', value: 'Today', icon: 'tabler:calendar' },
]);

// Sample recent activities
const activities = ref([
  { id: 1, title: 'Profile Updated', date: '2 hours ago', icon: 'tabler:edit' },
  { id: 2, title: 'New Project Created', date: 'Yesterday', icon: 'tabler:plus' },
  { id: 3, title: 'Joined Community Forum', date: '3 days ago', icon: 'tabler:users' },
]);
</script>

<template>
  <div class="container mx-auto px-8 py-12">
    <div class="max-w-5xl mx-auto">
      <!-- Welcome header -->
      <div class="mb-12" v-auto-animate>
        <h1 class="text-3xl font-bold mb-4 text-white">
          Account Dashboard
        </h1>
        <div class="h-1 w-24 bg-brand rounded-full mb-8"></div>

        <div v-if="user"
          class="bg-dark-2 rounded-3xl p-8 border border-dark hover:shadow-xl transition-all duration-300"
          v-auto-animate>
          <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div class="bg-dark-3 rounded-full p-4 border border-brand/30">
              <Icon icon="tabler:user" class="text-brand w-12 h-12" />
            </div>
            <div>
              <h2 class="text-2xl text-brand mb-2">Welcome, {{ user.name || user.username || 'User' }}!</h2>
              <p class="text-gray-300">{{ user.email || 'Your account dashboard' }}</p>

              <!-- User Badges Display -->
              <div class="mt-3">
                <div v-if="isLoadingBadges" class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded-full border-2 border-brand border-t-transparent animate-spin"></div>
                  <span class="text-gray-400 text-sm">Loading badges...</span>
                </div>
                <div v-if="userBadges?.data">
                  <div v-if="userBadges?.data.length > 0" class="flex items-center gap-2">
                    <div class="flex -space-x-2 overflow-hidden">
                      <img v-for="badge in userBadges.data.slice(0, 5)" :key="badge.id" :src="badge.image_url"
                        :alt="badge.name"
                        class="inline-block h-8 w-8 rounded-lg object-cover border border-dark-3 ring-1 ring-brand/20"
                        :title="badge.name" />
                    </div>
                    <span v-if="userBadges.data.length > 5"
                      class="text-brand text-sm bg-dark-3 rounded-full px-2 py-0.5">
                      +{{ userBadges.data.length - 5 }} more
                    </span>
                    <NuxtLink to="/account/badges" class="text-brand text-sm hover:underline ml-2">
                      View all
                    </NuxtLink>
                  </div>
                </div>
                <div v-else class="text-gray-400 text-sm flex items-center gap-2">
                  <Icon icon="tabler:award" class="w-4 h-4" />
                  <span>No badges earned yet</span>
                  <NuxtLink to="/badges" class="text-brand text-sm hover:underline ml-1">
                    Browse badges
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="bg-red-900/30 border border-red-500 text-red-200 p-6 rounded-3xl" v-auto-animate>
          <div class="flex items-center gap-4">
            <Icon icon="tabler:alert-circle" class="text-red-300 w-8 h-8" />
            <p>Please log in to view your account information.</p>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="mb-12" v-auto-animate>
        <h2 class="text-xl font-bold mb-6 text-white">Your Account Stats</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" v-auto-animate>
          <div v-for="stat in stats" :key="stat.id"
            class="bg-dark-2 rounded-3xl p-6 border border-dark hover:border-brand/30 transition-all duration-300 hover:shadow-lg">
            <div class="flex items-center gap-4">
              <div class="bg-dark-3 rounded-full p-3">
                <Icon :icon="stat.icon" class="text-brand w-6 h-6" />
              </div>
              <div>
                <div class="text-gray-400 text-sm">{{ stat.name }}</div>
                <div class="text-white text-xl font-semibold">{{ stat.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="mb-8" v-auto-animate>
        <h2 class="text-xl font-bold mb-6 text-white">Recent Activity</h2>
        <div class="bg-dark-2 rounded-3xl p-6 border border-dark" v-auto-animate>
          <div v-for="activity in activities" :key="activity.id"
            class="flex items-center gap-4 py-4 border-b border-dark last:border-0">
            <div class="bg-dark-3 rounded-full p-3">
              <Icon :icon="activity.icon" class="text-brand w-5 h-5" />
            </div>
            <div class="flex-grow">
              <div class="text-white">{{ activity.title }}</div>
              <div class="text-gray-400 text-sm">{{ activity.date }}</div>
            </div>
            <Icon icon="tabler:chevron-right" class="text-gray-400 w-5 h-5" />
          </div>
        </div>
      </div>

      <!-- Dashboard under construction notice -->
      <div class="mt-12 bg-dark-2 rounded-3xl p-6 border border-brand/20 text-center" v-auto-animate>
        <Icon icon="tabler:tools" class="text-brand w-12 h-12 mx-auto mb-4" />
        <h3 class="text-lg text-white mb-2">Dashboard Under Construction</h3>
        <p class="text-gray-400 max-w-md mx-auto">
          We're working on adding more features to your account dashboard. Stay tuned for updates!
        </p>
      </div>
    </div>
  </div>
</template>