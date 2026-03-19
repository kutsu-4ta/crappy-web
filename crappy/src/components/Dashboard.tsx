import type {DashboardStats} from '../types/WorkData';
import {DashboardChart} from "./DashboardChart";
import {TrendingUp} from "lucide-react";

interface DashboardProps {
    stats: DashboardStats;
    currentTotal: number;
}

export const Dashboard = ({stats, currentTotal}: DashboardProps) => {
    // グラフ用データの整形
    // 1日から月末まで、実績と予測を切り分ける
    const totalDays = 20; // 営業日数などの変数
    const today = 10;     // 現在の日数

    const chartData = Array.from({length: totalDays}, (_, i) => {
        const day = i + 1;
        const isPast = day <= today;

        return {
            day,
            // 実績：今日まで入れる
            actual: isPast ? (currentTotal / today) * day : undefined,
            // 予測：今日から月末まで繋げる
            forecast: day >= today ? (currentTotal / today) * day : undefined,
            // ターゲットゾーン：常に一定（または営業日に応じた理想線）
            range: [stats.targetMin, stats.targetMax] as [number, number],
        };
    });

    return (
        <div className="grid gap-6">
            {/* 1. ペースアドバイザー（ハイライト） */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-4 opacity-50">
                            <TrendingUp size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Required Pace</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black font-mono tracking-tighter text-cyan-400">
                                {stats.requiredDailyHours}
                            </span>
                            <span className="text-xl font-bold text-slate-500">h / day</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black opacity-30 uppercase mb-2 text-right">Remaining</div>
                        <div className="text-4xl font-black font-mono italic">{stats.remainingBusinessDays}d</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                {/* 1行サマリー：考えさせないUI */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <span
                            className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                        <div className="text-xl font-bold">
                            月末着地予定: <span className="text-cyan-600">{stats.estimatedTotal}h</span>
                        </div>
                    </div>
                    <div className="text-right text-xs font-medium text-slate-500">
                        <div>下限まであと <span
                            className="text-slate-900 font-bold">{(stats.targetMin - currentTotal).toFixed(1)}h</span>
                        </div>
                        <div>上限まであと <span
                            className="text-slate-900 font-bold">{(stats.targetMax - currentTotal).toFixed(1)}h</span>
                        </div>
                    </div>
                </div>

                <div style={{height: '240px', width: '100%'}}>
                    <DashboardChart stats={stats} data={chartData}/>
                </div>
            </div>
        </div>
    );
};
