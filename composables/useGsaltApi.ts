import { useRuntimeConfig } from "#app";
import { useAuthStore } from "~/stores/auth";
import type {
  GSaltAccount,
  GSaltTransaction,
  GSaltTopupRequest,
  GSaltTransferRequest,
  GSaltPaymentRequest,
  GSaltWithdrawalRequest,
  WithdrawalResponse,
  TransferResponse,
  BankListResponse,
  BankAccountInquiryRequest,
  BankAccountInquiryResponse,
  WithdrawalBalanceResponse,
  GSaltVoucher,
  VoucherCreateRequest,
  VoucherUpdateRequest,
  VoucherRedeemRequest,
  VoucherRedemption,
  VoucherRedemptionResponse,
  APIKeyCreateRequest,
  APIKeyUpdateRequest,
  APIKey,
  PaymentMethod,
  PaymentMethodsQuery,
  PaymentMethodResponse,
  GSaltHealthCheck,
  ErrorResponse,
} from "~/types/gsalt_api";

export const useGsaltApi = () => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.gsaltApiUrl as string;
  const auth = useAuthStore();

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${auth.token}`,
  };

  // Health Check
  const checkHealth = async (): Promise<GSaltHealthCheck> => {
    return await $fetch("/health", { baseURL: baseUrl });
  };

  // Account Management
  const createAccount = async (): Promise<{
    success: boolean;
    data: GSaltAccount;
  }> => {
    return await $fetch("/accounts", {
      method: "POST",
      baseURL: baseUrl,
      headers,
    });
  };

  const getMyAccount = async (): Promise<{
    success: boolean;
    data: GSaltAccount;
  }> => {
    return await $fetch("/accounts/me", {
      baseURL: baseUrl,
      headers,
    });
  };

  const deleteMyAccount = async (): Promise<{
    success: boolean;
    data: null;
  }> => {
    return await $fetch("/accounts/me", {
      method: "DELETE",
      baseURL: baseUrl,
      headers,
    });
  };

  const getAccountById = async (
    id: string
  ): Promise<{ success: boolean; data: GSaltAccount }> => {
    return await $fetch(`/accounts/${id}`, {
      baseURL: baseUrl,
    });
  };

  // Transaction Management
  const getTransactionById = async (
    id: string
  ): Promise<{ success: boolean; data: GSaltTransaction }> => {
    return await $fetch(`/transactions/${id}`, {
      baseURL: baseUrl,
    });
  };

  const getTransactionByRef = async (
    ref: string
  ): Promise<{ success: boolean; data: GSaltTransaction }> => {
    return await $fetch(`/transactions/ref/${ref}`, {
      baseURL: baseUrl,
    });
  };

  const getMyTransactions = async (
    page = 1,
    limit = 10,
    order = "desc",
    orderField = "created_at"
  ): Promise<{
    success: boolean;
    data: {
      items: GSaltTransaction[];
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  }> => {
    return await $fetch("/transactions", {
      baseURL: baseUrl,
      headers,
      query: { page, limit, order, order_field: orderField },
    });
  };

  // Payment Operations
  const topup = async (
    request: GSaltTopupRequest
  ): Promise<{ success: boolean; data: GSaltTransaction }> => {
    return await $fetch("/transactions/topup", {
      method: "POST",
      baseURL: baseUrl,
      headers,
      body: request,
    });
  };

  const transfer = async (
    request: GSaltTransferRequest
  ): Promise<TransferResponse> => {
    return await $fetch("/transactions/transfer", {
      method: "POST",
      baseURL: baseUrl,
      headers,
      body: request,
    });
  };

  const payment = async (
    request: GSaltPaymentRequest
  ): Promise<{ success: boolean; data: GSaltTransaction }> => {
    return await $fetch("/transactions/payment", {
      method: "POST",
      baseURL: baseUrl,
      headers,
      body: request,
    });
  };

  // Withdrawal Management
  const withdraw = async (
    request: GSaltWithdrawalRequest
  ): Promise<WithdrawalResponse> => {
    return await $fetch("/transactions/withdrawal", {
      method: "POST",
      baseURL: baseUrl,
      headers,
      body: request,
    });
  };

  const getBankList = async (): Promise<{
    success: boolean;
    data: BankListResponse[];
  }> => {
    return await $fetch("/transactions/withdrawal/banks", {
      baseURL: baseUrl,
      headers,
    });
  };

  const validateBankAccount = async (
    request: BankAccountInquiryRequest
  ): Promise<BankAccountInquiryResponse> => {
    return await $fetch("/transactions/withdrawal/validate-bank-account", {
      method: "POST",
      baseURL: baseUrl,
      headers,
      body: request,
    });
  };

  const getWithdrawalBalance = async (): Promise<WithdrawalBalanceResponse> => {
    return await $fetch("/transactions/withdrawal/balance", {
      baseURL: baseUrl,
      headers,
    });
  };

  // Payment Methods
  const getPaymentMethods = async (
    query?: PaymentMethodsQuery
  ): Promise<PaymentMethodResponse> => {
    return await $fetch("/transactions/payment-methods", {
      baseURL: baseUrl,
      headers,
      query,
    });
  };

  // Voucher Management
  const getVouchers = async (
    page = 1,
    limit = 10,
    order = "desc",
    orderField = "created_at",
    status?: string
  ): Promise<{
    success: boolean;
    data: {
      items: GSaltVoucher[];
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  }> => {
    return await $fetch("/vouchers", {
      baseURL: baseUrl,
      query: { page, limit, order, order_field: orderField, status },
    });
  };

  const getVoucherById = async (
    id: string
  ): Promise<{ success: boolean; data: GSaltVoucher }> => {
    return await $fetch(`/vouchers/${id}`, {
      baseURL: baseUrl,
    });
  };

  const getVoucherByCode = async (
    code: string
  ): Promise<{ success: boolean; data: GSaltVoucher }> => {
    return await $fetch(`/vouchers/code/${code}`, {
      baseURL: baseUrl,
    });
  };

  const validateVoucher = async (
    code: string
  ): Promise<{
    success: boolean;
    data: { valid: boolean; voucher?: GSaltVoucher };
  }> => {
    return await $fetch(`/vouchers/validate/${code}`, {
      method: "POST",
      baseURL: baseUrl,
    });
  };

  const createVoucher = async (
    request: VoucherCreateRequest
  ): Promise<{ success: boolean; data: GSaltVoucher }> => {
    return await $fetch("/vouchers", {
      method: "POST",
      baseURL: baseUrl,
      headers,
      body: request,
    });
  };

  const updateVoucher = async (
    id: string,
    request: VoucherUpdateRequest
  ): Promise<{ success: boolean; data: GSaltVoucher }> => {
    return await $fetch(`/vouchers/${id}`, {
      method: "PATCH",
      baseURL: baseUrl,
      headers,
      body: request,
    });
  };

  const deleteVoucher = async (
    id: string
  ): Promise<{ success: boolean; data: null }> => {
    return await $fetch(`/vouchers/${id}`, {
      method: "DELETE",
      baseURL: baseUrl,
      headers,
    });
  };

  // Voucher Redemption
  const redeemVoucher = async (
    request: VoucherRedeemRequest
  ): Promise<VoucherRedemptionResponse> => {
    return await $fetch("/voucher-redemptions/redeem", {
      method: "POST",
      baseURL: baseUrl,
      headers,
      body: request,
    });
  };

  const getMyVoucherRedemptions = async (
    page = 1,
    limit = 10,
    order = "desc",
    orderField = "redeemed_at"
  ): Promise<{
    success: boolean;
    data: {
      items: VoucherRedemption[];
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  }> => {
    return await $fetch("/voucher-redemptions/me", {
      baseURL: baseUrl,
      headers,
      query: { page, limit, order, order_field: orderField },
    });
  };

  const getVoucherRedemptionById = async (
    id: string
  ): Promise<{ success: boolean; data: VoucherRedemption }> => {
    return await $fetch(`/voucher-redemptions/${id}`, {
      baseURL: baseUrl,
      headers,
    });
  };

  const getVoucherRedemptionsByVoucherId = async (
    voucherId: string,
    page = 1,
    limit = 10,
    order = "desc",
    orderField = "redeemed_at"
  ): Promise<{
    success: boolean;
    data: {
      items: VoucherRedemption[];
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  }> => {
    return await $fetch(`/voucher-redemptions/voucher/${voucherId}`, {
      baseURL: baseUrl,
      headers,
      query: { page, limit, order, order_field: orderField },
    });
  };

  // API Key Management
  const createApiKey = async (
    request: APIKeyCreateRequest
  ): Promise<{ success: boolean; data: APIKey }> => {
    return await $fetch("/api-keys", {
      method: "POST",
      baseURL: baseUrl,
      headers,
      body: request,
    });
  };

  const getApiKeys = async (): Promise<{
    success: boolean;
    data: APIKey[];
  }> => {
    return await $fetch("/api-keys", {
      baseURL: baseUrl,
      headers,
    });
  };

  const updateApiKey = async (
    id: string,
    request: APIKeyUpdateRequest
  ): Promise<{ success: boolean; data: APIKey }> => {
    return await $fetch(`/api-keys/${id}`, {
      method: "PATCH",
      baseURL: baseUrl,
      headers,
      body: request,
    });
  };

  return {
    // Health Check
    checkHealth,

    // Account Management
    createAccount,
    getMyAccount,
    deleteMyAccount,
    getAccountById,

    // Transaction Management
    getTransactionById,
    getTransactionByRef,
    getMyTransactions,

    // Payment Operations
    topup,
    transfer,
    payment,

    // Withdrawal Management
    withdraw,
    getBankList,
    validateBankAccount,
    getWithdrawalBalance,

    // Payment Methods
    getPaymentMethods,

    // Voucher Management
    getVouchers,
    getVoucherById,
    getVoucherByCode,
    validateVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher,

    // Voucher Redemption
    redeemVoucher,
    getMyVoucherRedemptions,
    getVoucherRedemptionById,
    getVoucherRedemptionsByVoucherId,

    // API Key Management
    createApiKey,
    getApiKeys,
    updateApiKey,
  };
};
