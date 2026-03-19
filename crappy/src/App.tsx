import './App.css'
import {useState, useMemo} from 'react';
import {StatusHeader} from './components/StatusHeader';
import {calculateDashboardStats} from './hooks/useDashboardStats';
import {WorkInputCard} from "./components/WorkInputCard";
import {Dashboard} from "./components/Dashboard";

function App() {
    // 本来はスプシから取得する値（今は仮で100時間入力済みとする）
    const [currentTotal, setCurrentTotal] = useState(100);

    // 契約条件（これも設定画面で変えられるようにすると良い）
    const CONTRACT_MIN = 140;
    const CONTRACT_MAX = 180;

    // メモ化して無駄な再計算を防ぐ
    const stats = useMemo(() =>
            calculateDashboardStats(currentTotal, CONTRACT_MIN, CONTRACT_MAX),
        [currentTotal]
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="min-h-screen bg-slate-50 pb-24">
                <StatusHeader stats={stats}/>

            </div>
            <main className="max-w-md mx-auto p-6">
                <Dashboard
                    stats={stats}
                    currentTotal={currentTotal}
                    targetMin={140}
                    targetMax={180}
                />
                {/*<WorkInputCard onSave={(h) => console.log(`${h}時間を保存します`)}/>*/}

                {/* デバッグ用スライダーは下に追いやるか消す */}
                <div className="p-4 bg-slate-100 rounded-lg opacity-50">
                    <label className="text-[10px] text-slate-400 uppercase">Current Total Debug</label>
                    <input type="range" min="0" max="200" value={currentTotal}
                           onChange={(e) => setCurrentTotal(Number(e.target.value))} className="w-full"/>
                </div>

            </main>
        </div>
    );
}

export default App;
