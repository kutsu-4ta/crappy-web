import { Target, Calendar, TrendingUp, Activity } from 'lucide-react';
import type { DashboardStats } from '../types/workData';
import {DashboardChart} from "./DashboardChart";

interface DashboardProps {
    stats: DashboardStats;
    currentTotal: number;
}

export const Dashboard = ({ stats, currentTotal }: DashboardProps) => {
    // グラフ用ダミーデータ生成（実績 + 予測のライン）
    const data = [
        { day: 1, hours: 8 },
        { day: 5, hours: 40 },
        { day: 10, hours: 80 },
        { day: 15, hours: currentTotal },
        { day: 20, hours: stats.estimatedTotal },
    ];

    return (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

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

            {/* 2. Recharts: 稼働推移と予測グラフ */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Projection Chart</span>
                    <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded">Target: {stats.targetMin}-{stats.targetMax}h</span>
                </div>

                <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                    <DashboardChart stats={stats} currentTotal={currentTotal} data={data}/>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-50">
                    <div className="text-center">
                        <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</div>
                        <div className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">On Track</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Current</div>
                        <div className="text-sm font-black font-mono">{currentTotal}h</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Expected</div>
                        <div className="text-sm font-black font-mono text-cyan-600">{stats.estimatedTotal}h</div>
                    </div>
                </div>
            </div>

            {/* 3. 予測とのギャップ（サブカード） */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex items-center justify-between group hover:border-cyan-200 transition-colors cursor-default">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-cyan-50 transition-colors">
                        <Target className="text-slate-400 group-hover:text-cyan-500" size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Goal Progress</div>
                        <div className="text-lg font-black text-slate-800">
                            あと <span className="text-cyan-600 font-mono">{(stats.targetMin - currentTotal).toFixed(1)}h</span> で下限達成
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
