import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { fetchSavingsGoals, createSavingsGoal, updateSavingsGoal, deleteSavingsGoal, addSavingsContribution } from '@/api/client';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/index';
import { Button } from '@/components/ui/index';
import { Input } from '@/components/ui/index';
import { Label } from '@/components/ui/index';
import { Progress } from '@/components/ui/index';
import { Skeleton } from '@/components/ui/empty-state';
import { Plus, TrendingUp, Trash2, Edit, CheckCircle, Minus, Clock } from 'lucide-react';

export default function SavingsGoalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSavingsGoals();
      setGoals(res);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    try {
      const numTarget = Number(targetAmount);
      const numCurrent = currentAmount ? Number(currentAmount) : 0;
      if (editingId) {
        await updateSavingsGoal(editingId, { name, targetAmount: numTarget, currentAmount: numCurrent, targetDate: targetDate || null, description: description || null });
      } else {
        await createSavingsGoal({ name, targetAmount: numTarget, currentAmount: numCurrent, targetDate: targetDate || undefined, description: description || undefined });
      }
      setShowForm(false);
      setEditingId(null);
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate('');
      setDescription('');
      load();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to save goal');
    }
  };

  const handleContribution = async (id: string, amount: number, note: string) => {
    try {
      await addSavingsContribution(id, amount, note || undefined);
      load();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to add contribution');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await deleteSavingsGoal(id);
      load();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to delete goal');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Savings Goals</h1>
          <p className="text-sm text-muted-foreground mt-1">Reach your financial goals, one step at a time</p>
        </div>
        <Button variant="default" onClick={() => { setShowForm(!showForm); setEditingId(null); setName(''); setTargetAmount(''); setCurrentAmount(''); setTargetDate(''); setDescription(''); }}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Goal'}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-heading text-lg font-semibold">No savings goals yet</p>
            <p className="text-sm text-muted-foreground mt-1">Set a goal and start saving</p>
            <Button variant="default" className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => {
            const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
            const isUrgent = g.targetDate ? new Date(g.targetDate) < new Date(new Date().setDate(new Date().getDate() + 14)) : false;
            return (
              <Card key={g.id} className="card-hover flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{g.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{g.description || 'No description'}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUrgent ? 'bg-red-500/15 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {g.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Saved</span>
                    <span className="text-xl font-semibold">{formatCurrency(g.currentAmount, 'IDR')}</span>
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Target</span>
                    <span className="text-xl font-semibold">{formatCurrency(g.targetAmount, 'IDR')}</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-3 bg-muted rounded-full" />
                  <p className={`text-xs mt-2 ${progress >= 100 ? 'text-emerald-500' : progress > 80 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                    {progress.toFixed(0)}% complete
                  </p>
                  <div className="flex gap-2 mt-auto pt-3">
                    <Button size="sm" variant="outline" className="flex-1 !rounded-xl" onClick={() => {}}>
                      <Plus className="w-4 h-4 mr-2" /> Contribution
                    </Button>
                    <Button size="sm" variant="ghost" className="!rounded-xl">Edit</Button>
                    <Button size="sm" variant="ghost" className="!rounded-xl text-red-500" onClick={() => setConfirmRemove(g.id)}>
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
            <CardTitle>{editingId ? 'Edit Goal' : 'Create Goal'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Goal name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Emergency fund" />
              </div>
              <div className="space-y-2">
                <Label>Target amount (Rp)</Label>
                <Input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="10000000" />
              </div>
              <div className="space-y-2">
                <Label>Current amount (Rp)</Label>
                <Input type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Target date (optional)</Label>
                <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Description (optional)</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why are you saving?" />
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
              <p className="font-heading text-lg font-semibold mb-2">Delete goal?</p>
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
