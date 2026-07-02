import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Member,
  Transaction,
  ChurchEvent,
  Budget,
  RecurringExpense,
  CommunicationLog,
  AppNotification,
  AuditLog,
  Group,
} from '../../types';

interface DataContextType {
  // Data
  members: Member[];
  transactions: Transaction[];
  events: ChurchEvent[];
  budgets: Budget[];
  recurringExpenses: RecurringExpense[];
  communications: CommunicationLog[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  groups: Group[];
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Operations
  setMembers: (members: Member[]) => void;
  addMember: (member: Member) => void;
  updateMember: (member: Member) => void;
  removeMember: (id: string) => void;
  
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  
  setEvents: (events: ChurchEvent[]) => void;
  addEvent: (event: ChurchEvent) => void;
  updateEvent: (event: ChurchEvent) => void;
  removeEvent: (id: string) => void;
  
  setBudgets: (budgets: Budget[]) => void;
  setRecurringExpenses: (expenses: RecurringExpense[]) => void;
  setCommunications: (comms: CommunicationLog[]) => void;
  setNotifications: (notifs: AppNotification[]) => void;
  setAuditLogs: (logs: AuditLog[]) => void;
  setGroups: (groups: Group[]) => void;
  
  // Utilities
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [members, setMembersState] = useState<Member[]>([]);
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);
  const [events, setEventsState] = useState<ChurchEvent[]>([]);
  const [budgets, setBudgetsState] = useState<Budget[]>([]);
  const [recurringExpenses, setRecurringExpensesState] = useState<RecurringExpense[]>([]);
  const [communications, setCommunicationsState] = useState<CommunicationLog[]>([]);
  const [notifications, setNotificationsState] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogsState] = useState<AuditLog[]>([]);
  const [groups, setGroupsState] = useState<Group[]>([]);
  const [isLoading, setLoadingState] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  // Optimized setters that use the state hook
  const setMembers = useCallback((newMembers: Member[]) => {
    setMembersState(newMembers);
  }, []);

  const addMember = useCallback((member: Member) => {
    setMembersState(prev => [...prev, member]);
  }, []);

  const updateMember = useCallback((member: Member) => {
    setMembersState(prev => prev.map(m => m.id === member.id ? member : m));
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembersState(prev => prev.filter(m => m.id !== id));
  }, []);

  const setTransactions = useCallback((newTransactions: Transaction[]) => {
    setTransactionsState(newTransactions);
  }, []);

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactionsState(prev => [...prev, transaction]);
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactionsState(prev => prev.filter(t => t.id !== id));
  }, []);

  const setEvents = useCallback((newEvents: ChurchEvent[]) => {
    setEventsState(newEvents);
  }, []);

  const addEvent = useCallback((event: ChurchEvent) => {
    setEventsState(prev => [...prev, event]);
  }, []);

  const updateEvent = useCallback((event: ChurchEvent) => {
    setEventsState(prev => prev.map(e => e.id === event.id ? event : e));
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEventsState(prev => prev.filter(e => e.id !== id));
  }, []);

  const setBudgets = useCallback((newBudgets: Budget[]) => {
    setBudgetsState(newBudgets);
  }, []);

  const setRecurringExpenses = useCallback((newExpenses: RecurringExpense[]) => {
    setRecurringExpensesState(newExpenses);
  }, []);

  const setCommunications = useCallback((newComms: CommunicationLog[]) => {
    setCommunicationsState(newComms);
  }, []);

  const setNotifications = useCallback((newNotifs: AppNotification[]) => {
    setNotificationsState(newNotifs);
  }, []);

  const setAuditLogs = useCallback((newLogs: AuditLog[]) => {
    setAuditLogsState(newLogs);
  }, []);

  const setGroups = useCallback((newGroups: Group[]) => {
    setGroupsState(newGroups);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setLoadingState(loading);
  }, []);

  const setError = useCallback((err: string | null) => {
    setErrorState(err);
  }, []);

  const value: DataContextType = {
    members,
    transactions,
    events,
    budgets,
    recurringExpenses,
    communications,
    notifications,
    auditLogs,
    groups,
    isLoading,
    error,
    setMembers,
    addMember,
    updateMember,
    removeMember,
    setTransactions,
    addTransaction,
    removeTransaction,
    setEvents,
    addEvent,
    updateEvent,
    removeEvent,
    setBudgets,
    setRecurringExpenses,
    setCommunications,
    setNotifications,
    setAuditLogs,
    setGroups,
    setLoading,
    setError,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
