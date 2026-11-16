import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { fetchTransactions } from '@/api/client';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/index';
import { Button } from '@/components/ui/index';
import { Input } from '@/components/ui/index';
import { Label } from '@/components/ui/index';
import { Select } from '@/components/ui/index';
import { TransactionRow } from '@/components/finance/TransactionRow';
import { Skeleton } from '@/components/ui/empty-state';
import { TransactionType } from '@/types';
import { Plus, Search, Download, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const TYPES: { value: TransactionType | 'all'; label: string; icon?: React.ReactNode }[] = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4 7 7V5a1 1 0 00-1-1H7a1 1 0 00-1 1v7z" /></svg> },
  { value: 'expense', label: 'Expense', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { value: 'transfer', label: 'Transfer', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
];

export default function TransactionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  const load = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTransactions({
        page: p,
        limit: 10,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        category: category || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sort: search || undefined,
      });
      setData(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const paramstoString = (params: URLSearchParams) => params.toString();

  const handleSearch = () => { setPage(1); load(1); };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Transactions</h1>
        <Button variant="default" onClick={() => navigate('/transactions')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1); }}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
            <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} placeholder="Start date" />
            <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} placeholder="End date" />
            <Button variant="outline" onClick={() => { setSearch(''); setTypeFilter('all'); setStartDate(''); setEndDate(''); }}>
              <X className="w-4 h-4 mr-2" /> Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
      ) : data.length > 0 ? (
        <div className="space-y-1">
          {data.map((t) => (
            <TransactionRow
              key={t.id}
              icon={
                t.type === 'income' ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4 7 7V5a1 1 0 00-1-1H7a1 1 0 00-1 1v7z" /></svg>
                : t.type === 'expense' ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              }
              label={t.description || t.category}
              description={t.category}
              date={formatDateShort(t.date)}
              amount={t.amount}
              type={t.type}
              wallet={t.walletId || 'Unknown'}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-heading text-lg font-semibold">No transactions found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
