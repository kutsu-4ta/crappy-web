import {
  ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { DashboardStats, ChartDataPoint } from '../types/WorkData';
import { format } from 'date-fns';

interface Props {
  stats: DashboardStats;
  data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as ChartDataPoint;
  return (
    <div style={{
      background: '#0f172a',
      borderRadius: 12,
      padding: '8px 12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      border: '1px solid #1e293b',
    }}>
      <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{d.date}</div>
      {d.actual != null && (
        <div style={{ color: '#22d3ee', fontFamily: 'monospace', fontWeight: 800, fontSize: 13 }}>
          実績 {d.actual}h
        </div>
      )}
      {d.forecast != null && d.actual == null && (
        <div style={{ color: '#67e8f9', fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>
          予測 {d.forecast}h
        </div>
      )}
      <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
        目標 {d.range[0]}〜{d.range[1]}h
      </div>
    </div>
  );
};

export const DashboardChart = ({ stats, data }: Props) => {
  const yMax = Math.max(stats.targetMax + 20, stats.currentTotal + 20, 200);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayData = data.find(d => d.date === todayStr);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
          interval={4}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[0, yMax]}
          tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
          tickLine={false}
          axisLine={false}
        />

        <Area
          type="monotone"
          dataKey="range"
          stroke="none"
          fill="#10b981"
          fillOpacity={0.1}
          isAnimationActive={false}
        />

        <ReferenceLine
          y={stats.targetMin}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: `${stats.targetMin}`, position: 'right', fontSize: 8, fill: '#f59e0b' }}
        />
        <ReferenceLine
          y={stats.targetMax}
          stroke="#f43f5e"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: `${stats.targetMax}`, position: 'right', fontSize: 8, fill: '#f43f5e' }}
        />

        {todayData && (
          <ReferenceLine x={todayData.day} stroke="#e2e8f0" strokeWidth={1} />
        )}

        <Line
          type="monotone"
          dataKey="forecast"
          stroke="#67e8f9"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          isAnimationActive={false}
          connectNulls={false}
        />

        <Line
          type="monotone"
          dataKey="actual"
          stroke="#0891b2"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 5, fill: '#0891b2', strokeWidth: 0 }}
          isAnimationActive={false}
          connectNulls={false}
        />

        <Tooltip content={<CustomTooltip />} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
