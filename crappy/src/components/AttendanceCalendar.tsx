import { useState } from 'react';
import { ChevronLeft, ChevronRight, Save, Smile, AlertCircle } from 'lucide-react';

export const AttendanceCalendar = () => {
    const [weekOffset, setWeekOffset] = useState(0);
    const [showModal, setShowModal] = useState(false);

    // --- モーダル内の質問用ステート ---
    const [motivation, setMotivation] = useState<number | null>(null);
    const [memo, setMemo] = useState<string>("");

    // 各行の「除外」状態を管理（本来はDBから取得する初期値を入れる）
    const [excludedDays, setExcludedDays] = useState<boolean[]>(new Array(7).fill(false));

    // チェックボックスの切り替えハンドラー
    const toggleExclude = (index: number) => {
        setExcludedDays(prev => {
            const next = [...prev];
            next[index] = !next[index];
            return next;
        });
    };

    return (
        <div className="space-y-4">
            {/* ヘッダー・操作系 */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex gap-2">
                    <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft size={20}/></button>
                    <button onClick={() => setWeekOffset(0)} className="px-4 py-1 text-sm font-bold bg-slate-100 rounded-lg">今週</button>
                    <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight size={20}/></button>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 flex items-center gap-2"
                >
                    保存する
                </button>
            </div>

            {/* 週次入力テーブル */}
            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-black">
                        <th className="p-4">日付</th>
                        <th className="p-4">開始</th>
                        <th className="p-4">終了</th>
                        <th className="p-4">休憩</th>
                        <th className="p-4 text-right">実働</th>
                        <th className="p-4 text-center">除外</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                    {excludedDays.map((isExcluded, i) => (
                        <tr key={i} className={`transition-colors ${isExcluded ? 'bg-slate-50 opacity-50' : 'hover:bg-slate-50/50'}`}>
                            <td className={`p-4 font-bold ${isExcluded ? 'text-slate-400' : 'text-slate-600'}`}>
                                3/2{i} (月)
                            </td>
                            <td className="p-4">
                                <input
                                    type="time"
                                    defaultValue="09:00"
                                    disabled={isExcluded}
                                    className="bg-slate-100 border-none rounded-md p-1 focus:ring-2 ring-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-200"
                                />
                            </td>
                            <td className="p-4">
                                <input
                                    type="time"
                                    defaultValue="18:00"
                                    disabled={isExcluded}
                                    className="bg-slate-100 border-none rounded-md p-1 focus:ring-2 ring-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-200"
                                />
                            </td>
                            <td className="p-4">
                                <input
                                    type="number"
                                    step="0.25"
                                    defaultValue="1.0"
                                    disabled={isExcluded}
                                    className="w-16 bg-slate-100 border-none rounded-md p-1 disabled:cursor-not-allowed disabled:bg-slate-200"
                                />
                            </td>
                            <td className={`p-4 text-right font-mono font-bold ${isExcluded ? 'text-slate-300' : 'text-slate-400'}`}>
                                {isExcluded ? '0.0h' : '8.0h'}
                            </td>
                            <td className="p-4 text-center">
                                <input
                                    type="checkbox"
                                    checked={isExcluded}
                                    onChange={() => toggleExclude(i)}
                                    className="w-5 h-5 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="p-2 bg-cyan-50 rounded-xl text-cyan-600">
                                <AlertCircle size={24}/>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Condition Report</h3>
                            </div>
                        </div>

                        <div className="space-y-6 overflow-y-auto max-h-[70vh] px-1">
                            {/* モチベーション */}
                            <div className="space-y-3">
                                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    モチベーション <span className="text-[10px] bg-rose-100 text-rose-500 px-1.5 py-0.5 rounded italic font-black">必須</span>
                                </p>
                                <div className="flex gap-2">
                                    {[
                                        { id: 1, label: '普通', emoji: '😐' },
                                        { id: 2, label: 'もっとできる', emoji: '🔥' },
                                        { id: 3, label: '逃げたい', emoji: '🏃' }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setMotivation(item.id)}
                                            className={`flex-1 p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                                                motivation === item.id
                                                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-md shadow-cyan-100'
                                                    : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                                            }`}
                                        >
                                            <span className="text-xl">{item.emoji}</span>
                                            <span className="text-[10px] font-bold">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Q2. 健康状態 */}
                            {/*<div className="space-y-3">*/}
                            {/*    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">*/}
                            {/*        <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px]">Q2</span>*/}
                            {/*        最近の健康状態は？ <span className="text-[10px] bg-rose-100 text-rose-500 px-1.5 py-0.5 rounded italic font-black">必須</span>*/}
                            {/*    </p>*/}
                            {/*    <div className="flex gap-2">*/}
                            {/*        {[*/}
                            {/*            { id: 1, label: '良好', emoji: '💪' },*/}
                            {/*            { id: 2, label: '普通', emoji: '👌' },*/}
                            {/*            { id: 3, label: '不良', emoji: '🤒' }*/}
                            {/*        ].map(item => (*/}
                            {/*            <button*/}
                            {/*                key={item.id}*/}
                            {/*                onClick={() => setHealth(item.id)}*/}
                            {/*                className={`flex-1 p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${*/}
                            {/*                    health === item.id*/}
                            {/*                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-md shadow-cyan-100'*/}
                            {/*                        : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'*/}
                            {/*                }`}*/}
                            {/*            >*/}
                            {/*                <span className="text-xl">{item.emoji}</span>*/}
                            {/*                <span className="text-[10px] font-bold">{item.label}</span>*/}
                            {/*            </button>*/}
                            {/*        ))}*/}
                            {/*    </div>*/}
                            {/*</div>*/}

                            {/* フリー記述 */}
                            <div className="space-y-3">
                                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    ジャーナル <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded italic font-black">任意</span>
                                </p>
                                <textarea
                                    rows={3}
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-cyan-500/20 transition-all placeholder:text-slate-300"
                                    placeholder="気づきやタスクなど"
                                    value={memo || ''}
                                    onChange={(e) => setMemo(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!motivation}
                                className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black active:scale-95 disabled:bg-slate-200 disabled:shadow-none disabled:active:scale-100 transition-all text-sm"
                                onClick={() => {
                                    console.log({ motivation, memo });
                                    setShowModal(false);
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
