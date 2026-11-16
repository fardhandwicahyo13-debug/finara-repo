import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { useTheme } from '@/contexts/ThemeProvider';
import { fetchDashboardSnapshot } from '@/api/client';
import { DashboardSnapshot } from '@/types';
import { formatCurrency, formatDateShort, getMonthRange } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/index';
import { Button } from '@/components/ui/index';
import { MetricCard } from '@/components/finance/MetricCard';
import { CashFlowChart } from '@/components/finance/CashFlowChart';
import { SpendingPieChart } from '@/components/finance/SpendingPieChart';
import { Skeleton } from '@/components/ui/empty-state';
import { TransactionRow } from '@/components/finance/TransactionRow';
import { TransactionType } from '@/types';
import { Plus, TrendingUp, TrendingDown, Wallet, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function OverviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-03');
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await fetchDashboardSnapshot();
        setSnapshot(s);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2026, i, 1);
    return { value: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, label: d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) };
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {user?.displayName ? `Good morning, ${user.displayName}` : 'Good morning'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            A clear view of your money. A confident step forward.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/20 rounded-xl p-1">
            {monthOptions.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelectedMonth(m.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedMonth === m.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <Button variant="default" className="!rounded-xl" onClick={() => navigate('/transactions')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : snapshot ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            label="Total Balance"
            value={formatCurrency(snapshot.totalBalance, snapshot.currency)}
            sublabel={`${snapshot.walletCount} wallet${snapshot.walletCount > 1 ? 's' : ''} · ${showBalance ? 'Shown' : 'Hidden'}`}
            icon={<Wallet className="w-5 h-5" />}
            iconBg="bg-primary/10 text-primary"
            action={
              <button
                onClick={() => setShowBalance((v) => !v)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
              >
                {showBalance ? 'Hide balance' : 'Show balance'}
              </button>
            }
          />
          <MetricCard
            label="Total Income"
            value={formatCurrency(snapshot.totalIncome, snapshot.currency)}
            sublabel={`${snapshot.incomeCount} income transaction${snapshot.incomeCount !== 1 ? 's' : ''}`}
            icon={<TrendingUp className="w-5 h-5" />}
            iconBg="bg-emerald-500/10 text-emerald-500"
            action={
              <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-medium">
                <ArrowUpRight className="w-3 h-3" /> This month
              </span>
            }
          />
          <MetricCard
            label="Total Expenses"
            value={formatCurrency(snapshot.totalExpenses, snapshot.currency)}
            sublabel={`${snapshot.expenseCount} expense transaction${snapshot.expenseCount !== 1 ? 's' : ''}`}
            icon={<TrendingDown className="w-5 h-5" />}
            iconBg="bg-red-500/10 text-red-500"
            action={
              <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                <ArrowDownRight className="w-3 h-3" /> This month
              </span>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader><CardTitle>Total Balance</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-semibold text-muted-foreground">—</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Income</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-semibold text-muted-foreground">—</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-semibold text-muted-foreground">—</p></CardContent>
          </Card>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3">
          <span>{error}</span>
        </div>
      )}

      {snapshot && (
        <>
          <CashFlowChart data={snapshot.cashFlow} />
          <SpendingPieChart data={snapshot.spendingByCategory} dark={resolvedTheme === 'dark'} />
        </>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <p className="text-sm text-muted-foreground">Latest activity in your account</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
                View All
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
              ) : snapshot?.recentTransactions && snapshot.recentTransactions.length > 0 ? (
                <div className="space-y-1">
                  {snapshot.recentTransactions.map((t) => (
                    <TransactionRow
                      key={t.id}
                      icon={
                        t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : t.type === 'expense' ? <ArrowDownRight className="w-4 h-4" /> : <Wallet className="w-4 h-4" />
                      }
                      label={t.description}
                      description={t.category}
                      date={formatDateShort(t.date)}
                      amount={t.amount}
                      type={t.type}
                      wallet={t.walletName}
                      negative={t.type === 'expense'}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No transactions yet this month.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Wallets</CardTitle>
                <p className="text-sm text-muted-foreground">{snapshot?.walletCount || 0} wallet(s)</p>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}</div>
              ) : snapshot ? (
                <div className="space-y-3">
                  {[
                    { name: 'BCA Bank', type: 'bank', balance: 23500000 },
                    { name: 'Cash Wallet', type: 'cash', balance: 4520000 },
                    { name: 'Ovo', type: 'e-wallet', balance: 750000 },
                  ].map((w) => (
                    <div key={w.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{w.name}</p>
                        <p className="text-xs text-muted-foreground">{w.type}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatCurrency(w.balance, snapshot.currency)}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
