const LARAVEL_URL = import.meta.env.VITE_LARAVEL_URL || '';

export interface MpesaStkResult {
  success: boolean;
  checkoutRequestId?: string;
  message: string;
}

export async function triggerStkPush(
  amount: number,
  phone: string,
  type: string,
  memberName: string
): Promise<MpesaStkResult> {
  if (!Number.isFinite(amount) || amount <= 0) return { success: false, message: 'Enter a valid amount greater than KES 0.' };
  if (!/^254[17]\d{8}$/.test(phone.replace(/[\s+()-]/g, ''))) return { success: false, message: 'Use a valid Kenyan M-Pesa number beginning with 254.' };
  if (!type.trim() || !memberName.trim()) return { success: false, message: 'Giving details are incomplete. Contact your church administrator.' };
  if (!LARAVEL_URL) {
    return {
      success: false,
      message: 'Payment backend not configured. Contact your admin.',
    };
  }

  try {
    const res = await fetch(`${LARAVEL_URL}/giving/mpesa/stk-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ amount, phone, type, memberName }),
    });

    if (!res.ok) {
      return { success: false, message: 'The payment service rejected the request. No gift has been recorded.' };
    }

    const data = await res.json().catch(() => null) as { success?: boolean; checkoutRequestId?: string; CheckoutRequestID?: string; message?: string } | null;
    const checkoutRequestId = data?.checkoutRequestId || data?.CheckoutRequestID;
    if (data?.success !== true || !checkoutRequestId) {
      return { success: false, message: 'The payment service did not confirm that an M-Pesa prompt was accepted. No gift has been recorded.' };
    }
    return {
      success: true,
      checkoutRequestId,
      message: 'M-Pesa prompt accepted. Complete it on your phone; your gift will appear after payment confirmation.',
    };
  } catch {
    return {
      success: false,
      message: 'Could not reach payment server. Try again later.',
    };
  }
}

export async function testDarajaConnection(): Promise<boolean> {
  if (!LARAVEL_URL) return false;
  try {
    const res = await fetch(`${LARAVEL_URL}/mpesa/status/test`, {
      method: 'GET',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}
