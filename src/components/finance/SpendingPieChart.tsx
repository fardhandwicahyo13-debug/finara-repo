import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4F46E5', '#006C49', '#6366F1', '#6B7280', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#F97316', '#3B82F6'];
const COLORS_DARK = ['#818CF8', '#34D399', '#A5B4FC', '#A1A1A1', '#FBBF24', '#818CF8', '#F87171', '#34D399', '#FB923C', '#60A5FA'];

export function SpendingPieChart({ data, dark }: { data: any[]; dark?: boolean }) {
  const c = dark ? COLORS_DARK : COLORS;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-lg font-semibold">Spending by Category</h3>
          <p className="text-sm text-muted-foreground">Share of total spending</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="80%"
            dataKey="amount"
            nameKey="name"
            strokeWidth={0}
          >
            {data.map((_, i) => <Cell key={i} fill={c[i % c.length]} />)}
          </Pie>
          <Tooltip
            formatter={(v: number) => [v.toLocaleString('id-ID'), 'Rp']}
            contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#1B2435', color: '#EEF0FF' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
