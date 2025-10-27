import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { SentimentTrendPoint } from '#types';
import EmptyState from './EmptyState';

interface ChartLineProps {
  data: SentimentTrendPoint[];
}

export function ChartLine({ data }: ChartLineProps) {
  if (!data.length) {
    return <EmptyState title="No sentiment data yet" description="Connect a source or adjust your filters to view trends." />;
  }

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="positiveArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="neutralArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="negativeArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="positive" stroke="#22c55e" fill="url(#positiveArea)" name="Positive" />
          <Area type="monotone" dataKey="neutral" stroke="#94a3b8" fill="url(#neutralArea)" name="Neutral" />
          <Area type="monotone" dataKey="negative" stroke="#ef4444" fill="url(#negativeArea)" name="Negative" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChartLine;
