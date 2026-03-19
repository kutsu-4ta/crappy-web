import { Menu, X, Clock, Calendar, Receipt, LayoutDashboard } from 'lucide-react';

export type ViewMode = 'dashboard' | 'punch' | 'attendance' | 'expense';

interface Props {
    currentView: ViewMode;
    isMenuOpen: boolean;
    setIsMenuOpen: (open: boolean) => void;
    onNavigate: (view: ViewMode) => void;
}

export const Navigation = ({ currentView, isMenuOpen, setIsMenuOpen, onNavigate }: Props) => {
    const menuItems = [
        { id: 'dashboard', label: 'DASHBOARD', icon: <LayoutDashboard size={20} /> },
        { id: 'punch', label: 'PUNCH', icon: <Clock size={20} /> },
        { id: 'attendance', label: 'ATTENDANCE', icon: <Calendar size={20} /> },
        { id: 'expense', label: 'EXPENSE', icon: <Receipt size={20} /> },
    ] as const;

    return (
        <>
            {/* メニューボタン */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-14 h-full flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white border-l border-slate-700 shrink-0 transition-colors z-[101]"
            >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* メニューオーバーレイ */}
            {isMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-90 animate-in fade-in duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <nav className="absolute top-14 left-0 w-full bg-slate-900 p-3 border-b border-slate-800 z-100 flex flex-col gap-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={`flex items-center gap-4 w-full p-4 rounded-xl font-black text-sm transition-all active:scale-[0.98] ${
                                    currentView === item.id
                                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-900/40'
                                        : 'text-slate-400 hover:bg-slate-800'
                                }`}
                            >
                                <div className={currentView === item.id ? 'text-white' : 'text-cyan-400'}>
                                    {item.icon}
                                </div>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </>
            )}
        </>
    );
};
