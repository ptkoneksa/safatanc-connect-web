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

    // Try to parse responseText if it exists and looks like JSON
    try {
      if (error.data && typeof error.data === "object") {
        return error.data.message || null;
      }

      // For useFetch errors
      if (error.message) {
        return error.message;
      }
    } catch (parseError) {
      console.error("Error parsing error response:", parseError);
    }

    return null;
  };

  const register = async (
    userData: RegisterData
  ): Promise<ApiResponse<User>> => {
    console.log("Auth API register with data:", userData);

    try {
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

      console.log("Register response:", {
        data: data.value,
        error: error.value,
      });

      if (error.value) {
        // Try to extract more detailed error message if available
        const errorDetail = getErrorDetail(error.value);
        console.log("Error detail:", errorDetail);
        throw new Error(
          errorDetail || error.value?.message || "Registration failed"
        );
      }

      return data.value as ApiResponse<User>;
    } catch (err) {
      console.error("Register exception:", err);
      throw err;
    }
  };

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
      // Try to extract more detailed error message if available
      const errorDetail = getErrorDetail(error.value);
      throw new Error(errorDetail || error.value?.message || "Login failed");
    }

    if (data.value?.success && data.value?.data) {
      // Update store with login data
      authStore.setTokens(
        data.value.data.token,
        data.value.data.refresh_token || null
      );
      authStore.setUser(data.value.data.user);
      return data.value;
    }

    throw new Error(data.value?.message || "Invalid response from server");
  };

  // Updated OAuth login methods
  const initiateOAuthLogin = async (
    provider: OAuthProvider,
    customRedirectUri?: string
  ): Promise<void> => {
    if (!import.meta.client) return;

    try {
      // Build request URL with query parameters
      let url = `${config.public.apiBaseUrl}/auth/oauth/${provider}`;

      // Add redirect_uri parameter if provided
      if (customRedirectUri) {
        url += `?redirect_uri=${encodeURIComponent(customRedirectUri)}`;
      } else {
        url += `?redirect_uri=${encodeURIComponent(
          useRequestURL().origin
        )}/auth/callback`;
      }

      // Get the OAuth URL from the backend
      const { data, error } = await useFetch<ApiResponse<{ url: string }>>(
        url,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (error.value) {
        const errorDetail = getErrorDetail(error.value);
        throw new Error(
          errorDetail ||
            error.value?.message ||
            `Failed to initiate ${provider} login`
        );
      }

      if (data.value?.success && data.value?.data?.url) {
        // Redirect to OAuth provider
        window.location.href = data.value.data.url;
      } else {
        throw new Error(data.value?.message || "Invalid response from server");
      }
    } catch (err) {
      console.error("OAuth initiation error:", err);
      throw err;
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

    // Set tokens in store and localStorage
    authStore.setTokens(token, refreshToken);

    // Sleep for 1 second to ensure tokens are set
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = await fetchCurrentUser();

    if (!user) {
      throw new Error("Failed to fetch user data");
    }

    if (redirectUri && redirectUri != "") {
      // Example redirectUri: https://tipspace.com/auth/callback
      const redirectUriParsed = new URL(redirectUri);

      // Set token and refresh token in URL
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

  const refreshAccessToken = async (): Promise<
    ApiResponse<{ token: string }>
  > => {
    if (!authStore.refreshToken) throw new Error("No refresh token available");

    const { data, error } = await useFetch<ApiResponse<{ token: string }>>(
      `${config.public.apiBaseUrl}/auth/refresh`,
      {
        method: "POST",
        body: {
          refresh_token: authStore.refreshToken,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (error.value) {
      authStore.logout();
      throw new Error(error.value?.message || "Token refresh failed");
    }

    if (data.value?.success && data.value?.data?.token) {
      authStore.setTokens(data.value.data.token, authStore.refreshToken);
      return data.value;
    }

    throw new Error(data.value?.message || "Invalid response from server");
  };

  const logoutApi = async (): Promise<void> => {
    if (!authStore.token || !authStore.refreshToken) {
      authStore.logout();
      return;
    }

    try {
      await useFetch<ApiResponse<string>>(
        `${config.public.apiBaseUrl}/auth/logout`,
        {
          method: "POST",
          body: {
            refresh_token: authStore.refreshToken,
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
