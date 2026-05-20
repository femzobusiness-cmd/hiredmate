'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ScoreTrendChartProps {
  data: {
    date: string;
    score: number;
  }[];
}

export default function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="#F9FAFB"
            tick={{ fill: '#F9FAFB', fontSize: 12 }}
            tickLine={{ stroke: '#1F2937' }}
            axisLine={{ stroke: '#1F2937' }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#F9FAFB"
            tick={{ fill: '#F9FAFB', fontSize: 12 }}
            tickLine={{ stroke: '#1F2937' }}
            axisLine={{ stroke: '#1F2937' }}
          />
          <Tooltip
            cursor={{ stroke: '#7C5CBF', strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EDE9F7',
              borderRadius: '14px',
              boxShadow: '0 4px 24px rgba(124,92,191,0.08)',
              color: '#1A1A2E',
            }}
            labelStyle={{ color: '#1A1A2E' }}
            itemStyle={{ color: '#1A1A2E' }}
            formatter={(value) => [`${value}%`, 'Score']}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#7C5CBF"
            strokeWidth={3}
            dot={{ r: 5, fill: '#00C6B2', stroke: '#0A0F1E', strokeWidth: 2 }}
            activeDot={{
              r: 7,
              fill: '#00C6B2',
              stroke: '#7C5CBF',
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
