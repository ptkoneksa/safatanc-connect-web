import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server side
  if (import.meta.server) return;

  const authStore = useAuthStore();

  // If the user is not authenticated and tries to access a protected route
  if (!authStore.isAuthenticated) {
    // Redirect to login page
    return navigateTo("/auth/login");
  }

  // Redirect authenticated users away from auth pages
  if (
    to.path.startsWith("/auth/") &&
    to.name !== "auth-logout" &&
    authStore.isAuthenticated
  ) {
    return navigateTo("/");
  }
});
