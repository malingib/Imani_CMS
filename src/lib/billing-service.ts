type SupabaseLikeClient = { from(table: string): any };

export type BillingSubscription = {
  id: string;
  church_id: string;
  tier: string;
  status: string;
  start_date?: string;
  end_date?: string | null;
  church_name?: string;
};

export type BillingInvoice = {
  id: string;
  church_id: string;
  amount: number;
  status: string;
  due_date: string;
  paid_at: string | null;
  church_name?: string;
};

export function createBillingService(client: SupabaseLikeClient) {
  return {
    async getBillingOverview(): Promise<{ subscriptions: BillingSubscription[]; invoices: BillingInvoice[]; totalRevenue: number }> {
      const [{ data: subscriptions, error: subscriptionsError }, { data: invoices, error: invoicesError }, { data: transactions, error: transactionsError }] = await Promise.all([
        client.from('subscriptions').select('*, churches(name)'),
        client.from('invoices').select('*, churches(name)').order('due_date', { ascending: false }),
        client.from('transactions').select('amount').eq('category', 'Income'),
      ]);

      if (subscriptionsError) throw new Error(subscriptionsError.message);
      if (invoicesError) throw new Error(invoicesError.message);
      if (transactionsError) throw new Error(transactionsError.message);

      return {
        subscriptions: (subscriptions || []).map((subscription: any) => ({ ...subscription, church_name: subscription.churches?.name })),
        invoices: (invoices || []).map((invoice: any) => ({ ...invoice, church_name: invoice.churches?.name })),
        totalRevenue: (transactions || []).reduce((sum: number, transaction: { amount: number | string }) => sum + Number(transaction.amount), 0),
      };
    },
  };
}
