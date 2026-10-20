const LARAVEL_URL = import.meta.env.VITE_LARAVEL_URL || '';

function normalizeKenyanPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
  if (/^[17]\d{8}$/.test(digits)) return '254' + digits;
  return '';
}

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
  const normalizedPhone = normalizeKenyanPhone(phone);
  if (!normalizedPhone) return { success: false, message: 'Use a valid Kenyan M-Pesa number, such as 0712345678 or 254712345678.' };
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
      body: JSON.stringify({ amount, phone: normalizedPhone, type, memberName }),
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
