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
    | "voucher_redemption"
    | "gift_in"
    | "gift_out";
  amount_gsalt_units: number;
  currency: string;
  exchange_rate_idr: string;
  payment_amount?: number;
  payment_currency?: string;
  payment_method?:
    | "GSALT_BALANCE"
    | "QRIS"
    | "BANK_TRANSFER"
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "GOPAY"
    | "OVO"
    | "DANA";
  status: "pending" | "completed" | "failed" | "cancelled";
  description?: string;
  source_account_id?: string;
  destination_account_id?: string;
  voucher_code?: string;
  external_reference_id?: string;
  created_at: string;
  completed_at?: string;
}

export interface GSaltVoucher {
  id: string;
  code: string;
  type: "balance" | "loyalty_points" | "discount";
  value: number;
  currency: string;
  description?: string;
  terms_and_conditions?: string;
  status: "active" | "expired" | "redeemed";
  max_redemptions?: number;
  current_redemptions: number;
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
  payment_amount?: number;
  payment_currency?: string;
  payment_method: string;
  external_reference_id?: string;
}

export interface GSaltTransferRequest {
  destination_connect_id: string;
  amount_gsalt: string;
  description?: string;
  external_reference_id?: string;
}

export interface GSaltPaymentRequest {
  amount_gsalt: string;
  description: string;
  external_reference_id?: string;
}

export interface GSaltGiftRequest {
  destination_connect_id: string;
  amount_gsalt: string;
  message?: string;
  external_reference_id?: string;
}
