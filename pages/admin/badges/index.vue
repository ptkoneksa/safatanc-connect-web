<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Icon } from '@iconify/vue';
import type { Badge, ApiResponse, PaginatedResponse } from '~/types/api';

definePageMeta({
  layout: 'auth',
  middleware: 'admin'
});

// SEO Meta Tags
useHead({
  title: 'Manage Badges - Admin - Konek',
  meta: [
    { name: 'description', content: 'Admin panel for managing badges on Konek.' },
    // Theme Color
    { name: 'theme-color', content: '#DC4E0C' } // Using brand color
  ],
}, { mode: 'server' });

const authStore = useAuthStore();
const config = useRuntimeConfig();

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Fetch badges data
const { data: badgesData, pending: isLoading, error: fetchError, refresh } = useFetch<ApiResponse<PaginatedResponse<Badge>>>(
  () => `${config.public.apiBaseUrl}/badges?page=${currentPage.value}&limit=${itemsPerPage.value}`,
  {
    key: () => `admin-badges-${currentPage.value}-${itemsPerPage.value}`,
    server: false,
    onRequest({ options }) {
      options.timeout = 10000;
    },
    retry: 1,
  }
);

// Computed values
const badges = computed(() => badgesData.value?.data?.data || []);
const error = computed(() => fetchError.value?.message || (badgesData.value?.success === false ? badgesData.value?.message : null));

// Badge form
const showBadgeForm = ref(false);
const isEditMode = ref(false);
const formLoading = ref(false);
const badgeForm = reactive({
  id: '',
  name: '',
  description: '',
  image_url: '',
});

// Create badge API
const { execute: executeCreate } = useFetch<ApiResponse<Badge>>(
  `${config.public.apiBaseUrl}/badges`,
  {
    immediate: false,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authStore.token}`,
      'Content-Type': 'application/json'
    },
    body: {
      name: badgeForm.name,
      description: badgeForm.description,
      image_url: badgeForm.image_url
    }
  }
);

// Update badge API
const { execute: executeUpdate } = useFetch<ApiResponse<Badge>>(
  `${config.public.apiBaseUrl}/badges/${badgeForm.id}`,
  {
    immediate: false,
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${authStore.token}`,
      'Content-Type': 'application/json'
    },
    body: {
      name: badgeForm.name,
      description: badgeForm.description,
      image_url: badgeForm.image_url
    }
  }
);

// Delete badge API with parameter badgeId
const badgeId = ref('')
const { execute: executeDelete } = useFetch(
  `${config.public.apiBaseUrl}/badges/${badgeId}`,
  {
    immediate: false,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${authStore.token}`
    },
  }
);

const openCreateForm = () => {
  badgeForm.id = '';
  badgeForm.name = '';
  badgeForm.description = '';
  badgeForm.image_url = '';
  isEditMode.value = false;
  showBadgeForm.value = true;
};

const openEditForm = (badge: Badge) => {
  badgeForm.id = badge.id;
  badgeForm.name = badge.name;
  badgeForm.description = badge.description;
  badgeForm.image_url = badge.image_url;
  isEditMode.value = true;
  showBadgeForm.value = true;
};

const closeBadgeForm = () => {
  showBadgeForm.value = false;
};

const submitBadgeForm = async () => {
  if (!badgeForm.name || !badgeForm.description || !badgeForm.image_url) {
    alert('Please fill all required fields');
    return;
  }

  formLoading.value = true;

  try {
    if (isEditMode.value) {
      await executeUpdate();
    } else {
      await executeCreate();
    }

    showBadgeForm.value = false;
    refresh(); // Refresh the badges list
  } catch (error) {
    console.error('Error saving badge:', error);
    alert(error instanceof Error ? error.message : 'Error saving badge');
  } finally {
    formLoading.value = false;
  }
};

const confirmDeleteBadge = async (badge: Badge) => {
  if (confirm(`Are you sure you want to delete the badge "${badge.name}"?`)) {
    try {
      badgeId.value = badge.id;
      await executeDelete();

      refresh(); // Refresh the badges list
    } catch (err) {
      console.error('Error deleting badge:', err);
      alert(err instanceof Error ? err.message : 'Error deleting badge');
    }
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="bg-dark-2 border border-dark rounded-3xl p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-white">Manage Badges</h1>
        <Button @click="openCreateForm" bg="bg-brand" color="text-black">
          <template #icon>
            <Icon icon="tabler:plus" width="24" height="24" />
          </template>
          <template #text>
            Create Badge
          </template>
        </Button>
      </div>

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
        <p class="mt-4">No badges found. Create your first badge!</p>
      </div>

      <!-- Badges table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="text-gray-400 text-sm">
            <tr>
              <th class="pb-4 pl-4">Badge</th>
              <th class="pb-4">Name</th>
              <th class="pb-4">Description</th>
              <th class="pb-4">Created</th>
              <th class="pb-4 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="badge in badges" :key="badge.id" class="border-t border-dark">
              <td class="py-4 pl-4">
                <img :src="badge.image_url" :alt="badge.name" class="w-12 h-12 object-contain rounded-lg" />
              </td>
              <td class="py-4 text-white">{{ badge.name }}</td>
              <td class="py-4 text-gray-300 max-w-xs truncate">{{ badge.description }}</td>
              <td class="py-4 text-gray-400">{{ new Date(badge.created_at).toLocaleDateString() }}</td>
              <td class="py-4 text-right pr-4">
                <div class="flex justify-end space-x-2">
                  <button @click="openEditForm(badge)"
                    class="p-2 rounded-full bg-dark-3 hover:bg-dark-4 transition-colors">
                    <Icon icon="tabler:edit" class="text-gray-300" width="18" height="18" />
                  </button>
                  <button @click="confirmDeleteBadge(badge)"
                    class="p-2 rounded-full bg-dark-3 hover:bg-red-900/50 transition-colors">
                    <Icon icon="tabler:trash" class="text-gray-300" width="18" height="18" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Badge Form Modal -->
    <transition name="fade">
      <div v-if="showBadgeForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="bg-dark-2 border border-dark rounded-3xl p-6 max-w-lg w-full">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-white">
              {{ isEditMode ? 'Edit Badge' : 'Create Badge' }}
            </h2>
            <button @click="closeBadgeForm" class="text-gray-400 hover:text-white transition-colors">
              <Icon icon="tabler:x" width="24" height="24" />
            </button>
          </div>

          <form @submit.prevent="submitBadgeForm" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-300 mb-1">Badge Name</label>
              <input id="name" v-model="badgeForm.name" type="text" required
                class="bg-dark-3 border border-dark text-white w-full px-4 py-2 rounded-3xl focus:border-brand focus:bg-dark-3" />
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea id="description" v-model="badgeForm.description" rows="3" required
                class="bg-dark-3 border border-dark text-white w-full px-4 py-2 rounded-3xl focus:border-brand focus:bg-dark-3"></textarea>
            </div>

            <div>
              <label for="image_url" class="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
              <input id="image_url" v-model="badgeForm.image_url" type="url" required
                class="bg-dark-3 border border-dark text-white w-full px-4 py-2 rounded-3xl focus:border-brand focus:bg-dark-3" />
            </div>

            <div class="pt-4 flex justify-end space-x-3">
              <button type="button" @click="closeBadgeForm"
                class="px-4 py-2 bg-dark-3 text-white rounded-full hover:bg-dark-4 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="formLoading"
                class="px-4 py-2 bg-brand text-black rounded-full hover:bg-opacity-90 transition-colors">
                {{ formLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
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