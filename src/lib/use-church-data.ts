import { useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { createChurchAppDataService } from './app-data';
import { useData } from './data-context';

const appDataService = createChurchAppDataService(supabase);

/**
 * Hook to load and manage church data
 * Handles loading, error states, and updates context
 */
export const useChurchData = (churchId: string | null) => {
  const {
    setMembers,
    setTransactions,
    setEvents,
    setBudgets,
    setRecurringExpenses,
    setCommunications,
    setNotifications,
    setAuditLogs,
    setLoading,
    setError,
  } = useData();

  const loadData = useCallback(async () => {
    if (!churchId) {
      setMembers([]);
      setTransactions([]);
      setEvents([]);
      setBudgets([]);
      setRecurringExpenses([]);
      setCommunications([]);
      setNotifications([]);
      setAuditLogs([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await appDataService.loadChurchAppData(churchId);
      
      setMembers(data.members);
      setTransactions(data.transactions);
      setEvents(data.events);
      setBudgets(data.budgets);
      setRecurringExpenses(data.recurringExpenses);
      setCommunications(data.communications);
      setNotifications(data.notifications);
      setAuditLogs(data.auditLogs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load church data';
      console.error('Error loading church data:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    churchId,
    setMembers,
    setTransactions,
    setEvents,
    setBudgets,
    setRecurringExpenses,
    setCommunications,
    setNotifications,
    setAuditLogs,
    setLoading,
    setError,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { loadData };
};
