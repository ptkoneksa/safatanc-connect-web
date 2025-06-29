import { defineStore } from "pinia";
import type { User } from "~/types/api";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: null,
    refreshToken: null,
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
      this.refreshToken = refreshToken;

      // Store tokens in local storage for persistence
      if (import.meta.client) {
        localStorage.setItem("authToken", token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      }
    },

    clearTokens(): void {
      this.token = null;
      this.refreshToken = null;

      // Remove tokens from local storage
      if (import.meta.client) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
      }
    },

    logout(): void {
      this.clearTokens();
      this.user = null;
    },

    // Initialize auth from localStorage (call this in a plugin)
    initAuth(): void {
      if (!import.meta.client) return;

      const token = localStorage.getItem("authToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (token) {
        this.setTokens(token, refreshToken);
      }
    },
  },
});
