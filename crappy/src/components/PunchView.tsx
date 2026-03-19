import { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Check, Clock } from 'lucide-react';

export const PunchView = ({ onSave }: { onSave: (hours: number) => void }) => {
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedHours, setElapsedHours] = useState(0);
    const [isWorking, setIsWorking] = useState(false);

    // 1分ごとに経過時間を更新（表示用）
    useEffect(() => {
        let interval: number;
        if (isWorking && startTime) {
            interval = window.setInterval(() => {
                const diffMs = new Date().getTime() - startTime.getTime();
                setElapsedHours(diffMs / (1000 * 60 * 60));
            }, 60000);
        }
        return () => clearInterval(interval);
    }, [isWorking, startTime]);

    const handleStart = () => {
        setStartTime(new Date());
        setIsWorking(true);
    };

    const handleEnd = () => {
        setIsWorking(false);
        // 終了時に微調整モードへ（現在の経過時間を保持）
    };

    const adjust = (amount: number) => {
        setElapsedHours(prev => Math.max(0, prev + amount));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* メイン表示：稼働中なら自動カウントアップ、止まれば手動調整モード */}
            <div className={`rounded-[3rem] p-10 text-center shadow-2xl transition-all duration-700 ${
                isWorking ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-white'
            }`}>
                <div className="flex items-center justify-center gap-2 mb-2 opacity-50">
                    <Clock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            {isWorking ? 'Now Working...' : 'Total Work Time'}
          </span>
                </div>

                <div className="flex items-baseline justify-center gap-2">
          <span className="text-8xl font-black font-mono tracking-tighter">
            {elapsedHours.toFixed(2)}
          </span>
                    <span className="text-2xl font-bold opacity-40">h</span>
                </div>

                {startTime && (
                    <div className="mt-4 text-[10px] font-bold opacity-40 uppercase tracking-widest">
                        Started at {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
            </div>

            {/* 打刻アクション：大きなトグルボタン */}
            {!isWorking ? (
                <button
                    onClick={handleStart}
                    className="w-full bg-white border-4 border-cyan-500 text-cyan-600 h-24 rounded-[2.5rem] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-lg shadow-cyan-100"
                >
                    <Play size={32} fill="currentColor" />
                    <span className="text-2xl font-black italic">CLOCK IN</span>
                </button>
            ) : (
                <button
                    onClick={handleEnd}
                    className="w-full bg-rose-500 text-white h-24 rounded-[2.5rem] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-lg shadow-rose-200"
                >
                    <Square size={32} fill="currentColor" />
                    <span className="text-2xl font-black italic">CLOCK OUT</span>
                </button>
            )}

            {/* 雑な微調整：出勤・退勤後に「休憩引くの忘れた」「キリよくしたい」を解決 */}
            <div className="grid grid-cols-4 gap-2 pt-4">
                <AdjustButton label="-1.0" onClick={() => adjust(-1)} />
                <AdjustButton label="-0.25" onClick={() => adjust(-0.25)} />
                <AdjustButton label="+0.25" onClick={() => adjust(0.25)} />
                <AdjustButton label="+1.0" onClick={() => adjust(1)} />
            </div>

            {/* 最終確定 */}
            {!isWorking && elapsedHours > 0 && (
                <button
                    onClick={() => onSave(elapsedHours)}
                    className="w-full bg-slate-800 text-cyan-400 h-16 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest mt-4 border-2 border-slate-700"
                >
                    <Check size={20} />
                    Log This Session
                </button>
            )}
        </div>
    );
};

const AdjustButton = ({ label, onClick }: any) => (
    <button
        onClick={onClick}
        className="bg-white border border-slate-200 h-12 rounded-xl text-[10px] font-black text-slate-500 active:bg-slate-100 transition-colors"
    >
        {label}
    </button>
);
