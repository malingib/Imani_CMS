import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';

interface Church { id: string; name: string; slug: string; tier: string; status: string; }
interface ChurchContextType {
  activeChurchId: string | null;
  setActiveChurchId: (id: string | null) => void;
  churches: Church[];
  fetchChurches: () => void;
  activeChurch: Church | null;
  configurationError: string | null;
}

const configuredChurchId = (import.meta.env.VITE_CHURCH_ID as string | undefined)?.trim() || null;

export const ChurchContext = createContext<ChurchContextType>({
  activeChurchId: configuredChurchId,
  setActiveChurchId: () => {},
  churches: [],
  fetchChurches: () => {},
  activeChurch: null,
  configurationError: null,
});
export const useChurch = () => useContext(ChurchContext);

/** One church per installation. A configured ID pins this deployment; otherwise
 * ordinary users are resolved only when they have exactly one active membership. */
export function ChurchProvider({ children, churchId: initialChurchId }: { children: ReactNode; churchId: string | null }) {
  const deploymentChurchId = configuredChurchId || initialChurchId;
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
      setResolvedChurchId(null);
      setConfigurationError(null);
      return;
    }

    if (deploymentChurchId) {
      const { data, error } = await supabase
        .from('churches')
        .select('id, name, slug, tier, status')
        .eq('id', deploymentChurchId)
        .maybeSingle();
      if (error || !data) {
        setChurches([]);
        setResolvedChurchId(null);
        setConfigurationError('The configured church was not found. Check VITE_CHURCH_ID for this deployment.');
        return;
      }
      setChurches([data as Church]);
      setResolvedChurchId(data.id);
      setConfigurationError(null);
      return;
    }

    const { data, error } = await supabase
      .from('church_memberships')
      .select('church_id, churches(id, name, slug, tier, status)')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (error) {
      setChurches([]);
      setResolvedChurchId(null);
      setConfigurationError('Unable to load your church access. Please contact the church administrator.');
      return;
    }

    const authorized = (data || []).map((row: any) => row.churches).filter(Boolean) as Church[];
    if (authorized.length === 1) {
      setChurches(authorized);
      setResolvedChurchId(authorized[0].id);
      setConfigurationError(null);
      return;
    }

    setChurches([]);
    setResolvedChurchId(null);
    setConfigurationError(
      authorized.length > 1
        ? 'This installation is configured for one church. Set VITE_CHURCH_ID to the church assigned to this deployment.'
        : user.app_metadata?.role === 'SUPER_ADMIN'
          ? 'Set VITE_CHURCH_ID for this single-church deployment.'
          : 'Your account does not have an active church membership.'
    );
  }, [deploymentChurchId]);

  const activeChurch = churches.find(c => c.id === activeChurchId) || null;
  useEffect(() => { void fetchChurches(); }, [fetchChurches]);

  // A deployed installation cannot switch church scope from the browser.
  const safeSetActiveChurchId = useCallback((id: string | null) => {
    if (id === activeChurchId) return;
    if (deploymentChurchId && id === deploymentChurchId) setResolvedChurchId(id);
  }, [activeChurchId, deploymentChurchId]);

  return (
    <ChurchContext.Provider value={{ activeChurchId, setActiveChurchId: safeSetActiveChurchId, churches, fetchChurches, activeChurch, configurationError }}>
      {children}
    </ChurchContext.Provider>
  );
}
