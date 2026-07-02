export type PlatformDashboardStats = {
  totalChurches: number;
  activeChurches: number;
  totalMembers: number;
  totalRevenue: number;
  totalChurchesChange: number;
  totalMembersChange: number;
  totalRevenueChange: number;
};

type SupabaseLikeClient = { from(table: string): any };

export function createPlatformDashboardService(client: SupabaseLikeClient) {
  return {
    async getStats(): Promise<PlatformDashboardStats> {
      const [{ count: churches }, { count: activeChurches }, { count: members }, { data: transactions }] = await Promise.all([
        client.from('churches').select('*', { count: 'exact', head: true }),
        client.from('churches').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        client.from('members').select('*', { count: 'exact', head: true }),
        client.from('transactions').select('amount, category').eq('category', 'Income'),
      ]);

      const totalRevenue = (transactions || []).reduce((sum: number, transaction: { amount: number | string }) => sum + Number(transaction.amount), 0);

      return {
        totalChurches: churches || 0,
        activeChurches: activeChurches || 0,
        totalMembers: members || 0,
        totalRevenue,
        totalChurchesChange: 0,
        totalMembersChange: 0,
        totalRevenueChange: 0,
      };
    },
  };
}
