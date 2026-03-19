import { useState } from 'react';
import { Plus, Minus, Save } from 'lucide-react';

interface WorkInputCardProps {
    onSave: (hours: number) => void;
}

export const WorkInputCard = ({ onSave }: WorkInputCardProps) => {
    const [hours, setHours] = useState(8.0);

    const adjust = (val: number) => setHours(prev => Math.max(0, prev + val));

    return (
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200 text-center">
            <h2 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-widest">Today's Work</h2>

            <div className="text-6xl font-mono font-black text-slate-800 mb-8">
                {hours.toFixed(2)}<span className="text-xl ml-1 text-slate-400">h</span>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-8">
                <button onClick={() => adjust(-1)} className="h-14 rounded-xl bg-slate-50 font-bold hover:bg-slate-100 active:scale-95 transition">-1</button>
                <button onClick={() => adjust(-0.25)} className="h-14 rounded-xl bg-slate-50 font-bold hover:bg-slate-100 active:scale-95 transition">-.25</button>
                <button onClick={() => adjust(0.25)} className="h-14 rounded-xl bg-slate-50 font-bold hover:bg-slate-100 active:scale-95 transition">+.25</button>
                <button onClick={() => adjust(1)} className="h-14 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-600 active:scale-95 transition shadow-lg shadow-cyan-100">+1</button>
            </div>

            <button
                onClick={() => onSave(hours)}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black flex items-center justify-center gap-2 transition"
            >
                <Save size={18} /> SAVE TO SPREADSHEET
            </button>
        </div>
    );
};
