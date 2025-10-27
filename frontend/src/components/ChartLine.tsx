import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { SentimentTrendPoint } from '#types';
import EmptyState from './EmptyState';

interface ChartLineProps {
  data: SentimentTrendPoint[];
  height?: number;
  className?: string;
}

export function ChartLine({ data, height = 280, className }: ChartLineProps) {
  if (!data.length) {
    return <EmptyState title="No sentiment data yet" description="Connect a source or adjust your filters to view trends." />;
  }

  return (
    <div className={className} style={{ width: '100%', height }} role="img" aria-label="Sentiment trend over time">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="positiveArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,168,107,0.6)" />
              <stop offset="100%" stopColor="rgba(0,168,107,0)" />
            </linearGradient>
            <linearGradient id="neutralArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(153,102,204,0.45)" />
              <stop offset="100%" stopColor="rgba(153,102,204,0)" />
            </linearGradient>
            <linearGradient id="negativeArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(227,27,84,0.55)" />
              <stop offset="100%" stopColor="rgba(227,27,84,0)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis stroke="rgba(255,255,255,0.4)" dataKey="date" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: 'rgba(11,15,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }}
            labelStyle={{ color: 'rgba(255,255,255,0.85)' }}
          />
          <Legend
            wrapperStyle={{ color: 'rgba(255,255,255,0.65)' }}
            iconType="circle"
            verticalAlign="bottom"
            height={32}
          />
          <Area type="monotone" dataKey="positive" stroke="#00A86B" strokeWidth={2} fill="url(#positiveArea)" name="Positive" />
          <Area type="monotone" dataKey="neutral" stroke="#9966CC" strokeWidth={2} fill="url(#neutralArea)" name="Neutral" />
          <Area type="monotone" dataKey="negative" stroke="#E31B54" strokeWidth={2} fill="url(#negativeArea)" name="Negative" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChartLine;
