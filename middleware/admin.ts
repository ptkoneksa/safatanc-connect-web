import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server
  if (process.server) return;

  const authStore = useAuthStore();

  // If user is not authenticated, redirect to login page
  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: "/auth/login",
      query: { redirect: to.fullPath },
    });
  }

  // Check if the user has admin role
  const user = authStore.getUser;
  if (!user || user.global_role != "ADMIN") {
    // Redirect to unauthorized page or home
    // return navigateTo("/account");
  }
});
