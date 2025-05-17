<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Icon } from '@iconify/vue';

definePageMeta({
  layout: 'account'
});

const router = useRouter();
const authStore = useAuthStore();
const route = useRoute();

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
  token: string;
}

const form = reactive<ResetPasswordForm>({
  newPassword: '',
  confirmPassword: '',
  token: route.query.token as string || '',
});

const loading = ref<boolean>(false);
const error = ref<string>('');
const success = ref<string>('');

const resetPassword = async (): Promise<void> => {
  // Reset messages
  error.value = '';
  success.value = '';

  // Form validation
  if (!form.token) {
    error.value = 'Reset token is missing. Please use the link from the email.';
    return;
  }

  if (!form.newPassword || !form.confirmPassword) {
    error.value = 'Please fill in all fields';
    return;
  }

  if (form.newPassword !== form.confirmPassword) {
    error.value = 'Passwords do not match';
    return;
  }

  loading.value = true;

  try {
    await authStore.resetPassword({
      token: form.token,
      new_password: form.newPassword
    });

    success.value = 'Your password has been reset successfully. You can now login with your new password.';

    // Clear form
    form.newPassword = '';
    form.confirmPassword = '';

    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/auth/login');
    }, 2000);
  } catch (err: any) {
    error.value = err.message || 'Password reset failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="p-8 bg-dark-2 border border-dark rounded-3xl transition-all duration-300 hover:border-brand">
    <h2 class="text-2xl font-bold mb-6 text-center text-white">Reset Your Password</h2>

    <form @submit.prevent="resetPassword" class="space-y-6">
      <div v-if="error" class="p-4 rounded-3xl bg-red-900/30 border border-red-500 text-red-200 text-sm mb-4">
        {{ error }}
      </div>

      <div v-if="success" class="p-4 rounded-3xl bg-green-900/30 border border-green-500 text-green-200 text-sm mb-4">
        {{ success }}
      </div>

      <div v-if="!form.token"
        class="p-4 rounded-3xl bg-yellow-900/30 border border-yellow-500 text-yellow-200 text-sm mb-4">
        Reset token is missing. Please make sure you are using the link from the email.
      </div>

      <div>
        <label for="newPassword" class="block text-sm font-medium text-gray-300 mb-1">New Password</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon icon="tabler:lock" class="text-gray-400" width="24" height="24" />
          </span>
          <input id="newPassword" v-model="form.newPassword" type="password" required autocomplete="new-password"
            class="bg-dark-3 border border-dark text-white w-full pl-10 pr-3 py-2 rounded-3xl focus:border-brand focus:bg-dark-3" />
        </div>
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon icon="tabler:lock-check" class="text-gray-400" width="24" height="24" />
          </span>
          <input id="confirmPassword" v-model="form.confirmPassword" type="password" required
            autocomplete="new-password"
            class="bg-dark-3 border border-dark text-white w-full pl-10 pr-3 py-2 rounded-3xl focus:border-brand focus:bg-dark-3" />
        </div>
      </div>

      <div>
        <Button type="submit" :disabled="loading || !form.token" bg="bg-brand" color="text-black">
          <template #icon>
            <Icon icon="tabler:key" width="24" height="24" />
          </template>
          <template #text>
            {{ loading ? 'Resetting...' : 'Reset Password' }}
          </template>
        </Button>
      </div>

      <div class="text-center text-sm text-gray-300">
        <NuxtLink to="/auth/login" class="font-medium text-brand hover:text-opacity-80">
          Back to Login
        </NuxtLink>
      </div>
    </form>
  </div>
</template>