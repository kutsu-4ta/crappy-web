import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import type { DashboardStats } from '../types/WorkData';

interface ChartDataPoint {
    day: number;
    actual?: number;   // 今日までの実績
    forecast?: number; // 明日以降の予測
    range: [number, number]; // [targetMin, targetMax] の固定帯
}

interface Props {
    stats: DashboardStats;
    data: ChartDataPoint[];
}

export const DashboardChart = ({ stats, data }: Props) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" hide />
                <YAxis domain={[0, Math.max(stats.targetMax + 20, 200)]} hide />

                {/* 1. ターゲットゾーン (背景の帯) */}
                <Area
                    type="monotone"
                    dataKey="range"
                    stroke="none"
                    fill="#22c55e"
                    fillOpacity={0.1}
                    isAnimationActive={false}
                />

                {/* 2. 実績線 (太い実線) */}
                <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#06b6d4"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#06b6d4' }}
                    isAnimationActive={false}
                />

                {/* 3. 予測線 (点線) */}
                <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    isAnimationActive={false}
                />

                <Tooltip
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
};
