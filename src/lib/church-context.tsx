import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';

interface Church { id: string; name: string; slug: string; tier: string; status: string; }
interface ChurchContextType {
  activeChurchId: string | null;
  setActiveChurchId: (id: string | null) => void;
  churches: Church[];
  fetchChurches: () => void;
  activeChurch: Church | null;
}

export const ChurchContext = createContext<ChurchContextType>({ activeChurchId: null, setActiveChurchId: () => {}, churches: [], fetchChurches: () => {}, activeChurch: null });
export const useChurch = () => useContext(ChurchContext);

export function ChurchProvider({ children, churchId: initialChurchId }: { children: ReactNode; churchId: string | null }) {
  const [activeChurchId, setActiveChurchId] = useState<string | null>(initialChurchId);
  const [churches, setChurches] = useState<Church[]>([]);

  const fetchChurches = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setChurches([]); setActiveChurchId(null); return; }

    if (user.app_metadata?.role === 'SUPER_ADMIN') {
      const { data } = await supabase.from('churches').select('*').order('name');
      if (data) setChurches(data as Church[]);
      return;
    }

    const { data } = await supabase.from('church_memberships').select('church_id, churches(id, name, slug, tier, status)').eq('user_id', user.id).eq('status', 'active');
    const authorized = (data || []).map((row: any) => row.churches).filter(Boolean) as Church[];
    setChurches(authorized);

    if (activeChurchId && !authorized.some(church => church.id === activeChurchId)) setActiveChurchId(authorized[0]?.id ?? null);
    else if (!activeChurchId && authorized.length === 1) setActiveChurchId(authorized[0].id);
  }, [activeChurchId]);

  const activeChurch = churches.find(c => c.id === activeChurchId) || null;

  useEffect(() => { void fetchChurches(); }, [fetchChurches, initialChurchId]);

  const safeSetActiveChurchId = useCallback((id: string | null) => {
    if (id === null) { setActiveChurchId(null); return; }
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.app_metadata?.role === 'SUPER_ADMIN' || churches.some(church => church.id === id)) setActiveChurchId(id);
    });
  }, [churches]);

  return <ChurchContext.Provider value={{ activeChurchId, setActiveChurchId: safeSetActiveChurchId, churches, fetchChurches, activeChurch }}>{children}</ChurchContext.Provider>;
}
