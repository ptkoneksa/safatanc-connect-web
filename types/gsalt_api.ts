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
    | "TOPUP"
    | "TRANSFER_IN"
    | "TRANSFER_OUT"
    | "PAYMENT"
    | "WITHDRAWAL"
    | "VOUCHER_REDEMPTION";
  amount_gsalt_units: number;
  fee_amount_gsalt_units?: number;
  total_amount_gsalt_units?: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  payment_method?: PaymentMethodCode;
  external_payment_id?: string;
  payment_instructions?: PaymentInstructions;
  description?: string;
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
  code: PaymentMethodCode;
  name: string;
  type: "PAYMENT" | "TOPUP" | "WITHDRAWAL";
  provider_code: string;
  currency: string;
  min_amount: number;
  max_amount: number;
  fee_percentage: string;
  fee_fixed: number;
  fee_min: number;
  fee_max: number;
  is_available_for_topup: boolean;
  is_available_for_payment: boolean;
  status: "ACTIVE" | "INACTIVE";
}

export interface PaymentMethodResponse {
  success: boolean;
  data: PaymentMethod[];
}

export interface PaymentInstructions {
  link_id: number;
  link_url: string;
  payment_url: string;
  status: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  instructions: string;
  expiry_time?: string;
  qr_string?: string;
  bank_code?: string;
  virtual_account_number?: string;
  checkout_url?: string;
  payment_code?: string;
}

export interface TopupResponse {
  transaction: GSaltTransaction;
  payment_instructions: PaymentInstructions;
}

export interface PaymentResponse {
  transaction: GSaltTransaction;
  payment_instructions: PaymentInstructions;
}

export interface GSaltTopupRequest {
  amount_gsalt: string;
  payment_method: PaymentMethodCode;
  payment_amount: number;
  payment_currency: string;
  external_reference_id?: string;
}

export interface GSaltTransferRequest {
  destination_account_id: string;
  amount_gsalt: string;
  description?: string;
}

export interface GSaltPaymentRequest {
  amount_gsalt_units: number;
  payment_method: PaymentMethodCode;
  customer_name: string;
  customer_email: string;
}

export interface GSaltWithdrawalRequest {
  amount_gsalt: string;
  bank_code: string;
  account_number: string;
  recipient_name: string;
  description?: string; // Optional description field
}

// Add withdrawal response type
export interface WithdrawalResponse {
  transaction: GSaltTransaction;
  disbursement_id: string;
  status: string;
  estimated_time: string;
}

// Add transfer response type
export interface TransferResponse {
  transfer_out: GSaltTransaction;
  transfer_in: GSaltTransaction;
}

export interface BankInfo {
  bank_code: string;
  bank_name: string;
  available: boolean;
}

export interface BankAccountValidation {
  valid: boolean;
  account_holder_name?: string;
}

export interface WithdrawalBalance {
  available_balance: number;
}

export interface GSaltVoucher {
  id: string;
  code: string;
  title: string;
  description: string;
  amount_gsalt_units: number;
  status: "ACTIVE" | "EXPIRED" | "REDEEMED";
  created_at: string;
  updated_at: string;
}

export interface VoucherValidation {
  valid: boolean;
  voucher?: GSaltVoucher;
  message?: string;
}

export interface TransactionConfirmRequest {
  external_payment_id: string;
}

export interface TransactionRejectRequest {
  reason: string;
}

// Error codes from API documentation
export enum GSaltErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  ACCOUNT_NOT_REGISTERED = "ACCOUNT_NOT_REGISTERED",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  INVALID_PAYMENT_METHOD = "INVALID_PAYMENT_METHOD",
  BANK_ACCOUNT_INVALID = "BANK_ACCOUNT_INVALID",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
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
