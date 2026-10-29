export const integrationConfigFunctionContract = {
  name: "integration-config",
  requiredServerSecret: "INTEGRATION_ENCRYPTION_KEY",
  providers: ["daraja", "mobiwave_sms"],
  scopes: ["platform", "church"],
} as const;
