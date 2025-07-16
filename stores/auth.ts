import { defineStore } from "pinia";
import type { User } from "~/types/api";

interface AuthState {
  user: User | null;
  token: string | null;
  refresh_token: string | null;
  isRefreshing: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: null,
    refresh_token: null,
    isRefreshing: false,
  }),

  getters: {
    isAuthenticated: (state: AuthState): boolean => !!state.token,
    getUser: (state: AuthState): User | null => state.user,
  },

  actions: {
    setUser(user: User): void {
      this.user = user;
    },

    setTokens(token: string, refreshToken: string | null): void {
      this.token = token;
      this.refresh_token = refreshToken;
      if (import.meta.client) {
        localStorage.setItem("authToken", token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        else localStorage.removeItem("refreshToken");
      }
    },

    clearTokens(): void {
      this.token = null;
      this.refresh_token = null;
      if (import.meta.client) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
      }
    },

    logout(): void {
      this.clearTokens();
      this.user = null;
    },

    initAuth(): void {
      if (!import.meta.client) return;
      const token = localStorage.getItem("authToken");
      const refreshToken = localStorage.getItem("refreshToken");
      if (token) {
        this.setTokens(token, refreshToken);
      }
    },

    async refreshToken(): Promise<boolean> {
      if (!this.refresh_token || this.isRefreshing) return false;
      this.isRefreshing = true;
      try {
        const res = (await $fetch("/auth/refresh", {
          method: "POST",
          baseURL: useRuntimeConfig().public.apiBaseUrl,
          body: { refresh_token: this.refresh_token },
        })) as {
          success: boolean;
          data: { token: string; refresh_token: string };
        };
        if (res.success && res.data.token) {
          this.setTokens(res.data.token, res.data.refresh_token);
          this.isRefreshing = false;
          return true;
        }
      } catch (e) {}
      this.clearTokens();
      this.user = null;
      this.isRefreshing = false;
      return false;
    },
  },
});
