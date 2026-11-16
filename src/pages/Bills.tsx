import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { fetchBills, createBill, updateBill, deleteBill } from '@/api/client';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/index';
import { Button } from '@/components/ui/index';
import { Input } from '@/components/ui/index';
import { Label } from '@/components/ui/index';
import { Select } from '@/components/ui/index';
import { Skeleton } from '@/components/ui/empty-state';
import { Plus, Trash2, Edit, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const STATUSES = [
  { value: 'upcoming', label: 'Upcoming', color: 'bg-slate-500/15 text-slate-500' },
  { value: 'due_soon', label: 'Due Soon', color: 'bg-amber-500/15 text-amber-500' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-500/15 text-red-500' },
  { value: 'paid', label: 'Paid', color: 'bg-emerald-500/15 text-emerald-500' },
];

export default function BillsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [category, setCategory] = useState('');
  const [walletId, setWalletId] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBills();
      setBills(res);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) return;
    try {
      const num = Number(amount);
      if (editingId) {
        await updateBill(editingId, { name, amount: num, dueDate: dueDate || new Date().toISOString(), frequency, category: category || null, walletId: walletId || null });
      } else {
        await createBill({ name, amount: num, dueDate: dueDate || new Date().toISOString(), frequency, category: category || undefined, walletId: walletId || undefined });
      }
      setShowForm(false);
      setEditingId(null);
      setName('');
      setAmount('');
      setDueDate('');
      setFrequency('monthly');
      setCategory('');
      setWalletId('');
      load();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to save bill');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await deleteBill(id);
      load();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to delete bill');
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await updateBill(id, { status: 'paid', paidAt: new Date().toISOString() });
      load();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to mark paid');
    }
  };

  const filtered = filter === 'all' ? bills : bills.filter((b) => b.status === filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Bills & Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage recurring bills and payments</p>
        </div>
        <Button variant="default" onClick={() => { setShowForm(!showForm); setEditingId(null); setName(''); setAmount(''); setDueDate(''); setFrequency('monthly'); setCategory(''); setWalletId(''); }}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Bill'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary/10 text-primary' : 'bg-muted/20 text-muted-foreground hover:text-foreground'}`}
            >All</button>
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setFilter(s.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s.value ? 'bg-primary/10 text-primary' : 'bg-muted/20 text-muted-foreground hover:text-foreground'}`}
              >{s.label}</button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-heading text-lg font-semibold">No bills found</p>
            <p className="text-sm text-muted-foreground mt-1">{filter === 'all' ? 'Create your first bill' : 'No bills match this filter'}</p>
            {filter === 'all' && <Button variant="default" className="mt-4" onClick={() => setShowForm(true)}>Add Bill</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const statusInfo = STATUSES.find((s) => s.value === b.status);
            const isOverdue = b.status === 'overdue';
            const isDueSoon = b.status === 'due_soon';
            const due = new Date(b.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const daysLeft = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return (
              <Card key={b.id} className={`card-hover flex flex-col ${isOverdue ? 'border-red-500/30' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{b.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{b.category || 'No category'}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusInfo?.color}`}>
                    {b.status === 'paid' ? <CheckCircle className="w-5 h-5" /> : b.status === 'overdue' ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-heading font-semibold">{formatCurrency(b.amount, b.currency || 'IDR')}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${isOverdue ? 'bg-red-500/15 text-red-500' : isDueSoon ? 'bg-amber-500/15 text-amber-500' : 'bg-slate-500/15 text-slate-500'}`}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                    <span>Frequency: {b.frequency}</span>
                    <span>Category: {b.category || '—'}</span>
                    <span>Wallet: {b.walletId || '—'}</span>
                    {b.status === 'paid' && <span className="text-emerald-500">Paid</span>}
                  </div>
                  <div className="flex gap-2">
                    {b.status !== 'paid' && (
                      <Button size="sm" variant="default" className="flex-1 !rounded-xl" onClick={() => handleMarkPaid(b.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Mark Paid
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="!rounded-xl" onClick={() => { setEditingId(b.id); setShowForm(true); setName(b.name); setAmount(String(b.amount)); setDueDate(b.dueDate); setFrequency(b.frequency || 'monthly'); setCategory(b.category || ''); setWalletId(b.walletId || ''); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="!rounded-xl text-red-500" onClick={() => setConfirmRemove(b.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showForm && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Bill' : 'Create Bill'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bill name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Listrik PLN" />
              </div>
              <div className="space-y-2">
                <Label>Amount (Rp)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="350000" />
              </div>
              <div className="space-y-2">
                <Label>Due date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category (optional)</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Listrik & Air" />
              </div>
              <div className="space-y-2">
                <Label>Payment wallet (optional)</Label>
                <Input value={walletId} onChange={(e) => setWalletId(e.target.value)} placeholder="Select wallet" />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" variant="default" className="flex-1 !rounded-xl">{editingId ? 'Save' : 'Create'}</Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="font-heading text-lg font-semibold mb-2">Delete bill?</p>
              <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
              <div className="flex justify-center gap-3">
                <Button variant="destructive" size="sm" onClick={() => { if (confirmRemove) { handleRemove(confirmRemove); setConfirmRemove(null); } }}>Delete</Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmRemove(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
