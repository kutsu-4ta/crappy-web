import {useState, useMemo} from 'react';
import {StatusHeader} from './components/StatusHeader';
import {Dashboard} from './components/Dashboard';
import {AttendanceCalendar} from './components/AttendanceCalendar';
import {Navigation, type ViewMode} from './components/Navigation';
import {calculateDashboardStats} from './hooks/useDashboardStats';

function App() {
    const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentTotal, setCurrentTotal] = useState(120);

    const stats = useMemo(() => calculateDashboardStats(currentTotal, 140, 180), [currentTotal]);

    const navigateTo = (view: ViewMode) => {
        setCurrentView(view);
        setIsMenuOpen(false);
    };

    return (
        <div className="min-h-[100svh] bg-slate-50 flex flex-col">
            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
                {/* 修正ポイント: flex flex-row を追加して横並びにし、h-16 などで高さを固定 */}
                <div className="max-w-7xl mx-auto px-4 flex flex-row items-center justify-between h-16 gap-4">

                    {/* 左側: ステータス表示。flex-1 で余白を埋めつつ、中身が溢れたらスクロール */}
                    <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
                        <div className="flex items-center h-full">
                            <StatusHeader stats={stats} />
                        </div>
                    </div>

                    {/* 右側: ナビゲーション。shrink-0 で潰れないように固定 */}
                    <div className="flex-shrink-0 flex items-center h-full">
                        <Navigation
                            currentView={currentView}
                            isMenuOpen={isMenuOpen}
                            setIsMenuOpen={setIsMenuOpen}
                            onNavigate={navigateTo}
                        />
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6">
                {currentView === 'dashboard' && (
                    <Dashboard stats={stats} currentTotal={currentTotal}/>
                )}
                {currentView === 'attendance' && <AttendanceCalendar/>}

                {/* Placeholder Views */}
                {(currentView === 'punch' || currentView === 'expense') && (
                    <div
                        className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white">
                        <span className="font-black text-xl uppercase italic">{currentView}</span>
                        <p className="text-xs font-bold mt-2">Coming Soon...</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;