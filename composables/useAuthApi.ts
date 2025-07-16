import type { ApiResponse, User, OAuthProvider } from "~/types/api";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  avatar_url?: string;
  [key: string]: any;
}

interface PasswordResetData {
  token: string;
  new_password: string;
}

export const useAuthApi = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  // Helper method to extract more detailed error information
  const getErrorDetail = (error: any): string | null => {
    if (!error) return null;
    try {
      if (error.data && typeof error.data === "object") {
        return error.data.message || null;
      }
      if (error.message) {
        return error.message;
      }
    } catch (parseError) {
      console.error("Error parsing error response:", parseError);
    }
    return null;
  };

  // Register
  const register = async (
    userData: RegisterData
  ): Promise<ApiResponse<User>> => {
    const { data, error } = await useFetch<ApiResponse<User>>(
      `${config.public.apiBaseUrl}/auth/register`,
      {
        method: "POST",
        body: userData,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (error.value) {
      const errorDetail = getErrorDetail(error.value);
      throw new Error(
        errorDetail || error.value?.message || "Registration failed"
      );
    }
    return data.value as ApiResponse<User>;
  };

  // Login
  const login = async ({
    email,
    password,
  }: LoginCredentials): Promise<
    ApiResponse<{ user: User; token: string; refresh_token: string }>
  > => {
    const { data, error } = await useFetch<
      ApiResponse<{ user: User; token: string; refresh_token: string }>
    >(`${config.public.apiBaseUrl}/auth/login`, {
      method: "POST",
      body: { email, password },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (error.value) {
      const errorDetail = getErrorDetail(error.value);
      throw new Error(errorDetail || error.value?.message || "Login failed");
    }
    if (data.value?.success && data.value?.data) {
      authStore.setTokens(
        data.value.data.token,
        data.value.data.refresh_token || null
      );
      authStore.setUser(data.value.data.user);
      return data.value;
    }
    throw new Error(data.value?.message || "Invalid response from server");
  };

  // OAuth login
  const initiateOAuthLogin = async (
    provider: OAuthProvider,
    customRedirectUri?: string
  ): Promise<void> => {
    if (!import.meta.client) return;
    let url = `${config.public.apiBaseUrl}/auth/oauth/${provider}`;
    if (customRedirectUri) {
      url += `?redirect_uri=${encodeURIComponent(customRedirectUri)}`;
    } else {
      url += `?redirect_uri=${encodeURIComponent(
        useRequestURL().origin
      )}/auth/callback`;
    }
    const { data, error } = await useFetch<ApiResponse<{ url: string }>>(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (error.value) {
      const errorDetail = getErrorDetail(error.value);
      throw new Error(
        errorDetail ||
          error.value?.message ||
          `Failed to initiate ${provider} login`
      );
    }
    if (data.value?.success && data.value?.data?.url) {
      window.location.href = data.value.data.url;
    } else {
      throw new Error(data.value?.message || "Invalid response from server");
    }
  };

  // Process OAuth callback tokens
  const processOAuthCallback = async (
    token: string,
    refreshToken: string,
    redirectUri: string
  ) => {
    if (!token) {
      throw new Error("No token received from OAuth provider");
    }
    authStore.setTokens(token, refreshToken);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const user = await fetchCurrentUser();
    if (!user) {
      throw new Error("Failed to fetch user data");
    }
    if (redirectUri && redirectUri != "") {
      const redirectUriParsed = new URL(redirectUri);
      redirectUriParsed.searchParams.set("token", token);
      redirectUriParsed.searchParams.set("refresh_token", refreshToken);
      setTimeout(() => {
        navigateTo(redirectUriParsed.toString(), { external: true });
      }, 1000);
    } else {
      setTimeout(() => {
        navigateTo("/account");
      }, 1000);
    }
  };

  // Fetch current user (GET /auth/me)
  const fetchCurrentUser = async (): Promise<User | null> => {
    if (!authStore.token) return null;
    const { data, error } = await useFetch<ApiResponse<User>>(
      `${config.public.apiBaseUrl}/auth/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );
    if (error.value) {
      if (error.value.statusCode === 401) {
        // Token expired, try to refresh
        try {
          await refreshAccessToken();
          return fetchCurrentUser();
        } catch (refreshError) {
          authStore.logout();
          throw refreshError;
        }
      }
      throw new Error(error.value?.message || "Failed to fetch user data");
    }
    if (data.value?.success && data.value?.data) {
      authStore.setUser(data.value.data);
      return data.value.data;
    }
    return null;
  };

  // Refresh access token (POST /auth/refresh)
  const refreshAccessToken = async (): Promise<
    ApiResponse<{ token: string; refresh_token: string }>
  > => {
    if (!authStore.refresh_token) throw new Error("No refresh token available");
    const { data, error } = await useFetch<
      ApiResponse<{ token: string; refresh_token: string }>
    >(`${config.public.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      body: {
        refresh_token: authStore.refresh_token,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (error.value) {
      authStore.logout();
      throw new Error(error.value?.message || "Token refresh failed");
    }
    if (data.value?.success && data.value?.data?.token) {
      authStore.setTokens(data.value.data.token, data.value.data.refresh_token);
      return data.value;
    }
    throw new Error(data.value?.message || "Invalid response from server");
  };

  // Logout (POST /auth/logout)
  const logoutApi = async (): Promise<void> => {
    if (!authStore.token || !authStore.refresh_token) {
      authStore.logout();
      return;
    }
    try {
      await useFetch<ApiResponse<string>>(
        `${config.public.apiBaseUrl}/auth/logout`,
        {
          method: "POST",
          body: {
            refresh_token: authStore.refresh_token,
          },
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      authStore.logout();
    }
  };

  // Request password reset (POST /auth/request-password-reset)
  const requestPasswordReset = async (
    email: string
  ): Promise<ApiResponse<string>> => {
    const { data, error } = await useFetch<ApiResponse<string>>(
      `${config.public.apiBaseUrl}/auth/request-password-reset`,
      {
        method: "POST",
        body: { email },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (error.value) {
      throw new Error(error.value?.message || "Password reset request failed");
    }
    return data.value as ApiResponse<string>;
  };

  // Reset password (POST /auth/reset-password)
  const resetPassword = async ({
    token,
    new_password,
  }: PasswordResetData): Promise<ApiResponse<User>> => {
    const { data, error } = await useFetch<ApiResponse<User>>(
      `${config.public.apiBaseUrl}/auth/reset-password`,
      {
        method: "POST",
        body: {
          token,
          new_password,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (error.value) {
      throw new Error(error.value?.message || "Password reset failed");
    }
    return data.value as ApiResponse<User>;
  };

  // Resend verification email (POST /auth/resend-verification-email)
  const resendVerificationEmail = async (): Promise<ApiResponse<string>> => {
    if (!authStore.token) throw new Error("You must be logged in");
    const { data, error } = await useFetch<ApiResponse<string>>(
      `${config.public.apiBaseUrl}/auth/resend-verification-email`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (error.value) {
      throw new Error(
        error.value?.message || "Failed to resend verification email"
      );
    }
    return data.value as ApiResponse<string>;
  };

  return {
    register,
    login,
    initiateOAuthLogin,
    processOAuthCallback,
    fetchCurrentUser,
    refreshAccessToken,
    logoutApi,
    requestPasswordReset,
    resetPassword,
    resendVerificationEmail,
  };
};
