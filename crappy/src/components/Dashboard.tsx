import { Target, Calendar, TrendingUp } from 'lucide-react';
import type { DashboardStats } from '../types/workData';

interface DashboardProps {
    stats: DashboardStats;
    currentTotal: number;
}

export const Dashboard = ({ stats, currentTotal }: DashboardProps) => {
    return (
        <div className="grid gap-6">
            {/* 1. ペースアドバイザー（最重要メッセージ） */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-4 opacity-60">
                    <TrendingUp size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Required Pace</span>
                </div>
                <div className="text-3xl font-black mb-2">
                    {stats.requiredDailyHours} <span className="text-lg font-normal opacity-50">h / day</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                    月末の下限 {140}h 達成まで、残りの営業日はこのペースを維持してください。
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* 2. 残り営業日 */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <Calendar size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Remaining</span>
                    </div>
                    <div className="text-2xl font-black text-slate-800">
                        {stats.remainingBusinessDays} <span className="text-xs font-bold text-slate-400">Days</span>
                    </div>
                </div>

                {/* 3. 予測とのギャップ */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <Target size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Estimated</span>
                    </div>
                    <div className="text-2xl font-black text-slate-800">
                        {stats.estimatedTotal} <span className="text-xs font-bold text-slate-400">h</span>
                    </div>
                </div>
            </div>

            {/* 4. 進捗プログレスバー（視覚的な着地予測） */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress Visualizer</span>
                    <span className="text-xs font-bold text-slate-600">Max: {stats.targetMax}h</span>
                </div>

                <div className="relative h-8 bg-slate-100 rounded-2xl p-1 overflow-hidden border border-slate-50">
                    {/* 下限ライン (140h) */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-green-500/30 z-10"
                        style={{ left: `${(stats.targetMin / 200) * 100}%` }}
                    >
                        <span className="absolute -top-1 left-1 text-[8px] text-green-600 font-bold">MIN</span>
                    </div>

                    {/* 上限ライン (180h) */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500/30 z-10"
                        style={{ left: `${(stats.targetMax / 200) * 100}%` }}
                    >
                        <span className="absolute -top-1 left-1 text-[8px] text-red-600 font-bold">MAX</span>
                    </div>

                    {/* 着地予測（半透明の影） */}
                    <div
                        className="h-full bg-cyan-200/40 rounded-xl transition-all duration-1000 ease-out"
                        style={{ width: `${(stats.estimatedTotal / 200) * 100}%` }}
                    />

                    {/* 現在の実績（ソリッド） */}
                    <div
                        className="absolute top-1 left-1 h-6 bg-cyan-500 rounded-xl shadow-lg transition-all duration-700 ease-out"
                        style={{ width: `calc(${(currentTotal / 200) * 100}% - 8px)` }}
                    />
                </div>

                <div className="flex justify-between text-[9px] font-medium text-slate-400 px-1">
                    <span>0h</span>
                    <span>{currentTotal}h (NOW)</span>
                    <span>200h</span>
                </div>
            </div>
        </div>
    );
};
