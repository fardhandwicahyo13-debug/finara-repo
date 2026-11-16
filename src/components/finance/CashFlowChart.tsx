import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export function CashFlowChart({ data, title, subtitle }: { data: any[]; title?: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-lg font-semibold">{title || 'Cash Flow'}</h3>
          <p className="text-sm text-muted-foreground">{subtitle || 'Daily movement of income and expenses'}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#006C49" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#006C49" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#BF0F3C" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#BF0F3C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            formatter={(v: number) => [v.toLocaleString('id-ID'), 'Rp']}
            labelStyle={{ color: '#64748B', fontSize: '11px' }}
          />
          <Area type="monotone" dataKey="income" stroke="#006C49" fillOpacity={1} fill="url(#incomeGrad)" name="Income" />
          <Area type="monotone" dataKey="expense" stroke="#BF0F3C" fillOpacity={1} fill="url(#expenseGrad)" name="Expenses" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
