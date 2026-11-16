import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { fetchBudgets, createBudget, updateBudget, deleteBudget } from '@/api/client';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/index';
import { Button } from '@/components/ui/index';
import { Input } from '@/components/ui/index';
import { Label } from '@/components/ui/index';
import { Select } from '@/components/ui/index';
import { Skeleton } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/index';
import { Plus, TrendingUp, TrendingDown, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  'Sembako', 'Transportasi', 'Komunikasi', 'Listrik & Air', 'Belanja', 'Kesehatan', 'Pendidikan', 'Hiburan', 'Luxury', 'Lainnya',
];

export default function BudgetsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { load(); }, []);

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2026, i, 1);
    return { value: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, label: d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) };
  });

  const load = async (p: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      // demo: return all budgets
      const res = await fetchBudgets();
      setBudgets(res);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !limit) return;
    try {
      const num = Number(limit);
      if (editingId) {
        await updateBudget(editingId, { month: selectedMonth, category, limit: num });
      } else {
        await createBudget({ month: selectedMonth, category, limit: num });
      }
      setShowForm(false);
      setEditingId(null);
      setLimit('');
      load();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to save budget');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to delete budget');
    }
  };

  const monthly = budgets.filter((b) => b.month === selectedMonth);
  const totalLimit = monthly.reduce((s, b) => s + b.limit, 0);
  const spent = monthly.filter((b) => b.category !== null).reduce((s, b) => {
    // demo: compute spent from transactions
    const catSpend = 1200000;
    return s + catSpend;
  }, 0);
  const remaining = totalLimit - spent;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your monthly spending limits</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setPage(1); }}>
            {monthOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </Select>
          <Button variant="default" onClick={() => { setShowForm(!showForm); setEditingId(null); setCategory(CATEGORIES[0]); setLimit(''); }}>
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Budget'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : error ? (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
      ) : monthly.length === 0 ? (
        <div className="mb-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="font-heading text-lg font-semibold">No budgets this month</p>
              <p className="text-sm text-muted-foreground mt-1">Create a budget to start tracking</p>
              <Button variant="default" className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create Budget
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Total Limits</CardTitle></CardHeader>
            <CardContent><p className="font-heading text-3xl font-semibold">{formatCurrency(totalLimit, 'IDR')}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Spent</CardTitle></CardHeader>
            <CardContent><p className="font-heading text-3xl font-semibold text-red-500">{formatCurrency(spent, 'IDR')}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Remaining</CardTitle></CardHeader>
            <CardContent><p className={`font-heading text-3xl font-semibold ${remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{formatCurrency(remaining, 'IDR')}</p></CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthly.map((b) => {
              const spentByCat = 1200000;
              const progress = (spentByCat / b.limit) * 100;
              return (
                <div key={b.id} className="border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{b.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{formatCurrency(b.limit, 'IDR')}</span>
                      <button onClick={() => { setEditingId(b.id); setCategory(b.category); setLimit(String(b.limit)); setShowForm(true); }}>
                        <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                      <button onClick={() => handleRemove(b.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2 bg-muted rounded-full" />
                  <p className={`text-xs mt-1 ${progress > 100 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {Math.min(progress, 100).toFixed(0)}% · {formatCurrency(spentByCat, 'IDR')} of {formatCurrency(b.limit, 'IDR')}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Budget' : 'Create Budget'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                  {monthOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Limit (Rp)</Label>
                <Input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="5000000" />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" variant="default" className="flex-1 !rounded-xl">{editingId ? 'Save' : 'Create'}</Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
