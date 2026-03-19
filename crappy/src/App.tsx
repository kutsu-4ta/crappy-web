import { useState, useMemo } from 'react';
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
import { useAuth } from './hooks/useAuth';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const { user, signOutUser } = useAuth();
  const { sessions, addSession, updateSession, deleteSession, getDailyTotals } = useWorkSessions();
  const { settings, updateSettings } = useMonthSettings();

  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const dailyTotals = useMemo(
    () => getDailyTotals(year, month),
    [getDailyTotals, year, month]
  );

  const stats = useMemo(
    () => calculateDashboardStats(dailyTotals, settings, today),
    [dailyTotals, settings, today]
  );

  const chartData = useMemo(
    () => buildChartData(dailyTotals, settings, today),
    [dailyTotals, settings, today]
  );

  const navigateTo = (view: ViewMode) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

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

          {/* User Avatar */}
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

      {/* User dropdown menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: { borderRadius: 3, minWidth: 200, mt: 0.5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' },
          },
        }}
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
          <Dashboard stats={stats} chartData={chartData} />
        )}
        {currentView === 'attendance' && (
          <AttendanceCalendar
            sessions={sessions}
            onUpdate={updateSession}
            onDelete={deleteSession}
          />
        )}
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
          settings={settings}
          onSave={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </Box>
  );
}

export default App;
