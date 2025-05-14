import { defineStore } from "pinia";

interface User {
  id?: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  [key: string]: any;
}

interface PasswordResetData {
  token: string;
  newPassword: string;
}

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: number;
  [key: string]: any;
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
      if (process.client) {
        localStorage.setItem("authToken", token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      }
    },

    clearTokens(): void {
      this.token = null;
      this.refreshToken = null;

      // Remove tokens from local storage
      if (process.client) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
      }
    },

    async register(userData: RegisterData): Promise<ApiResponse> {
      const config = useRuntimeConfig();
      console.log("Auth store register with data:", userData);

      try {
        const { data, error } = await useFetch<ApiResponse>(
          `${config.public.apiBaseUrl}/auth/register`,
          {
            method: "POST",
            body: userData,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Register response:", {
          data: data.value,
          error: error.value,
        });

        if (error.value) {
          // Try to extract more detailed error message if available
          const errorDetail = this.getErrorDetail(error.value);
          console.log("Error detail:", errorDetail);
          throw new Error(
            errorDetail || error.value?.message || "Registration failed"
          );
        }

        return data.value as ApiResponse;
      } catch (err) {
        console.error("Register exception:", err);
        throw err;
      }
    },

    // Helper method to extract more detailed error information
    getErrorDetail(error: any): string | null {
      // Check for various error formats
      try {
        if (error.data && typeof error.data === "string") {
          return error.data;
        }

        if (error.data && error.data.message) {
          return error.data.message;
        }

        if (error.data && typeof error.data === "object") {
          // Some APIs return validation errors in different formats
          const errorData = error.data;

          // Try to extract field validation errors
          if (errorData.errors && typeof errorData.errors === "object") {
            const errorMessages = [];
            for (const field in errorData.errors) {
              const fieldErrors = errorData.errors[field];
              if (Array.isArray(fieldErrors)) {
                errorMessages.push(`${field}: ${fieldErrors.join(", ")}`);
              } else if (typeof fieldErrors === "string") {
                errorMessages.push(`${field}: ${fieldErrors}`);
              }
            }
            if (errorMessages.length) {
              return errorMessages.join("; ");
            }
          }

          // Return any other message property
          if (errorData.message) {
            return errorData.message;
          }

          // Last resort - stringify the error
          return JSON.stringify(errorData);
        }
      } catch (e) {
        console.error("Error parsing API error:", e);
      }

      return null;
    },

    async login({ email, password }: LoginCredentials): Promise<ApiResponse> {
      const config = useRuntimeConfig();

      const { data, error } = await useFetch<ApiResponse>(
        `${config.public.apiBaseUrl}/auth/login`,
        {
          method: "POST",
          body: { email, password },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (error.value) {
        // Try to extract more detailed error message if available
        const errorDetail = this.getErrorDetail(error.value);
        throw new Error(errorDetail || error.value?.message || "Login failed");
      }

      if (data.value?.data?.token) {
        this.setTokens(
          data.value.data.token,
          data.value.data.refresh_token || null
        );
        await this.fetchCurrentUser();
        return data.value as ApiResponse;
      }

      throw new Error("Invalid response from server");
    },

    async fetchCurrentUser(): Promise<User | null> {
      if (!this.token) return null;

      const config = useRuntimeConfig();

      const { data, error } = await useFetch<ApiResponse<User>>(
        `${config.public.apiBaseUrl}/auth/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      if (error.value) {
        if (error.value.statusCode === 401) {
          // Token expired, try to refresh
          try {
            await this.refreshAccessToken();
            return this.fetchCurrentUser();
          } catch (refreshError) {
            this.logout();
            throw refreshError;
          }
        }
        throw new Error(error.value?.message || "Failed to fetch user data");
      }

      if (data.value?.data) {
        this.setUser(data.value.data);
        return data.value.data;
      }

      return null;
    },

    async refreshAccessToken(): Promise<ApiResponse> {
      if (!this.refreshToken) throw new Error("No refresh token available");

      const config = useRuntimeConfig();

      const { data, error } = await useFetch<ApiResponse>(
        `${config.public.apiBaseUrl}/auth/refresh`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.refreshToken}`,
          },
        }
      );

      if (error.value) {
        this.logout();
        throw new Error(error.value?.message || "Token refresh failed");
      }

      if (data.value?.data?.token) {
        this.setTokens(data.value.data.token, this.refreshToken);
        return data.value as ApiResponse;
      }

      throw new Error("Invalid response from server");
    },

    async logout(): Promise<void> {
      if (!this.token) return;

      try {
        const config = useRuntimeConfig();

        await useFetch(`${config.public.apiBaseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
      } catch (error) {
        console.error("Logout API error:", error);
      } finally {
        this.clearTokens();
        this.user = null;
      }
    },

    async requestPasswordReset(email: string): Promise<ApiResponse> {
      const config = useRuntimeConfig();

      const { data, error } = await useFetch<ApiResponse>(
        `${config.public.apiBaseUrl}/auth/password-reset-request`,
        {
          method: "POST",
          body: { email },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (error.value) {
        throw new Error(
          error.value?.message || "Password reset request failed"
        );
      }

      return data.value as ApiResponse;
    },

    async resetPassword({
      token,
      newPassword,
    }: PasswordResetData): Promise<ApiResponse> {
      const config = useRuntimeConfig();

      const { data, error } = await useFetch<ApiResponse>(
        `${config.public.apiBaseUrl}/auth/password-reset`,
        {
          method: "POST",
          body: {
            token,
            new_password: newPassword,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (error.value) {
        throw new Error(error.value?.message || "Password reset failed");
      }

      return data.value as ApiResponse;
    },

    // Initialize auth from localStorage (call this in a plugin)
    initAuth(): void {
      if (!process.client) return;

      const token = localStorage.getItem("authToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (token) {
        this.setTokens(token, refreshToken);
        this.fetchCurrentUser().catch(() => this.clearTokens());
      }
    },
  },
});
