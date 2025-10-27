import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Cell, Tooltip } from 'recharts';
import type { TopicDistributionItem } from '#types';
import EmptyState from './EmptyState';

interface HeatmapProps {
  data: TopicDistributionItem[];
}

function getIntensity(value: number, maxValue: number) {
  if (!maxValue) return 0.1;
  return Math.max(0.15, value / maxValue);
}

export function Heatmap({ data }: HeatmapProps) {
  if (!data.length) {
    return <EmptyState title="No topic activity" description="Topics appear here once reviews are tagged." />;
  }

  const maxReviewCount = Math.max(...data.map((item) => item.review_count));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="topic_label"
            width={140}
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value: number, name: string, props) => [`${value} reviews`, props.payload.topic_label]} />
          <Bar dataKey="review_count" radius={[8, 8, 8, 8]}>
            {data.map((entry, index) => {
              const alpha = getIntensity(entry.review_count, maxReviewCount);
              const fill = `rgba(59, 130, 246, ${alpha})`;
              return <Cell key={entry.topic_label} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Heatmap;
