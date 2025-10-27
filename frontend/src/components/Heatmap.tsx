import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Cell, Tooltip } from 'recharts';
import type { TopicDistributionItem } from '#types';
import EmptyState from './EmptyState';

interface HeatmapProps {
  data: TopicDistributionItem[];
  height?: number;
}

const calcIntensity = (value: number, maxValue: number) =>
  maxValue ? Math.max(0.2, value / maxValue) : 0.2;

export function Heatmap({ data, height = 300 }: HeatmapProps) {
  if (!data.length) {
    return <EmptyState title="No topic activity" description="Topics appear here once reviews are tagged." />;
  }

  const maxReviewCount = Math.max(...data.map((item) => item.review_count));

  return (
    <div className="w-full" style={{ height }} role="img" aria-label="Topic heatmap">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 12, right: 12 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="topic_label"
            width={150}
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.75)' }}
          />
          <Tooltip
            formatter={(value: number, _name: string, props) => [`${value} reviews`, props?.payload?.topic_label]}
            contentStyle={{
              background: 'rgba(11,15,20,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.85)' }}
          />
          <Bar dataKey="review_count" radius={[14, 14, 14, 14]}>
            {data.map((entry) => {
              const alpha = calcIntensity(entry.review_count, maxReviewCount);
              const fill = `rgba(15,82,186,${alpha})`;
              return <Cell key={entry.topic_label} fill={fill} stroke="rgba(0,168,107,0.4)" strokeWidth={1} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Heatmap;
