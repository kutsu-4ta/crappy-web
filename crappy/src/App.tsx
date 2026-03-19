import { useState, useMemo } from 'react';
import { format, parse, endOfMonth, addMonths } from 'date-fns';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';

import { StatusHeader } from './components/StatusHeader';
import { Dashboard } from './components/Dashboard';
import { AttendanceCalendar } from './components/AttendanceCalendar';
import { Navigation, type ViewMode } from './components/Navigation';
import { calculateDashboardStats, buildChartData } from './hooks/useDashboardStats';
import { PunchView } from './components/PunchView';
import { ExpenseView } from './components/ExpenseView';
import { SettingsModal } from './components/SettingsModal';
import { useWorkSessions } from './hooks/useWorkSessions';
import { useMonthSettings } from './hooks/useMonthSettings';
import { useDashboardData } from './hooks/useDashboardData';
import { useAuth } from './hooks/useAuth';
import { ToastProvider } from './contexts/ToastContext';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  const { user, signOutUser } = useAuth();
  const { loading: punchLoading, addSession } = useWorkSessions();
  const { settings, defaults, monthOverride, updateDefaults, updateMonthSettings } = useMonthSettings(selectedMonth);
  const { loading: dashLoading, dailyTotals } = useDashboardData(selectedMonth);

  const today = useMemo(() => new Date(), []);
  const currentMonth = format(today, 'yyyy-MM');
  const isCurrentMonth = selectedMonth === currentMonth;

  // 過去月表示時は月末を基準日にして統計を計算
  const effectiveToday = useMemo(() => {
    if (isCurrentMonth) return today;
    const monthDate = parse(selectedMonth, 'yyyy-MM', new Date());
    return endOfMonth(monthDate);
  }, [selectedMonth, isCurrentMonth, today]);

  const stats = useMemo(
    () => calculateDashboardStats(dailyTotals, settings, effectiveToday),
    [dailyTotals, settings, effectiveToday],
  );

  const chartData = useMemo(
    () => buildChartData(dailyTotals, settings, effectiveToday),
    [dailyTotals, settings, effectiveToday],
  );

  const navigateTo = (view: ViewMode) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  const handlePrevMonth = () =>
    setSelectedMonth(m => format(addMonths(parse(m, 'yyyy-MM', new Date()), -1), 'yyyy-MM'));

  const handleNextMonth = () => {
    if (isCurrentMonth) return;
    setSelectedMonth(m => format(addMonths(parse(m, 'yyyy-MM', new Date()), 1), 'yyyy-MM'));
  };

  const loading = currentView === 'dashboard' ? dashLoading : punchLoading;

  return (
    <Box sx={{ minHeight: '100svh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        sx={{ bgcolor: '#0f172a', boxShadow: 'none', borderBottom: '1px solid #1e293b' }}
      >
        <Toolbar sx={{ minHeight: '56px !important', px: 1.5, gap: 0.5 }}>
          <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <StatusHeader stats={stats} />
          </Box>

          <IconButton
            onClick={() => setShowSettings(true)}
            size="small"
            sx={{ color: '#475569', '&:hover': { color: '#94a3b8', bgcolor: '#1e293b' } }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>

          <Tooltip title={user?.email ?? ''}>
            <IconButton
              size="small"
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              sx={{ p: 0.5 }}
            >
              <Avatar
                src={user?.photoURL ?? undefined}
                alt={user?.displayName ?? 'User'}
                sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#0891b2' }}
              >
                {user?.displayName?.[0] ?? user?.email?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          <IconButton
            onClick={() => setIsMenuOpen(true)}
            size="small"
            sx={{ color: '#475569', '&:hover': { color: '#94a3b8', bgcolor: '#1e293b' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 200, mt: 0.5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' } } }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
            {user?.displayName}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {user?.email}
          </Typography>
        </Box>
        <MenuItem
          onClick={() => { signOutUser(); setUserMenuAnchor(null); }}
          sx={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: 600, py: 1.5 }}
        >
          サインアウト
        </MenuItem>
      </Menu>

      <Container maxWidth="sm" sx={{ flex: 1, py: 2.5, px: { xs: 2, sm: 3 } }}>
        {currentView === 'dashboard' && (
          loading ? (
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={40} sx={{ borderRadius: 3 }} />
              <Skeleton variant="rounded" height={148} sx={{ borderRadius: 5 }} />
              <Stack direction="row" spacing={1.5}>
                <Skeleton variant="rounded" height={96} sx={{ flex: 1, borderRadius: 3 }} />
                <Skeleton variant="rounded" height={96} sx={{ flex: 1, borderRadius: 3 }} />
              </Stack>
              <Skeleton variant="rounded" height={320} sx={{ borderRadius: 5 }} />
            </Stack>
          ) : (
            <Dashboard
              stats={stats}
              chartData={chartData}
              selectedMonth={selectedMonth}
              isCurrentMonth={isCurrentMonth}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              defaults={defaults}
              monthOverride={monthOverride}
              onSaveMonthSettings={updateMonthSettings}
            />
          )
        )}
        {currentView === 'attendance' && <AttendanceCalendar />}
        {currentView === 'punch' && (
          <PunchView
            onSave={(hours) => {
              addSession(today, hours);
              navigateTo('dashboard');
            }}
          />
        )}
        {currentView === 'expense' && <ExpenseView />}
      </Container>

      <Navigation
        currentView={currentView}
        isMenuOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={navigateTo}
      />

      {showSettings && (
        <SettingsModal
          defaults={defaults}
          onSave={updateDefaults}
          onClose={() => setShowSettings(false)}
        />
      )}
    </Box>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
