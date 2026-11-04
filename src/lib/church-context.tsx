import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';

interface Church {
  id: string;
  name: string;
  slug: string;
  tier: string;
  status: string;
  restrictions?: Record<string, boolean>;
  billing_status?: string;
  monthly_fee?: number;
  billing_period_end?: string | null;
  suspension_reason?: string | null;
}

interface ChurchContextType {
  activeChurchId: string | null;
  setActiveChurchId: (id: string | null) => void;
  churches: Church[];
  fetchChurches: () => Promise<void>;
  activeChurch: Church | null;
  configurationError: string | null;
}

const STAFF_ROLES = new Set(['ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'STAFF']);
const CHURCH_FIELDS = 'id, name, slug, tier, status, restrictions, billing_status, monthly_fee, billing_period_end, suspension_reason';

export const ChurchContext = createContext<ChurchContextType>({
  activeChurchId: null,
  setActiveChurchId: () => {},
  churches: [],
  fetchChurches: async () => {},
  activeChurch: null,
  configurationError: null,
});

export const useChurch = () => useContext(ChurchContext);

/**
 * Platform owners can discover and switch between all client workspaces.
 * Church users are scoped to the single active staff membership provisioned
 * in server-managed app_metadata and revalidated by database RLS.
 */
export function ChurchProvider({ children }: { children: ReactNode; churchId: string | null }) {
  const [activeChurchId, setResolvedChurchId] = useState<string | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);
  const [configurationError, setConfigurationError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [assignedChurchId, setAssignedChurchId] = useState<string | null>(null);

  const fetchChurches = useCallback(async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      setChurches([]);
      setResolvedChurchId(null);
      setAssignedChurchId(null);
      setIsSuperAdmin(false);
      setConfigurationError('Unable to verify the signed-in user. Please sign in again.');
      return;
    }

    if (!user) {
      setChurches([]);
      setResolvedChurchId(null);
      setAssignedChurchId(null);
      setIsSuperAdmin(false);
      setConfigurationError(null);
      return;
    }

    const appRole = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : '';
    const superAdmin = appRole === 'SUPER_ADMIN';
    setIsSuperAdmin(superAdmin);

    if (superAdmin) {
      const { data, error } = await supabase
        .from('churches')
        .select(CHURCH_FIELDS)
        .order('name');

      if (error) {
        setChurches([]);
        setResolvedChurchId(null);
        setAssignedChurchId(null);
        setConfigurationError('Unable to load client workspaces. Check platform-owner permissions.');
        return;
      }

      const available = ((data || []) as Church[]).filter(church => church.status !== 'archived');
      setChurches(available);
      setAssignedChurchId(null);
      setResolvedChurchId(previous => previous && available.some(church =>
        church.id === previous && ['active', 'trialing', 'onboarding'].includes(church.status)
      ) ? previous : null);
      setConfigurationError(null);
      return;
    }

    if (!STAFF_ROLES.has(appRole)) {
      setChurches([]);
      setResolvedChurchId(null);
      setAssignedChurchId(null);
      setConfigurationError('This account does not have a church staff role. Member self-service is not available.');
      return;
    }

    const appChurchId = typeof user.app_metadata?.church_id === 'string'
      ? user.app_metadata.church_id.trim()
      : '';
    if (!appChurchId) {
      setChurches([]);
      setResolvedChurchId(null);
      setAssignedChurchId(null);
      setConfigurationError('This staff account has no assigned client workspace. Contact the platform owner.');
      return;
    }

    const { data: membership, error: membershipError } = await supabase
      .from('church_memberships')
      .select('church_id, role, status')
      .eq('user_id', user.id)
      .eq('church_id', appChurchId)
      .eq('status', 'active')
      .maybeSingle();

    if (membershipError || !membership || membership.role !== appRole) {
      setChurches([]);
      setResolvedChurchId(null);
      setAssignedChurchId(null);
      setConfigurationError('No matching active church staff membership was found. Contact the platform owner.');
      return;
    }

    const { data: churchRecord, error: churchError } = await supabase
      .from('churches')
      .select(CHURCH_FIELDS)
      .eq('id', membership.church_id)
      .maybeSingle();

    if (churchError || !churchRecord || !['active', 'trialing', 'onboarding'].includes(churchRecord.status)) {
      setChurches([]);
      setResolvedChurchId(null);
      setAssignedChurchId(null);
      setConfigurationError('Your church workspace is unavailable or suspended. Contact the platform owner.');
      return;
    }

    const church = churchRecord as Church;
    setChurches([church]);
    setAssignedChurchId(church.id);
    setResolvedChurchId(church.id);
    setConfigurationError(null);
  }, []);

  const safeSetActiveChurchId = useCallback((id: string | null) => {
    if (isSuperAdmin) {
      if (id === null) {
        setResolvedChurchId(null);
        return;
      }
      if (churches.some(church => church.id === id && ['active', 'trialing', 'onboarding'].includes(church.status))) {
        setResolvedChurchId(id);
      }
      return;
    }

    if (id === null || id === assignedChurchId) {
      setResolvedChurchId(assignedChurchId);
    }
  }, [isSuperAdmin, churches, assignedChurchId]);

  const activeChurch = churches.find(church => church.id === activeChurchId) || null;

  useEffect(() => {
    void fetchChurches();
  }, [fetchChurches]);

  return (
    <ChurchContext.Provider value={{
      activeChurchId,
      setActiveChurchId: safeSetActiveChurchId,
      churches,
      fetchChurches,
      activeChurch,
      configurationError,
    }}>
      {children}
    </ChurchContext.Provider>
  );
}
