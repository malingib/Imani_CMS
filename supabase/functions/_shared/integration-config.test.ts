import {
  validateMpesaSettings,
  validateMobiWaveSettings,
  validateProvider,
  validateProviderSecrets,
  validateScope,
} from './integration-config.ts';

Deno.test('validates supported integration scopes and providers', () => {
  if (!validateScope('platform') || !validateScope('church') || validateScope('global')) throw new Error('scope validation failed');
  if (!validateProvider('mpesa') || !validateProvider('mobiwave') || validateProvider('paystack')) throw new Error('provider validation failed');
});

Deno.test('validates Daraja and MobiWave fields from provider docs', () => {
  if (!validateMpesaSettings({ environment: 'sandbox', shortcode: '174379', transactionType: 'CustomerPayBillOnline', accountReference: 'TITHE' })) throw new Error('valid Daraja settings rejected');
  if (validateMpesaSettings({ environment: 'live', shortcode: '174379', transactionType: 'CustomerPayBillOnline', accountReference: 'TITHE' })) throw new Error('invalid Daraja environment accepted');
  if (!validateMobiWaveSettings({ senderId: 'IMANICMS' })) throw new Error('valid sender ID rejected');
  if (validateMobiWaveSettings({ senderId: 'SENDER-ID-TOO-LONG' })) throw new Error('overlong sender ID accepted');
});

Deno.test('requires every secret for a provider before saving', () => {
  if (!validateProviderSecrets('mpesa', { consumerKey: 'key', consumerSecret: 'secret', passkey: 'passkey' })) throw new Error('valid Daraja credentials rejected');
  if (validateProviderSecrets('mpesa', { consumerKey: 'key', consumerSecret: 'secret' })) throw new Error('incomplete Daraja credentials accepted');
  if (!validateProviderSecrets('mobiwave', { apiToken: 'token' })) throw new Error('valid MobiWave token rejected');
  if (validateProviderSecrets('mobiwave', {})) throw new Error('missing MobiWave token accepted');
});
