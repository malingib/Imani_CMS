export type IntegrationProvider = 'daraja' | 'mobiwave_sms';
export type IntegrationScope = { scope: 'platform' } | { scope: 'church'; churchId: string };
export type IntegrationSummary = { provider: IntegrationProvider; enabled: boolean; configured: boolean; updatedAt?: string };
