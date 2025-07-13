// GSALT Types
export interface GSaltAccount {
  connect_id: string;
  balance: number;
  points: number;
  account_type: "PERSONAL" | "BUSINESS";
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  kyc_status: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  created_at: string;
  updated_at: string;
}

export interface GSaltTransaction {
  id: string;
  account_id: string;
  type:
    | "TOPUP"
    | "TRANSFER_IN"
    | "TRANSFER_OUT"
    | "PAYMENT"
    | "WITHDRAWAL"
    | "VOUCHER_REDEMPTION";
  currency: "GSALT";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  description?: string;
  amount_gsalt_units: number;
  exchange_rate_idr?: string;
  payment_amount?: number;
  payment_currency?: string;
  payment_method?: PaymentMethodCode;
  fee_gsalt_units?: number;
  total_amount_gsalt_units?: number;
  payment_status?: string;
  payment_initiated_at?: string;
  payment_completed_at?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  payment_details?: PaymentDetails;
}

export interface PaymentDetails {
  id: string;
  transaction_id: string;
  provider: string;
  provider_payment_id?: string;
  payment_url?: string;
  qr_code?: string;
  virtual_account_number?: string;
  virtual_account_bank?: string;
  retail_outlet_code?: string;
  retail_payment_code?: string;
  card_token?: string;
  expiry_time?: string;
  payment_time?: string;
  provider_fee_amount?: number;
  status_history?: string;
  raw_provider_response?: string;
  created_at: string;
  updated_at: string;
}

// Payment Methods based on API documentation
export type PaymentMethodCode =
  | "QRIS"
  | "VA_BCA"
  | "VA_BNI"
  | "VA_BRI"
  | "VA_MANDIRI"
  | "VA_CIMB"
  | "VA_PERMATA"
  | "VA_BSI"
  | "VA_DANAMON"
  | "VA_MAYBANK"
  | "EWALLET_OVO"
  | "EWALLET_DANA"
  | "EWALLET_GOPAY"
  | "EWALLET_LINKAJA"
  | "EWALLET_SHOPEEPAY";

export interface PaymentMethod {
  id: string;
  name: string;
  code: PaymentMethodCode;
  currency: string;
  method_type: string;
  provider_code: string;
  payment_fee_flat: number;
  payment_fee_percent: string;
  withdrawal_fee_flat: number;
  withdrawal_fee_percent: string;
  is_active: boolean;
  is_available_for_topup: boolean;
  is_available_for_withdrawal: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodsQuery {
  currency?: string;
  is_active?: boolean;
  is_available_for_topup?: boolean;
  is_available_for_withdrawal?: boolean;
}

export interface PaymentMethodResponse {
  success: boolean;
  data: PaymentMethod[];
}

export interface GSaltTopupRequest {
  amount_gsalt: string;
  payment_amount: number;
  payment_currency: string;
  payment_method: PaymentMethodCode;
  external_reference_id?: string;
  payment_details?: {
    provider: string;
    payment_url: string;
    expiry_time: string;
  };
}

export interface GSaltTransferRequest {
  destination_account_id: string;
  amount_gsalt: string;
  description?: string;
}

export interface GSaltPaymentRequest {
  account_id: string;
  amount_gsalt_units: number;
  payment_method: PaymentMethodCode;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  redirect_url: string;
  payment_details?: {
    provider: string;
    payment_url: string;
    expiry_time: string;
  };
}

export interface GSaltWithdrawalRequest {
  amount_gsalt: string;
  bank_code: string;
  account_number: string;
  recipient_name: string;
  description?: string;
  external_reference_id?: string;
}

export interface WithdrawalResponse {
  success: boolean;
  data: {
    transaction: GSaltTransaction;
    disbursement_id: string;
    estimated_time: string;
    status: string;
  };
}

export interface TransferResponse {
  success: boolean;
  data: {
    transfer_out: GSaltTransaction;
    transfer_in: GSaltTransaction;
  };
}

export interface BankListResponse {
  bank_code: string;
  bank_name: string;
  is_active: boolean;
}

export interface BankAccountInquiryRequest {
  bank_code: string;
  account_number: string;
}

export interface BankAccountInquiryResponse {
  success: boolean;
  data: {
    account_number: string;
    account_holder: string;
    bank_code: string;
  };
}

export interface WithdrawalBalanceResponse {
  success: boolean;
  data: {
    balance_gsalt_units: number;
    balance_gsalt: string;
    balance_idr: string;
  };
}

export interface GSaltVoucher {
  id: string;
  code: string;
  name: string;
  description: string;
  type: "BALANCE";
  value: string;
  currency: "GSALT";
  max_redeem_count: number;
  current_redeem_count: number;
  valid_from: string;
  valid_until: string;
  status: "ACTIVE" | "INACTIVE" | "REDEEMED" | "EXPIRED";
  created_at: string;
  updated_at: string;
}

export interface VoucherCreateRequest {
  code: string;
  name: string;
  description: string;
  type: "BALANCE";
  value: string;
  currency: "GSALT";
  max_redeem_count: number;
  valid_from: string;
  valid_until: string;
}

export interface VoucherUpdateRequest extends Partial<VoucherCreateRequest> {}

export interface VoucherRedeemRequest {
  code: string;
  account_id: string;
}

export interface VoucherRedemption {
  id: string;
  voucher_id: string;
  voucher_code: string;
  account_id: string;
  redeemed_at: string;
  status: "COMPLETED" | "CANCELLED";
  transaction_id: string;
}

export interface VoucherRedemptionResponse {
  success: boolean;
  data: {
    redemption: VoucherRedemption;
    transaction: GSaltTransaction;
  };
}

export interface APIKeyCreateRequest {
  key_name: string;
  scopes: Array<"READ" | "WRITE" | "PAYMENT">;
  rate_limit: number;
  expires_at: string;
}

export interface APIKeyUpdateRequest extends Partial<APIKeyCreateRequest> {}

export interface APIKey {
  id: string;
  merchant_id: string;
  key_name: string;
  api_key?: string;
  prefix: string;
  scopes: Array<"READ" | "WRITE" | "PAYMENT">;
  rate_limit: number;
  last_used_at?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

// Error codes from API documentation
export enum GSaltErrorCode {
  INVALID_REQUEST = "INVALID_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

// Health check response
export interface GSaltHealthCheck {
  success: boolean;
  data: string;
}
