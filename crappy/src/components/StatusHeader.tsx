// import { DashboardStats} from "../types/workData"; これはダメ
import type { DashboardStats } from '../types/workData'; //　これはOK
import { Gauge, Target, AlertTriangle } from 'lucide-react';

interface StatusHeaderProps {
    stats: DashboardStats;
}

export const StatusHeader = ({ stats }: StatusHeaderProps) => {
    // propsの中身を展開して使いやすくする
    const { estimatedTotal, requiredDailyHours, upperLimitWarning, remainingBusinessDays } = stats;

    return (
        <div className="bg-slate-900 text-white p-4 sticky top-0 shadow-lg border-b border-slate-700">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">

                {/* ① 月末着地予測（メイン） */}
                <div className="flex items-center gap-2">
                    <Gauge className="text-cyan-400 w-5 h-5" />
                    <span className="text-sm font-medium text-slate-400">月末予測:</span>
                    <span className="text-2xl font-bold text-cyan-400">{estimatedTotal}h</span>
                </div>

                {/* ② 思考を奪う「1日あたりのノルマ」 */}
                <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Target size={14} className="text-green-400" /> 下限達成
                        </div>
                        <span className="text-lg font-mono font-bold text-green-400">
              {requiredDailyHours}h<span className="text-xs font-normal">/日</span>
            </span>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                            <AlertTriangle size={14} className="text-rose-400" /> 上限セーフ
                        </div>
                        <span className="text-lg font-mono font-bold text-rose-400">
              {upperLimitWarning}h<span className="text-xs font-normal">/日</span>
            </span>
                    </div>
                </div>

                {/* ③ 残り営業日（おまけ） */}
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">
                    残り {remainingBusinessDays} 営業日
                </div>
            </div>
        </div>
    );
};

