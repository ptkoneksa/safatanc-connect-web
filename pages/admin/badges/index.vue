<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useBadgeStore } from '~/stores/badge';
import { Icon } from '@iconify/vue';
import type { Badge } from '~/types/api';

definePageMeta({
  layout: 'account',
  middleware: 'admin'
});

// SEO Meta Tags
useHead({
  title: 'Manage Badges - Admin - Safatanc Connect',
  meta: [
    { name: 'description', content: 'Admin panel for managing badges on Safatanc Connect.' },
    // Theme Color
    { name: 'theme-color', content: '#ffbf00' } // Using brand color
  ],
}, { mode: 'server' });

const authStore = useAuthStore();
const badgeStore = useBadgeStore();

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Badge form
const showBadgeForm = ref(false);
const isEditMode = ref(false);
const badgeForm = reactive({
  id: '',
  name: '',
  description: '',
  image_url: '',
});

// Load badges on mounted
onMounted(async () => {
  await badgeStore.fetchBadges(currentPage.value, itemsPerPage.value);
});

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

  try {
    if (isEditMode.value) {
      await badgeStore.updateBadge(badgeForm.id, {
        name: badgeForm.name,
        description: badgeForm.description,
        image_url: badgeForm.image_url
      });
    } else {
      await badgeStore.createBadge({
        name: badgeForm.name,
        description: badgeForm.description,
        image_url: badgeForm.image_url
      });
    }
    showBadgeForm.value = false;
  } catch (error) {
    console.error('Error saving badge:', error);
  }
};

const confirmDeleteBadge = async (badge: Badge) => {
  if (confirm(`Are you sure you want to delete the badge "${badge.name}"?`)) {
    await badgeStore.deleteBadge(badge.id);
  }
};

// Computed properties
const badges = computed(() => badgeStore.getBadges);
const isLoading = computed(() => badgeStore.isLoading);
const error = computed(() => badgeStore.getError);
</script>

<template>
  <div class="space-y-6">
    <div class="bg-dark-2 border border-dark rounded-3xl p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-white">Manage Badges</h1>
        <Button @click="openCreateForm" bg="bg-brand" color="text-black">
          <template #icon>
            <Icon icon="tabler:plus" width="20" height="20" />
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
              <button type="submit" :disabled="isLoading"
                class="px-4 py-2 bg-brand text-black rounded-full hover:bg-opacity-90 transition-colors">
                {{ isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }}
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