import type {
  GSaltAccount,
  GSaltTransaction,
  GSaltTopupRequest,
  GSaltTransferRequest,
  GSaltPaymentRequest,
  GSaltGiftRequest,
  GSaltVoucherRedemption,
} from "~/types/gsalt_api";
import type { ApiResponse, PaginatedResponse } from "~/types/api";

export const useGSaltApi = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const getApiUrl = (endpoint: string) => {
    return `${
      config.public.gsaltApiBaseUrl || config.public.apiBaseUrl
    }${endpoint}`;
  };

  const getHeaders = () => {
    if (!authStore.token) {
      throw new Error("Authentication required");
    }
    return {
      Authorization: `Bearer ${authStore.token}`,
      "Content-Type": "application/json",
    };
  };

  // Account operations
  const fetchAccount = async (): Promise<GSaltAccount | null> => {
    try {
      const response = await $fetch<ApiResponse<GSaltAccount>>(
        getApiUrl("/accounts/me"),
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      // Check for GSALT registration message
      if (
        !response?.success &&
        response?.message?.includes("not registered on GSALT")
      ) {
        return null; // Account not found
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 401 || error.status === 401) {
        const errorMessage =
          error.response?.data?.message || error.data?.message;
        if (errorMessage?.includes("not registered on GSALT")) {
          return null; // Account not found
        }
      }

      // Handle network errors
      if (error.name === "FetchError" || error.cause?.code === "FETCH_ERROR") {
        throw new Error("Network error: Unable to connect to GSalt service");
      }

      throw new Error(
        error.response?.data?.message ||
          error.data?.message ||
          error.message ||
          "Failed to fetch GSalt account"
      );
    }
  };

  const createAccount = async (): Promise<GSaltAccount> => {
    try {
      const response = await $fetch<ApiResponse<GSaltAccount>>(
        getApiUrl("/accounts"),
        {
          method: "POST",
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      if (error.name === "FetchError" || error.cause?.code === "FETCH_ERROR") {
        throw new Error("Network error: Unable to connect to GSalt service");
      }

      throw new Error(
        error.response?.data?.message ||
          error.data?.message ||
          error.message ||
          "Failed to create GSalt account"
      );
    }
  };

  // Transaction operations
  const fetchTransactions = async (
    page: number = 1,
    limit: number = 10,
    order: "asc" | "desc" = "desc",
    orderField: string = "created_at"
  ): Promise<PaginatedResponse<GSaltTransaction>> => {
    try {
      const response = await $fetch<
        ApiResponse<PaginatedResponse<GSaltTransaction>>
      >(getApiUrl("/transactions/me"), {
        method: "GET",
        query: { page, limit, order, order_field: orderField },
        headers: getHeaders(),
      });

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      if (error.name === "FetchError" || error.cause?.code === "FETCH_ERROR") {
        throw new Error("Network error: Unable to connect to GSalt service");
      }

      throw new Error(
        error.response?.data?.message ||
          error.data?.message ||
          error.message ||
          "Failed to fetch transactions"
      );
    }
  };

  const topup = async (
    request: GSaltTopupRequest
  ): Promise<GSaltTransaction> => {
    try {
      const response = await $fetch<ApiResponse<GSaltTransaction>>(
        getApiUrl("/transactions/topup"),
        {
          method: "POST",
          body: request,
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      if (error.name === "FetchError" || error.cause?.code === "FETCH_ERROR") {
        throw new Error("Network error: Unable to connect to GSalt service");
      }

      throw new Error(
        error.response?.data?.message ||
          error.data?.message ||
          error.message ||
          "Topup failed"
      );
    }
  };

  const transfer = async (
    request: GSaltTransferRequest
  ): Promise<GSaltTransaction> => {
    try {
      const response = await $fetch<ApiResponse<GSaltTransaction>>(
        getApiUrl("/transactions/transfer"),
        {
          method: "POST",
          body: request,
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      if (error.name === "FetchError" || error.cause?.code === "FETCH_ERROR") {
        throw new Error("Network error: Unable to connect to GSalt service");
      }

      throw new Error(
        error.response?.data?.message ||
          error.data?.message ||
          error.message ||
          "Transfer failed"
      );
    }
  };

  const payment = async (
    request: GSaltPaymentRequest
  ): Promise<GSaltTransaction> => {
    try {
      const response = await $fetch<ApiResponse<GSaltTransaction>>(
        getApiUrl("/transactions/payment"),
        {
          method: "POST",
          body: request,
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      if (error.name === "FetchError" || error.cause?.code === "FETCH_ERROR") {
        throw new Error("Network error: Unable to connect to GSalt service");
      }

      throw new Error(
        error.response?.data?.message ||
          error.data?.message ||
          error.message ||
          "Payment failed"
      );
    }
  };

  const gift = async (request: GSaltGiftRequest): Promise<GSaltTransaction> => {
    try {
      const response = await $fetch<ApiResponse<GSaltTransaction>>(
        getApiUrl("/transactions/gift"),
        {
          method: "POST",
          body: request,
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      if (error.name === "FetchError" || error.cause?.code === "FETCH_ERROR") {
        throw new Error("Network error: Unable to connect to GSalt service");
      }

      throw new Error(
        error.response?.data?.message ||
          error.data?.message ||
          error.message ||
          "Gift failed"
      );
    }
  };

  const redeemVoucher = async (
    voucherCode: string
  ): Promise<{
    redemption: GSaltVoucherRedemption;
    transaction: GSaltTransaction;
  }> => {
    try {
      const response = await $fetch<
        ApiResponse<{
          redemption: GSaltVoucherRedemption;
          transaction: GSaltTransaction;
        }>
      >(getApiUrl("/voucher-redemptions/redeem"), {
        method: "POST",
        body: { voucher_code: voucherCode },
        headers: getHeaders(),
      });

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      if (error.name === "FetchError" || error.cause?.code === "FETCH_ERROR") {
        throw new Error("Network error: Unable to connect to GSalt service");
      }

      throw new Error(
        error.response?.data?.message ||
          error.data?.message ||
          error.message ||
          "Voucher redemption failed"
      );
    }
  };

  // Utility functions
  const formatGSaltAmount = (units: number): string => {
    const gsalt = units / 100;
    return gsalt.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatCurrency = (amount: number, currency: string = "IDR"): string => {
    if (currency === "IDR") {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return {
    // Account operations
    fetchAccount,
    createAccount,

    // Transaction operations
    fetchTransactions,
    topup,
    transfer,
    payment,
    gift,
    redeemVoucher,

    // Utility functions
    formatGSaltAmount,
    formatCurrency,
  };
};
