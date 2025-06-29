import type { PaymentInstructions, PaymentMethod } from "~/types/gsalt_api";

export const usePaymentInstructions = () => {
  // Basic time utilities
  const formatExpiryTime = (expiryTime: string): string => {
    const expiry = new Date(expiryTime);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) {
      return "Expired";
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours > 0) {
      const remainingMinutes = diffMinutes % 60;
      return `${diffHours}h ${remainingMinutes}m`;
    }

    return `${diffMinutes}m`;
  };

  const isPaymentExpired = (expiryTime?: string): boolean => {
    if (!expiryTime) return false;
    return new Date(expiryTime) <= new Date();
  };

  const getTimeRemaining = (
    expiryTime: string
  ): { hours: number; minutes: number; seconds: number } => {
    const expiry = new Date(expiryTime);
    const now = new Date();
    const diffMs = Math.max(0, expiry.getTime() - now.getTime());

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  // Copy text to clipboard utility
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return successful;
      }
    } catch (error) {
      console.error("Failed to copy text to clipboard:", error);
      return false;
    }
  };

  // Format Virtual Account number for display
  const formatVirtualAccountNumber = (vaNumber: string): string => {
    // Format VA number with spaces for better readability
    return vaNumber.replace(/(\d{4})/g, "$1 ").trim();
  };

  // Enhanced instruction extraction helpers based on API structure
  const getQRISInstructions = (instructions: PaymentInstructions) => {
    return {
      qr_code: instructions.qr_code || instructions.qr_string,
      qr_code_url: instructions.qr_code_url,
      amount: instructions.amount,
      currency: instructions.currency,
      fee_amount: instructions.fee_amount,
      total_amount: instructions.total_amount,
      expiry_time: instructions.expiry_time,
    };
  };

  const getVirtualAccountInstructions = (instructions: PaymentInstructions) => {
    return {
      bank_code:
        instructions.virtual_account?.bank_code || instructions.bank_code,
      account_number:
        instructions.virtual_account?.account_number ||
        instructions.virtual_account_number,
      bank_name: instructions.virtual_account?.bank_name,
      amount: instructions.amount,
      currency: instructions.currency,
      fee_amount: instructions.fee_amount,
      total_amount: instructions.total_amount,
      expiry_time: instructions.expiry_time,
    };
  };

  const getEWalletInstructions = (instructions: PaymentInstructions) => {
    return {
      provider: instructions.ewallet?.provider || instructions.provider_name,
      checkout_url:
        instructions.ewallet?.checkout_url || instructions.checkout_url,
      qr_code: instructions.ewallet?.qr_code,
      deep_link: instructions.ewallet?.deep_link,
      amount: instructions.amount,
      currency: instructions.currency,
      fee_amount: instructions.fee_amount,
      total_amount: instructions.total_amount,
      expiry_time: instructions.expiry_time,
    };
  };

  const getCardInstructions = (instructions: PaymentInstructions) => {
    return {
      checkout_url:
        instructions.card?.checkout_url || instructions.checkout_url,
      payment_form_url: instructions.card?.payment_form_url,
      secure_form_url: instructions.card?.secure_form_url,
      amount: instructions.amount,
      currency: instructions.currency,
      fee_amount: instructions.fee_amount,
      total_amount: instructions.total_amount,
      expiry_time: instructions.expiry_time,
    };
  };

  const getRetailInstructions = (instructions: PaymentInstructions) => {
    return {
      outlet_name: instructions.retail?.outlet_name,
      payment_code:
        instructions.retail?.payment_code || instructions.payment_code,
      instructions:
        instructions.retail?.instructions || instructions.instructions,
      locations: instructions.retail?.locations,
      amount: instructions.amount,
      currency: instructions.currency,
      fee_amount: instructions.fee_amount,
      total_amount: instructions.total_amount,
      expiry_time: instructions.expiry_time,
    };
  };

  const getDirectDebitInstructions = (instructions: PaymentInstructions) => {
    return {
      bank_code: instructions.direct_debit?.bank_code,
      instructions:
        instructions.direct_debit?.instructions || instructions.instructions,
      amount: instructions.amount,
      currency: instructions.currency,
      fee_amount: instructions.fee_amount,
      total_amount: instructions.total_amount,
      expiry_time: instructions.expiry_time,
    };
  };

  return {
    // Time utilities
    formatExpiryTime,
    isPaymentExpired,
    getTimeRemaining,

    // UI utilities
    copyToClipboard,
    formatVirtualAccountNumber,

    // Instruction extraction helpers
    getQRISInstructions,
    getVirtualAccountInstructions,
    getEWalletInstructions,
    getCardInstructions,
    getRetailInstructions,
    getDirectDebitInstructions,
  };
};
