import type {
  GSaltAccount,
  GSaltTransaction,
  GSaltTopupRequest,
  GSaltTransferRequest,
  GSaltPaymentRequest,
  GSaltGiftRequest,
  GSaltWithdrawalRequest,
  GSaltVoucherRedemption,
  GSaltVoucher,
  PaymentMethodInfo,
  BankInfo,
  BankAccountValidation,
  WithdrawalBalance,
  VoucherValidation,
  TopupResponse,
  PaymentResponse,
  TransactionConfirmRequest,
  TransactionRejectRequest,
  PaymentMethod,
} from "~/types/gsalt_api";
import { GSaltErrorCode } from "~/types/gsalt_api";
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

  // Enhanced error handling with specific error codes
  const handleApiError = (error: any, defaultMessage: string) => {
    // Handle network errors
    if (error.name === "FetchError" || error.cause?.code === "FETCH_ERROR") {
      throw new Error(GSaltErrorCode.NETWORK_ERROR);
    }

    // Extract error message with better hierarchy
    const errorMessage =
      error.response?.data?.message ||
      error.data?.message ||
      error.message ||
      defaultMessage;

    // Handle specific error codes
    if (error.response?.status === 401 || error.status === 401) {
      if (errorMessage?.includes("not registered on GSALT")) {
        throw new Error(GSaltErrorCode.ACCOUNT_NOT_REGISTERED);
      }
      throw new Error(GSaltErrorCode.UNAUTHORIZED);
    }

    if (error.response?.status === 400 || error.status === 400) {
      if (errorMessage?.includes("insufficient balance")) {
        throw new Error(GSaltErrorCode.INSUFFICIENT_BALANCE);
      }
      if (errorMessage?.includes("daily limit")) {
        throw new Error(GSaltErrorCode.DAILY_LIMIT_EXCEEDED);
      }
      if (errorMessage?.includes("below minimum")) {
        throw new Error(GSaltErrorCode.AMOUNT_BELOW_MINIMUM);
      }
      if (errorMessage?.includes("above maximum")) {
        throw new Error(GSaltErrorCode.AMOUNT_ABOVE_MAXIMUM);
      }
      if (errorMessage?.includes("invalid payment method")) {
        throw new Error(GSaltErrorCode.INVALID_PAYMENT_METHOD);
      }
      if (errorMessage?.includes("expired")) {
        throw new Error(GSaltErrorCode.PAYMENT_EXPIRED);
      }
      if (errorMessage?.includes("invalid bank account")) {
        throw new Error(GSaltErrorCode.BANK_ACCOUNT_INVALID);
      }
    }

    if (error.response?.status === 503 || error.status === 503) {
      throw new Error(GSaltErrorCode.SERVICE_UNAVAILABLE);
    }

    throw new Error(errorMessage);
  };

  // Health check using the actual /health endpoint
  const healthCheck = async (): Promise<{
    status: "healthy" | "unhealthy";
  }> => {
    try {
      const response = await $fetch<ApiResponse<string>>(getApiUrl("/health"), {
        method: "GET",
        timeout: 5000,
      });

      if (response?.success && response?.data === "gsalt-core") {
        return { status: "healthy" };
      }

      return { status: "unhealthy" };
    } catch (error: any) {
      console.error("Health check failed:", error);
      return { status: "unhealthy" };
    }
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
        throw new Error(GSaltErrorCode.NETWORK_ERROR);
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
      handleApiError(error, "Failed to create GSalt account");
      throw error; // This won't be reached, but satisfies TypeScript
    }
  };

  const fetchAccountById = async (id: string): Promise<GSaltAccount | null> => {
    try {
      const response = await $fetch<ApiResponse<GSaltAccount>>(
        getApiUrl(`/accounts/${id}`),
        {
          method: "GET",
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error("Failed to fetch account by ID:", error);
      return null;
    }
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      await $fetch<ApiResponse<null>>(getApiUrl("/accounts/me"), {
        method: "DELETE",
        headers: getHeaders(),
      });
    } catch (error: any) {
      handleApiError(error, "Failed to delete GSalt account");
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
      >(getApiUrl("/transactions"), {
        method: "GET",
        query: { page, limit, order, order_field: orderField },
        headers: getHeaders(),
      });

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      handleApiError(error, "Failed to fetch transactions");
      throw error;
    }
  };

  const fetchTransactionById = async (
    id: string
  ): Promise<GSaltTransaction | null> => {
    try {
      const response = await $fetch<ApiResponse<GSaltTransaction>>(
        getApiUrl(`/transactions/${id}`),
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      handleApiError(error, "Failed to fetch transaction");
      return null;
    }
  };

  const createTransaction = async (
    transaction: Partial<GSaltTransaction>
  ): Promise<GSaltTransaction> => {
    try {
      const response = await $fetch<ApiResponse<GSaltTransaction>>(
        getApiUrl("/transactions"),
        {
          method: "POST",
          body: transaction,
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      handleApiError(error, "Failed to create transaction");
      throw error;
    }
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<GSaltTransaction>
  ): Promise<GSaltTransaction> => {
    try {
      const response = await $fetch<ApiResponse<GSaltTransaction>>(
        getApiUrl(`/transactions/${id}`),
        {
          method: "PUT",
          body: updates,
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      handleApiError(error, "Failed to update transaction");
      throw error;
    }
  };

  const topup = async (request: GSaltTopupRequest): Promise<TopupResponse> => {
    try {
      const response = await $fetch<ApiResponse<TopupResponse>>(
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
      handleApiError(error, "Topup failed");
      throw error;
    }
  };

  const transfer = async (
    request: GSaltTransferRequest
  ): Promise<{
    transfer_out: GSaltTransaction;
    transfer_in: GSaltTransaction;
  }> => {
    try {
      const response = await $fetch<
        ApiResponse<{
          transfer_out: GSaltTransaction;
          transfer_in: GSaltTransaction;
        }>
      >(getApiUrl("/transactions/transfer"), {
        method: "POST",
        body: request,
        headers: getHeaders(),
      });

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      handleApiError(error, "Transfer failed");
      throw error;
    }
  };

  const payment = async (
    request: GSaltPaymentRequest
  ): Promise<PaymentResponse> => {
    try {
      const response = await $fetch<ApiResponse<PaymentResponse>>(
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
      handleApiError(error, "Payment failed");
      throw error;
    }
  };

  const getPaymentMethods = async (
    amount?: number
  ): Promise<PaymentMethodInfo[]> => {
    try {
      const response = await $fetch<ApiResponse<PaymentMethodInfo[]>>(
        getApiUrl("/transactions/payment/methods"),
        {
          method: "GET",
          query: amount ? { amount } : {},
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      handleApiError(error, "Failed to fetch payment methods");
      throw error;
    }
  };

  const confirmTransaction = async (
    id: string,
    request: TransactionConfirmRequest
  ): Promise<GSaltTransaction> => {
    try {
      const response = await $fetch<ApiResponse<GSaltTransaction>>(
        getApiUrl(`/transactions/${id}/confirm`),
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
      handleApiError(error, "Failed to confirm transaction");
      throw error;
    }
  };

  const rejectTransaction = async (
    id: string,
    request: TransactionRejectRequest
  ): Promise<GSaltTransaction> => {
    try {
      const response = await $fetch<ApiResponse<GSaltTransaction>>(
        getApiUrl(`/transactions/${id}/reject`),
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
      handleApiError(error, "Failed to reject transaction");
      throw error;
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
      handleApiError(error, "Gift failed");
      throw error;
    }
  };

  // Voucher operations
  const fetchVouchers = async (
    page: number = 1,
    limit: number = 10,
    order: "asc" | "desc" = "desc",
    orderField: string = "created_at",
    status?: string
  ): Promise<PaginatedResponse<GSaltVoucher>> => {
    try {
      const query: any = { page, limit, order, order_field: orderField };
      if (status) query.status = status;

      const response = await $fetch<
        ApiResponse<PaginatedResponse<GSaltVoucher>>
      >(getApiUrl("/vouchers"), {
        method: "GET",
        query,
      });

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      handleApiError(error, "Failed to fetch vouchers");
      throw error;
    }
  };

  const fetchVoucherById = async (id: string): Promise<GSaltVoucher | null> => {
    try {
      const response = await $fetch<ApiResponse<GSaltVoucher>>(
        getApiUrl(`/vouchers/${id}`),
        {
          method: "GET",
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error("Failed to fetch voucher:", error);
      return null;
    }
  };

  const fetchVoucherByCode = async (
    code: string
  ): Promise<GSaltVoucher | null> => {
    try {
      const response = await $fetch<ApiResponse<GSaltVoucher>>(
        getApiUrl(`/vouchers/code/${code}`),
        {
          method: "GET",
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error("Failed to fetch voucher by code:", error);
      return null;
    }
  };

  const validateVoucher = async (code: string): Promise<VoucherValidation> => {
    try {
      const response = await $fetch<ApiResponse<VoucherValidation>>(
        getApiUrl(`/vouchers/validate/${code}`),
        {
          method: "POST",
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      handleApiError(error, "Failed to validate voucher");
      throw error;
    }
  };

  const createVoucher = async (
    voucher: Partial<GSaltVoucher>
  ): Promise<GSaltVoucher> => {
    try {
      const response = await $fetch<ApiResponse<GSaltVoucher>>(
        getApiUrl("/vouchers"),
        {
          method: "POST",
          body: voucher,
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      handleApiError(error, "Failed to create voucher");
      throw error;
    }
  };

  const updateVoucher = async (
    id: string,
    updates: Partial<GSaltVoucher>
  ): Promise<GSaltVoucher> => {
    try {
      const response = await $fetch<ApiResponse<GSaltVoucher>>(
        getApiUrl(`/vouchers/${id}`),
        {
          method: "PATCH",
          body: updates,
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      handleApiError(error, "Failed to update voucher");
      throw error;
    }
  };

  const deleteVoucher = async (id: string): Promise<void> => {
    try {
      await $fetch<ApiResponse<null>>(getApiUrl(`/vouchers/${id}`), {
        method: "DELETE",
        headers: getHeaders(),
      });
    } catch (error: any) {
      handleApiError(error, "Failed to delete voucher");
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
      handleApiError(error, "Voucher redemption failed");
      throw error;
    }
  };

  const fetchVoucherRedemptions = async (
    page: number = 1,
    limit: number = 10,
    order: "asc" | "desc" = "desc",
    orderField: string = "redeemed_at"
  ): Promise<PaginatedResponse<GSaltVoucherRedemption>> => {
    try {
      const response = await $fetch<
        ApiResponse<PaginatedResponse<GSaltVoucherRedemption>>
      >(getApiUrl("/voucher-redemptions/me"), {
        method: "GET",
        query: { page, limit, order, order_field: orderField },
        headers: getHeaders(),
      });

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      handleApiError(error, "Failed to fetch voucher redemptions");
      throw error;
    }
  };

  // Withdrawal operations
  const withdrawal = async (
    request: GSaltWithdrawalRequest
  ): Promise<GSaltTransaction> => {
    try {
      const response = await $fetch<ApiResponse<GSaltTransaction>>(
        getApiUrl("/transactions/withdrawal"),
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
      handleApiError(error, "Withdrawal failed");
      throw error;
    }
  };

  const validateBankAccount = async (data: {
    bank_code: string;
    account_number: string;
  }): Promise<BankAccountValidation> => {
    try {
      const response = await $fetch<ApiResponse<BankAccountValidation>>(
        getApiUrl("/transactions/withdrawal/validate-bank-account"),
        {
          method: "POST",
          body: data,
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      handleApiError(error, "Bank account validation failed");
      throw error;
    }
  };

  const getWithdrawalBalance = async (): Promise<WithdrawalBalance> => {
    try {
      const response = await $fetch<ApiResponse<WithdrawalBalance>>(
        getApiUrl("/transactions/withdrawal/balance"),
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      handleApiError(error, "Failed to get withdrawal balance");
      throw error;
    }
  };

  const getSupportedBanks = async (): Promise<BankInfo[]> => {
    try {
      const response = await $fetch<ApiResponse<BankInfo[]>>(
        getApiUrl("/transactions/withdrawal/banks"),
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Invalid response from server");
    } catch (error: any) {
      handleApiError(error, "Failed to get supported banks");
      throw error;
    }
  };

  const getWithdrawalStatus = async (
    id: string
  ): Promise<GSaltTransaction | null> => {
    try {
      const response = await $fetch<ApiResponse<GSaltTransaction>>(
        getApiUrl(`/transactions/withdrawal/${id}/status`),
        {
          method: "POST",
          headers: getHeaders(),
        }
      );

      if (response?.success && response?.data) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      handleApiError(error, "Failed to get withdrawal status");
      return null;
    }
  };

  // Essential formatting utilities only
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

  // GSALT unit conversion utilities
  const gsaltUnitsToAmount = (units: number): number => {
    return units / 100;
  };

  const gsaltAmountToUnits = (amount: number): number => {
    return Math.round(amount * 100);
  };

  return {
    // Health & System
    healthCheck,

    // Account operations
    fetchAccount,
    createAccount,
    fetchAccountById,
    deleteAccount,

    // Transaction operations
    fetchTransactions,
    fetchTransactionById,
    createTransaction,
    updateTransaction,
    topup,
    transfer,
    payment,
    gift,
    getPaymentMethods,
    confirmTransaction,
    rejectTransaction,

    // Voucher operations
    fetchVouchers,
    fetchVoucherById,
    fetchVoucherByCode,
    validateVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    redeemVoucher,
    fetchVoucherRedemptions,

    // Withdrawal operations
    withdrawal,
    validateBankAccount,
    getWithdrawalBalance,
    getSupportedBanks,
    getWithdrawalStatus,

    // Essential utilities only
    formatGSaltAmount,
    formatCurrency,
    gsaltUnitsToAmount,
    gsaltAmountToUnits,
  };
};
