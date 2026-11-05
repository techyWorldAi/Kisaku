export const normalizePhone = (num: string): string => {
  let cleaned = num.trim();
  if (cleaned.startsWith("07")) {
    return "254" + cleaned.substring(1);
  } else if (cleaned.startsWith("+254")) {
    return cleaned.substring(1);
  } else if (cleaned.startsWith("254")) {
    return cleaned;
  }
  return cleaned;
};

export interface MpesaResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class PaymentService {
  static async processMpesaPayment(phone: string, amount: number): Promise<MpesaResponse> {
    const normalizedPhone = normalizePhone(phone);
    
    // Ensure amount is an integer (M-Pesa expects whole numbers)
    const amountInt = Math.round(amount);

    try {
      const res = await fetch("https://mpesaapi-sbss.onrender.com/mpesa/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone,
          amount: amountInt,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        return {
          success: true,
          message: "Payment initiated successfully. Check your phone to complete the transaction.",
          data
        };
      } else {
        return {
          success: false,
          message: data.message || "Payment failed. Please try again.",
          data
        };
      }
    } catch (error) {
      console.error('MPesa payment error:', error);
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
      };
    }
  }

  static validatePhone(phone: string): string | null {
    const normalized = normalizePhone(phone);
    const phoneRegex = /^254[17]\d{8}$/;
    if (!phoneRegex.test(normalized)) {
      return "Please enter a valid Kenyan phone number";
    }
    return null;
  }
}