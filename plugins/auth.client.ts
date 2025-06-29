import { useAuthApi } from "~/composables/useAuthApi";

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  const { fetchCurrentUser } = useAuthApi();

  // Initialize auth from localStorage
  authStore.initAuth();

  // If we have a token, try to fetch current user
  if (authStore.token) {
    try {
      await fetchCurrentUser();
    } catch (error) {
      console.error("Failed to fetch current user on init:", error);
      // Clear tokens if fetch fails (e.g., token expired)
      authStore.clearTokens();
    }
  }
});
