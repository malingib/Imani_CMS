type SupabaseLikeClient = { from(table: string): any };
import { attachMemberCounts, createChurchSlug, provisionTenantChurch } from "./tenant-provisioning";

export type OnboardingStep = {
  id: string;
  label: string;
  completed: boolean;
};

export type ChurchWithOnboarding = {
  id: string;
  name: string;
  slug: string;
  tier: string;
  status: string;
  trialEndDate: string | null;
  onboardingStep: string;
  createdAt: string;
  memberCount?: number;
};

export type OnboardingStatus = {
  churchId: string;
  completedSteps: string[];
  steps: OnboardingStep[];
};

type CreateTenantInput = {
  name: string;
  slug?: string;
  tier: string;
  adminEmail?: string;
};

const DEFAULT_ONBOARDING_STEPS: OnboardingStep[] = [
  { id: "welcome", label: "Welcome Screen", completed: false },
  { id: "profile", label: "Church Profile", completed: false },
  { id: "members", label: "Add Members", completed: false },
  { id: "giving", label: "Setup Giving", completed: false },
  { id: "complete", label: "Go Live", completed: false },
];

function mapToChurch(row: Record<string, unknown>): ChurchWithOnboarding {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    tier: row.tier as string,
    status: row.status as string,
    trialEndDate: (row.trial_end_date as string) || null,
    onboardingStep: (row.onboarding_step as string) || "welcome",
    createdAt: (row.created_at as string) || "",
    memberCount: typeof row.member_count === "number" ? row.member_count as number : undefined,
  };
}

export function createTenantOnboardingService(client: SupabaseLikeClient) {
  return {
    async createTenantWithOnboarding(input: CreateTenantInput) {
      const church = await provisionTenantChurch(client, { ...input, onboardingStep: "welcome" });

      return {
        church: mapToChurch(church),
        onboardingStep: "welcome" as const,
      };
    },

    async getOnboardingStatus(churchId: string): Promise<OnboardingStatus> {
      const { data, error } = await client.from("churches").select("onboarding_step").eq("id", churchId).maybeSingle();
      if (error) throw new Error(error.message);
      const currentStep = (data?.onboarding_step as string) || "welcome";
      const stepOrder = DEFAULT_ONBOARDING_STEPS.map((s) => s.id);
      const currentIdx = stepOrder.indexOf(currentStep);

      return {
        churchId,
        completedSteps: stepOrder.slice(0, currentIdx),
        steps: DEFAULT_ONBOARDING_STEPS.map((step, i) => ({
          ...step,
          completed: i < currentIdx,
        })),
      };
    },

    async completeOnboardingStep(churchId: string, stepId: string): Promise<void> {
      // Fetch current onboarding step from DB to prevent caller from skipping or regressing
      const { data: church, error: fetchErr } = await client
        .from("churches")
        .select("onboarding_step")
        .eq("id", churchId)
        .maybeSingle();
      if (fetchErr) throw new Error(fetchErr.message);
      if (!church) throw new Error("Church not found");

      const currentStep = (church.onboarding_step as string) || "welcome";
      const stepOrder = DEFAULT_ONBOARDING_STEPS.map((s) => s.id);
      const currentIdx = stepOrder.indexOf(currentStep);
      const requestedIdx = stepOrder.indexOf(stepId);

      if (requestedIdx === -1) throw new Error(`Unknown step: ${stepId}`);
      if (requestedIdx !== currentIdx) throw new Error(`Step "${stepId}" cannot be completed now; current step is "${currentStep}"`);

      const nextStep = currentIdx + 1 < stepOrder.length ? stepOrder[currentIdx + 1] : stepOrder[currentIdx];

      const { error } = await client.from("churches").update({ onboarding_step: nextStep }).eq("id", churchId);
      if (error) throw new Error(error.message);
    },

    async listChurchesWithOnboardingStatus(): Promise<ChurchWithOnboarding[]> {
      const { data, error } = await client.from("churches").select("*").order("name");
      if (error) throw new Error(error.message);

      const churches = (data || []) as Record<string, unknown>[];
      const withCounts = await attachMemberCounts(client, churches);
      return withCounts.map((church) => ({ ...mapToChurch(church), memberCount: church.memberCount }));
    },
  };
}
