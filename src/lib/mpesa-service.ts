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
  if (!Number.isSafeInteger(amount) || amount <= 0) return { success: false, message: 'Enter a valid amount greater than KES 0.' };
  const normalizedPhone = normalizeKenyanPhone(phone);
  if (!normalizedPhone) return { success: false, message: 'Use a valid Kenyan M-Pesa number, such as 0712345678 or 254712345678.' };
  if (!type.trim() || !memberName.trim()) return { success: false, message: 'Giving details are incomplete. Contact your church administrator.' };
  return {
    success: false,
    message: 'M-Pesa payments are not available yet. No payment prompt was sent and no gift was recorded.',
  };
}
