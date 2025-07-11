import type {
  GSaltAccount,
  GSaltTransaction,
  GSaltTopupRequest,
  GSaltTransferRequest,
  GSaltPaymentRequest,
  GSaltWithdrawalRequest,
  GSaltVoucher,
  BankInfo,
  BankAccountValidation,
  WithdrawalBalance,
  VoucherValidation,
  TopupResponse,
  PaymentResponse,
  TransactionConfirmRequest,
  TransactionRejectRequest,
  PaymentMethod,
  PaymentMethodResponse,
  TransferResponse,
} from "~/types/gsalt_api";
import { GSaltErrorCode } from "~/types/gsalt_api";
import type { ApiResponse, PaginatedResponse } from "~/types/api";

interface PaymentMethodsQuery {
  type?: "TOPUP" | "PAYMENT" | "WITHDRAWAL";
  currency?: string;
  status?: "ACTIVE" | "INACTIVE";
}

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

  const handleApiError = (error: any, defaultMessage: string) => {
    if (error.name === "FetchError" || error.cause?.code === "FETCH_ERROR") {
      throw new Error(GSaltErrorCode.SERVICE_UNAVAILABLE);
    }

    const errorMessage =
      error.response?.data?.message ||
      error.data?.message ||
      error.message ||
      defaultMessage;

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
      if (errorMessage?.includes("invalid payment method")) {
        throw new Error(GSaltErrorCode.INVALID_PAYMENT_METHOD);
      }
      if (errorMessage?.includes("invalid bank account")) {
        throw new Error(GSaltErrorCode.BANK_ACCOUNT_INVALID);
      }
    }

    throw new Error(errorMessage);
  };

  // Health check
  const healthCheck = async (): Promise<{
    status: "healthy" | "unhealthy";
  }> => {
    try {
      const response = await $fetch<ApiResponse<string>>(getApiUrl("/health"), {
        method: "GET",
      });

      return { status: response?.success ? "healthy" : "unhealthy" };
    } catch (error: any) {
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

      return response?.success && response?.data ? response.data : null;
    } catch (error: any) {
      handleApiError(error, "Failed to fetch GSalt account");
      return null;
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

      throw new Error(response?.message || "Failed to create account");
    } catch (error: any) {
      handleApiError(error, "Failed to create GSalt account");
      throw error;
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

      throw new Error(response?.message || "Failed to fetch transactions");
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

      return response?.success && response?.data ? response.data : null;
    } catch (error: any) {
      handleApiError(error, "Failed to fetch transaction");
      return null;
    }
  };

  const fetchTransactionByRef = async (
    ref: string
  ): Promise<GSaltTransaction | null> => {
    try {
      const response = await $fetch<ApiResponse<GSaltTransaction>>(
        getApiUrl(`/transactions/ref/${ref}`),
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      return response?.success && response?.data ? response.data : null;
    } catch (error: any) {
      handleApiError(error, "Failed to fetch transaction");
      return null;
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

      throw new Error(response?.message || "Topup failed");
    } catch (error: any) {
      handleApiError(error, "Topup failed");
      throw error;
    }
  };

  const transfer = async (
    request: GSaltTransferRequest
  ): Promise<TransferResponse> => {
    try {
      const response = await $fetch<ApiResponse<TransferResponse>>(
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

      throw new Error(response?.message || "Transfer failed");
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

      throw new Error(response?.message || "Payment failed");
    } catch (error: any) {
      handleApiError(error, "Payment failed");
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

      throw new Error(response?.message || "Failed to confirm transaction");
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

      throw new Error(response?.message || "Failed to reject transaction");
    } catch (error: any) {
      handleApiError(error, "Failed to reject transaction");
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

      throw new Error(response?.message || "Withdrawal failed");
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

      throw new Error(response?.message || "Bank account validation failed");
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

      throw new Error(response?.message || "Failed to get withdrawal balance");
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

      throw new Error(response?.message || "Failed to get supported banks");
    } catch (error: any) {
      handleApiError(error, "Failed to get supported banks");
      throw error;
    }
  };

  // Voucher operations
  const redeemVoucher = async (
    code: string
  ): Promise<{
    redemption: GSaltVoucher;
    transaction: GSaltTransaction;
  }> => {
    try {
      const response = await $fetch<
        ApiResponse<{
          redemption: GSaltVoucher;
          transaction: GSaltTransaction;
        }>
      >(getApiUrl("/voucher-redemptions/redeem"), {
        method: "POST",
        body: { voucher_code: code },
        headers: getHeaders(),
      });

      if (response?.success && response?.data) {
        return response.data;
      }

      throw new Error(response?.message || "Voucher redemption failed");
    } catch (error: any) {
      handleApiError(error, "Voucher redemption failed");
      throw error;
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

  const getPaymentMethods = async (query?: PaymentMethodsQuery) => {
    const queryString = query
      ? `?${new URLSearchParams(query as any).toString()}`
      : "";
    return await $fetch<PaymentMethodResponse>(
      `${config.public.gsaltApiBaseUrl}/transactions/payment-methods${queryString}`
    );
  };

  return {
    // Health check
    healthCheck,

    // Account operations
    fetchAccount,
    createAccount,

    // Transaction operations
    fetchTransactions,
    fetchTransactionById,
    fetchTransactionByRef,
    topup,
    transfer,
    payment,
    confirmTransaction,
    rejectTransaction,

    // Withdrawal operations
    withdrawal,
    validateBankAccount,
    getWithdrawalBalance,
    getSupportedBanks,

    // Voucher operations
    redeemVoucher,

    // Utility functions
    formatGSaltAmount,
    getPaymentMethods,
  };
};
