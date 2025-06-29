// GSALT Types
export interface GSaltAccount {
  connect_id: string;
  balance: number; // Balance in GSALT units
  points: number;
  created_at: string;
  updated_at: string;
}

export interface GSaltTransaction {
  id: string;
  account_id: string;
  type:
    | "topup"
    | "transfer_in"
    | "transfer_out"
    | "payment"
    | "withdrawal"
    | "voucher_redemption"
    | "gift_in"
    | "gift_out";
  amount_gsalt_units: number;
  total_amount_gsalt_units?: number; // Amount + fees
  fee_amount_gsalt_units?: number; // Fee amount
  currency: string;
  exchange_rate_idr: string;
  payment_amount?: number;
  payment_currency?: string;
  payment_method?: PaymentMethod;
  status: "pending" | "completed" | "failed" | "cancelled" | "processing";
  description?: string;
  source_account_id?: string;
  destination_account_id?: string;
  voucher_code?: string;
  external_reference_id?: string;
  payment_instructions?: PaymentInstructions;
  created_at: string;
  completed_at?: string;
  updated_at?: string;
}

// Comprehensive Payment Methods
export type PaymentMethod =
  // Internal
  | "GSALT_BALANCE"
  // QRIS
  | "QRIS"
  // Virtual Account
  | "VA_BCA"
  | "VA_BNI"
  | "VA_BRI"
  | "VA_MANDIRI"
  | "VA_CIMB"
  | "VA_PERMATA"
  | "VA_BSI"
  | "VA_DANAMON"
  | "VA_MAYBANK"
  // E-Wallet
  | "EWALLET_OVO"
  | "EWALLET_DANA"
  | "EWALLET_GOPAY"
  | "EWALLET_LINKAJA"
  | "EWALLET_SHOPEEPAY"
  // Cards
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  // Retail Outlets
  | "RETAIL_ALFAMART"
  | "RETAIL_INDOMARET"
  | "RETAIL_CIRCLEK"
  | "RETAIL_LAWSON"
  | "RETAIL_DANDANPAY"
  // Direct Debit
  | "DIRECT_DEBIT"
  // Bank Transfer
  | "BANK_TRANSFER"
  // Legacy support
  | "VIRTUAL_ACCOUNT"
  | "EWALLET"
  | "RETAIL_OUTLET"
  | "CARDLESS_CREDIT"
  | "CARD"
  | "GOPAY"
  | "OVO"
  | "DANA";

// Enhanced Payment instructions from payment gateway
export interface PaymentInstructions {
  // Payment Request Info
  payment_request_id?: string;
  status?: string;
  amount?: number;
  currency?: string;
  fee_amount?: number;
  total_amount?: number;
  expiry_time?: string;
  created_at?: string;

  // QRIS Instructions
  qr_code?: string;
  qr_string?: string;
  qr_code_url?: string;

  // Virtual Account Instructions
  bank_code?: string;
  virtual_account?: {
    bank_code: string;
    account_number: string;
    bank_name: string;
  };
  virtual_account_number?: string; // Legacy support

  // E-Wallet Instructions
  ewallet?: {
    provider: string;
    checkout_url: string;
    qr_code?: string;
    deep_link?: string;
  };
  provider_name?: string; // Legacy support
  checkout_url?: string; // Legacy support

  // Card Payment Instructions
  card?: {
    checkout_url: string;
    payment_form_url: string;
    secure_form_url: string;
  };

  // Retail Outlet Instructions
  retail?: {
    outlet_name: string;
    payment_code: string;
    instructions: string;
    locations?: string[];
  };
  payment_code?: string; // Legacy support

  // Direct Debit Instructions
  direct_debit?: {
    bank_code: string;
    instructions: string;
  };

  // General Instructions
  instructions?: string;
  notes?: string;

  // Raw response from payment gateway
  raw_response?: Record<string, any>;
}

// Payment Method Information
export interface PaymentMethodInfo {
  method: PaymentMethod;
  name: string;
  type:
    | "internal"
    | "qris"
    | "virtual_account"
    | "ewallet"
    | "card"
    | "retail"
    | "direct_debit"
    | "bank_transfer";
  icon: string;
  description: string;
  fee: number; // Fee in GSALT units
  fee_description: string;
  minimum_amount?: number;
  maximum_amount?: number;
  available: boolean;
}

// Topup Response with Payment Instructions
export interface TopupResponse {
  transaction: GSaltTransaction;
  payment_instructions?: PaymentInstructions;
}

// Payment Response
export interface PaymentResponse {
  transaction: GSaltTransaction;
  payment_instructions?: PaymentInstructions;
}

export interface GSaltVoucher {
  id: string;
  code: string;
  name: string;
  type: "balance" | "loyalty_points" | "discount";
  value: string;
  currency: string;
  loyalty_points_value?: number;
  discount_percentage?: number;
  discount_amount?: string;
  description?: string;
  terms_and_conditions?: string;
  status: "active" | "expired" | "redeemed";
  max_redeem_count?: number;
  current_redeem_count: number;
  valid_from: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export interface GSaltVoucherRedemption {
  id: string;
  voucher_id: string;
  account_id: string;
  transaction_id: string;
  redeemed_at: string;
}

export interface GSaltTopupRequest {
  amount_gsalt: string;
  payment_method?: PaymentMethod;
  payment_currency?: string;
  payment_amount?: number;
  external_reference_id?: string;
}

export interface GSaltTransferRequest {
  destination_account_id: string;
  destination_connect_id?: string; // Support both ways
  amount_gsalt: string;
  description?: string;
  external_reference_id?: string;
}

export interface GSaltPaymentRequest {
  amount_gsalt: string;
  payment_method?: PaymentMethod;
  description: string;
  merchant_id?: string;
  external_reference_id?: string;
}

export interface GSaltGiftRequest {
  destination_account_id?: string;
  destination_connect_id: string;
  amount_gsalt: string;
  message?: string;
  external_reference_id?: string;
}

export interface GSaltWithdrawalRequest {
  amount_gsalt: string;
  bank_code: string;
  account_number: string;
  recipient_name: string;
  description?: string;
  external_reference_id?: string;
}

// Bank Information
export interface BankInfo {
  code: string;
  name: string;
  available: boolean;
}

// Bank Account Validation
export interface BankAccountValidation {
  valid: boolean;
  account_holder_name?: string;
  bank_name?: string;
}

// Withdrawal Balance
export interface WithdrawalBalance {
  balance_gsalt_units: number;
  balance_gsalt: string;
  balance_idr: string;
}

// Enhanced error response
export interface GSaltError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Error codes for better error handling
export enum GSaltErrorCode {
  ACCOUNT_NOT_REGISTERED = "ACCOUNT_NOT_REGISTERED",
  UNAUTHORIZED = "UNAUTHORIZED",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  DAILY_LIMIT_EXCEEDED = "DAILY_LIMIT_EXCEEDED",
  AMOUNT_BELOW_MINIMUM = "AMOUNT_BELOW_MINIMUM",
  AMOUNT_ABOVE_MAXIMUM = "AMOUNT_ABOVE_MAXIMUM",
  INVALID_PAYMENT_METHOD = "INVALID_PAYMENT_METHOD",
  PAYMENT_EXPIRED = "PAYMENT_EXPIRED",
  BANK_ACCOUNT_INVALID = "BANK_ACCOUNT_INVALID",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  NETWORK_ERROR = "NETWORK_ERROR",
}

// Health check response
export interface GSaltHealthCheck {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version: string;
  services: {
    database: "up" | "down";
    flip: "up" | "down";
    [key: string]: "up" | "down";
  };
}

// Voucher validation response
export interface VoucherValidation {
  valid: boolean;
  voucher?: GSaltVoucher;
  message?: string;
}

// Transaction confirmation request
export interface TransactionConfirmRequest {
  external_payment_id?: string;
}

// Transaction rejection request
export interface TransactionRejectRequest {
  reason?: string;
}
