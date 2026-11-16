import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { fetchWallets, createWallet, updateWallet, deleteWallet } from '@/api/client';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/index';
import { Button } from '@/components/ui/index';
import { Input } from '@/components/ui/index';
import { Label } from '@/components/ui/index';
import { Select } from '@/components/ui/index';
import { Skeleton } from '@/components/ui/empty-state';
import { Wallet, Plus, Trash2, Edit, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

const WALLET_TYPES: { value: 'cash' | 'bank' | 'e-wallet' | 'other'; label: string; color: string }[] = [
  { value: 'cash', label: 'Cash', color: 'bg-violet-500/15 text-violet-500' },
  { value: 'bank', label: 'Bank Account', color: 'bg-emerald-500/15 text-emerald-500' },
  { value: 'e-wallet', label: 'E-Wallet', color: 'bg-indigo-500/15 text-indigo-500' },
  { value: 'other', label: 'Other', color: 'bg-slate-500/15 text-slate-500' },
];

export default function WalletsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'cash' | 'bank' | 'e-wallet' | 'other'>('cash');
  const [description, setDescription] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const ws = await fetchWallets();
      setWallets(ws || []);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editingId) {
        await updateWallet(editingId, { name, type, description: description || null });
      } else {
        await createWallet({ name, type, description: description || undefined });
      }
      setShowForm(false);
      setEditingId(null);
      setName('');
      setDescription('');
      load();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to save wallet');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await deleteWallet(id);
      load();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to delete wallet');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">My Wallets</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your financial accounts</p>
        </div>
        <Button variant="default" onClick={() => { setShowForm(!showForm); setEditingId(null); setName(''); setDescription(''); }}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Wallet'}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
      ) : wallets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-heading text-lg font-semibold">No wallets yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first wallet to start tracking</p>
            <Button variant="default" className="mt-4" onClick={() => { setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Create Wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((w) => (
            <Card key={w.id} className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${WALLET_TYPES.find((t) => t.value === w.type)?.color}`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{w.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{WALLET_TYPES.find((t) => t.value === w.type)?.label}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Edit" onClick={() => { setEditingId(w.id); setShowForm(true); setName(w.name); setType(w.type); setDescription(w.description || ''); }}>
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete" onClick={() => setConfirmRemove(w.id)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-heading font-semibold">{formatCurrency(w.balance, w.currency || 'IDR')}</span>
                  <span className="text-xs text-muted-foreground">{w.currency || 'IDR'}</span>
                </div>
                {w.description && <p className="text-xs text-muted-foreground mt-1">{w.description}</p>}
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 !rounded-xl" onClick={() => {}}>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Add Income
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 !rounded-xl" onClick={() => {}}>
                    <ArrowDownRight className="w-4 h-4 mr-2" />
                    Transfer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Wallet' : 'Create Wallet'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Wallet name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. BCA Bank" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onChange={(e) => setType(e.target.value as any)}>
                  {WALLET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Description (optional)</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
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
              <p className="font-heading text-lg font-semibold mb-2">Delete wallet?</p>
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
