import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';

interface Church {
  id: string;
  name: string;
  slug: string;
  tier: string;
  status: string;
}

interface ChurchContextType {
  activeChurchId: string | null;
  setActiveChurchId: (id: string | null) => void;
  churches: Church[];
  fetchChurches: () => void;
  activeChurch: Church | null;
}

export const ChurchContext = createContext<ChurchContextType>({
  activeChurchId: null,
  setActiveChurchId: () => {},
  churches: [],
  fetchChurches: () => {},
  activeChurch: null,
});

export const useChurch = () => useContext(ChurchContext);

export function ChurchProvider({ children, churchId: initialChurchId }: { children: ReactNode; churchId: string | null }) {
  const [activeChurchId, setActiveChurchId] = useState<string | null>(initialChurchId);
  const [churches, setChurches] = useState<Church[]>([]);

  const fetchChurches = useCallback(async () => {
    const { data } = await supabase.from('churches').select('*').order('name');
    if (data) setChurches(data as Church[]);
  }, []);

  const activeChurch = churches.find(c => c.id === activeChurchId) || null;

  useEffect(() => {
    if (!initialChurchId) fetchChurches();
  }, [initialChurchId, fetchChurches]);

  return (
    <ChurchContext.Provider value={{ activeChurchId, setActiveChurchId, churches, fetchChurches, activeChurch }}>
      {children}
    </ChurchContext.Provider>
  );
}
