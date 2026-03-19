import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import type { DashboardStats } from '../types/workData';

interface ChartDataPoint {
    day: number;
    hours: number;
}

interface Props {
    stats: DashboardStats;
    currentTotal: number;
    data: ChartDataPoint[];
}

export const DashboardChart = ({ stats, currentTotal, data }: Props) => {

    // ResponsiveContainerがバグる場合、一時的に固定値を当てるか、
    // debounce処理が必要ですが、まずは以下の設定を試してください
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorH" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" hide />
                <YAxis domain={[0, Math.max(stats.targetMax + 20, 200)]} hide />
                <Tooltip />
                <ReferenceLine y={stats.targetMin} stroke="#22c55e" strokeDasharray="4 4" />
                <ReferenceLine y={stats.targetMax} stroke="#f43f5e" strokeDasharray="4 4" />
                <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fill="url(#colorH)"
                    isAnimationActive={false} // アニメーションが原因で表示されないケースがあるため一旦オフ
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};
