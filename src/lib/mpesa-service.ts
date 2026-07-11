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
      const err = await res.text();
      return { success: false, message: `Payment failed: ${err}` };
    }

    const data = await res.json();
    return {
      success: true,
      checkoutRequestId: data.checkoutRequestId,
      message: 'STK Push sent to your phone. Enter your PIN to complete.',
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
