export type IntegrationProvider = 'mpesa' | 'mobiwave';
export type IntegrationScope = 'platform' | 'church';

export type MpesaSettings = {
  environment: 'sandbox' | 'production';
  shortcode: string;
  transactionType: 'CustomerPayBillOnline' | 'CustomerBuyGoodsOnline';
  accountReference: string;
};

export type MobiWaveSettings = { senderId: string };

export function validateProvider(value: unknown): value is IntegrationProvider {
  return value === 'mpesa' || value === 'mobiwave';
}

export function validateScope(value: unknown): value is IntegrationScope {
  return value === 'platform' || value === 'church';
}

export function validateMpesaSettings(value: unknown): value is MpesaSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as Record<string, unknown>;
  return (settings.environment === 'sandbox' || settings.environment === 'production')
    && typeof settings.shortcode === 'string'
    && /^\d{5,9}$/.test(settings.shortcode)
    && (settings.transactionType === 'CustomerPayBillOnline' || settings.transactionType === 'CustomerBuyGoodsOnline')
    && typeof settings.accountReference === 'string'
    && /^[A-Za-z0-9 ._-]{1,20}$/.test(settings.accountReference);
}

export function validateMobiWaveSettings(value: unknown): value is MobiWaveSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as Record<string, unknown>;
  return typeof settings.senderId === 'string' && /^[A-Za-z0-9]{1,11}$/.test(settings.senderId);
}

export function validateProviderSecrets(provider: IntegrationProvider, value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const secrets = value as Record<string, unknown>;
  const validSecret = (key: string) => typeof secrets[key] === 'string' && (secrets[key] as string).length > 0 && (secrets[key] as string).length <= 4096;
  return provider === 'mpesa'
    ? validSecret('consumerKey') && validSecret('consumerSecret') && validSecret('passkey')
    : validSecret('apiToken');
}
