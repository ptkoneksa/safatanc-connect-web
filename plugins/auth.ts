import { useAuthStore } from "~/stores/auth";

export default defineNuxtPlugin({
  name: "auth-plugin",

  setup() {
    // Only run on client side
    if (process.server) return;

    const authStore = useAuthStore();

    // Initialize authentication from localStorage
    authStore.initAuth();
  },
});
