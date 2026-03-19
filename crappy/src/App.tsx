import { useState, useMemo } from 'react';
import { StatusHeader } from './components/StatusHeader';
import { Dashboard } from './components/Dashboard';
import { AttendanceCalendar } from './components/AttendanceCalendar';
import { calculateDashboardStats } from './hooks/useDashboardStats';
import { Menu, X, Clock, Calendar, Receipt, LayoutDashboard } from 'lucide-react';

type ViewMode = 'dashboard' | 'punch' | 'attendance' | 'expense';

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
        /* min-h-screenに加えて、スマホのツールバー被りを防ぐ svh を推奨 */
        <div className="min-h-screen bg-slate-50 flex flex-col" style={{ minHeight: '100svh' }}>

            {/* --- HEADER BLOCK --- */}
            <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800" style={{ position: 'relative' }}>
                <div className="max-w-5xl mx-auto h-14" style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>

                    {/*
                        StatusHeader 側:
                        スマホで中身が入り切らない場合を考慮して overflow-x-auto を指定
                    */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <StatusHeader stats={stats} />
                    </div>

                    {/* メニューボタン: スマホで押しやすいよう 14(56px) 四方を確保 */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-14 h-full flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white border-l border-slate-700 shrink-0 transition-colors"
                        style={{ outline: 'none' }}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* --- MENU OVERLAY --- */}
                {isMenuOpen && (
                    <>
                        {/* 背景の遮断（ここをタップでも閉じれる） */}
                        <div
                            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 }}
                            onClick={() => setIsMenuOpen(false)}
                        />
                        {/* メニュー本体 */}
                        <div style={{
                            position: 'absolute',
                            top: '56px',
                            left: 0,
                            width: '100%',
                            backgroundColor: '#0f172a',
                            padding: '12px',
                            borderBottom: '1px solid #1e293b',
                            zIndex: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
                        }}>
                            <NavButton icon={<LayoutDashboard size={20} />} label="DASHBOARD" onClick={() => navigateTo('dashboard')} active={currentView === 'dashboard'} />
                            <NavButton icon={<Clock size={20} />} label="PUNCH" onClick={() => navigateTo('punch')} active={currentView === 'punch'} />
                            <NavButton icon={<Calendar size={20} />} label="ATTENDANCE" onClick={() => navigateTo('attendance')} active={currentView === 'attendance'} />
                            <NavButton icon={<Receipt size={20} />} label="EXPENSE" onClick={() => navigateTo('expense')} active={currentView === 'expense'} />
                        </div>
                    </>
                )}
            </header>

            {/* --- CONTENT AREA --- */}
            <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6">
                <div style={{ width: '100%' }}>
                    {currentView === 'dashboard' && <Dashboard stats={stats} currentTotal={currentTotal} targetMin={140} targetMax={180} />}
                    {currentView === 'attendance' && <AttendanceCalendar />}
                    {(currentView === 'punch' || currentView === 'expense') && (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white">
                            <span className="font-black text-xl uppercase italic">{currentView}</span>
                            <p className="text-xs font-bold mt-2">Coming Soon...</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

const NavButton = ({ icon, label, onClick, active }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-4 w-full p-4 rounded-xl font-black text-sm transition-all active:scale-[0.98] ${
            active
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-900/40'
                : 'text-slate-400 hover:bg-slate-800'
        }`}
        style={{ border: 'none', cursor: 'pointer', textAlign: 'left' }}
    >
        <div style={{ color: active ? 'white' : '#22d3ee' }}>{icon}</div>
        {label}
    </button>
);

export default App;