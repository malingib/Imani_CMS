import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';

interface Church { id: string; name: string; slug: string; tier: string; status: string; restrictions?: Record<string, boolean>; billing_status?: string; monthly_fee?: number; billing_period_end?: string | null; suspension_reason?: string | null; }
interface ChurchContextType {
  activeChurchId: string | null;
  setActiveChurchId: (id: string | null) => void;
  churches: Church[];
  fetchChurches: () => void;
  activeChurch: Church | null;
  configurationError: string | null;
}

const CANONICAL_CHURCH_ID = '00000000-0000-0000-0000-000000000001';
const configuredChurchId =
  (import.meta.env.VITE_CHURCH_ID as string | undefined)?.trim() || CANONICAL_CHURCH_ID;

export const ChurchContext = createContext<ChurchContextType>({
  activeChurchId: configuredChurchId,
  setActiveChurchId: () => {},
  churches: [],
  fetchChurches: () => {},
  activeChurch: null,
  configurationError: null,
});
export const useChurch = () => useContext(ChurchContext);

/**
 * Imani is deployed for one church only. The canonical church ID is the default;
 * VITE_CHURCH_ID is retained as an explicit deployment override for a separately
 * provisioned installation. No membership-based tenant discovery or switching
 * occurs in the browser.
 */
export function ChurchProvider({ children, churchId: initialChurchId }: { children: ReactNode; churchId: string | null }) {
  const deploymentChurchId =
    (import.meta.env.VITE_CHURCH_ID as string | undefined)?.trim() ||
    initialChurchId ||
    CANONICAL_CHURCH_ID;
  const [activeChurchId, setResolvedChurchId] = useState<string | null>(deploymentChurchId);
  const [churches, setChurches] = useState<Church[]>([]);
  const [configurationError, setConfigurationError] = useState<string | null>(null);

  const fetchChurches = useCallback(async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      setChurches([]);
      setResolvedChurchId(null);
      setConfigurationError('Unable to verify the signed-in user. Please sign in again.');
      return;
    }
    if (!user) {
      setChurches([]);
      setResolvedChurchId(deploymentChurchId);
      setConfigurationError(null);
      return;
    }

    const { data, error } = await supabase
      .from('churches')
      .select('id, name, slug, tier, status, restrictions, billing_status, monthly_fee, billing_period_end, suspension_reason')
      .eq('id', deploymentChurchId)
      .maybeSingle();

    const isSuperAdmin = user.app_metadata?.role === 'SUPER_ADMIN';
    if (error || !data || data.status === 'archived' || (data.status === 'suspended' && !isSuperAdmin)) {
      setChurches([]);
      setResolvedChurchId(null);
      setConfigurationError(
        'The configured church is unavailable. Verify VITE_CHURCH_ID and the deployment database.'
      );
      return;
    }

    setChurches([data as Church]);
    setResolvedChurchId(data.id);
    setConfigurationError(null);
  }, [deploymentChurchId]);

  const activeChurch = churches.find(c => c.id === activeChurchId) || null;
  useEffect(() => { void fetchChurches(); }, [fetchChurches]);

  // A single-church deployment never permits browser-driven church switching.
  const safeSetActiveChurchId = useCallback((id: string | null) => {
    if (id === deploymentChurchId) setResolvedChurchId(deploymentChurchId);
  }, [deploymentChurchId]);

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
