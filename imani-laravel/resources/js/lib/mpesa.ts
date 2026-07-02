async function postMpesa<T = Record<string, unknown>>(
  endpoint: string,
  data: Record<string, unknown> = {},
): Promise<T> {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-TOKEN': token,
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'same-origin',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `M-Pesa request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function pollMpesaStatus(
  checkoutRequestId: string,
  { attempts = 30, intervalMs = 2000 } = {},
): Promise<{ status: string; receipt?: string }> {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(`/mpesa/status/${checkoutRequestId}`, {
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'same-origin',
    });

    if (!res.ok) {
      throw new Error('Failed to check payment status');
    }

    const data = (await res.json()) as { status: string; receipt?: string };

    if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
      return data;
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error('Payment confirmation timed out. Check your M-Pesa messages.');
}

export const mpesa = {
  stkPushGiving: (amount: number, giftType: string, phone?: string) =>
    postMpesa<{ message: string; checkoutRequestId: string }>('/giving/mpesa/stk-push', {
      amount,
      gift_type: giftType,
      phone,
    }),

  stkPushSubscription: (phone: string) =>
    postMpesa<{ message: string; checkoutRequestId: string; amount: number }>(
      '/billing/mpesa/stk-push',
      { phone },
    ),

  stkPushInvoice: (invoiceId: string, phone: string) =>
    postMpesa<{ message: string; checkoutRequestId: string; amount: number }>(
      '/billing/mpesa/invoice',
      { invoice_id: invoiceId, phone },
    ),
};
