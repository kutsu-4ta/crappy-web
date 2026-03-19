import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export type ViewMode = 'dashboard' | 'punch' | 'attendance' | 'expense';

interface Props {
  currentView: ViewMode;
  isMenuOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewMode) => void;
}

const menuItems = [
  { id: 'dashboard' as ViewMode, label: 'Dashboard', sublabel: '概況', icon: <DashboardIcon /> },
  { id: 'punch' as ViewMode, label: 'Punch', sublabel: '打刻', icon: <AccessTimeIcon /> },
  { id: 'attendance' as ViewMode, label: 'Attendance', sublabel: '稼働ログ', icon: <CalendarMonthIcon /> },
  { id: 'expense' as ViewMode, label: 'Expense', sublabel: '経費', icon: <ReceiptLongIcon /> },
];

export const Navigation = ({ currentView, isMenuOpen, onClose, onNavigate }: Props) => {
  return (
    <Drawer anchor="right" open={isMenuOpen} onClose={onClose}>
      <Box sx={{ width: 260, pt: 3, pb: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="caption"
          sx={{ px: 3, mb: 2, color: '#334155', letterSpacing: '0.15em', fontSize: '0.65rem' }}
        >
          MENU
        </Typography>
        <List sx={{ px: 1, flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => onNavigate(item.id)}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    px: 2,
                    '&.Mui-selected': {
                      bgcolor: '#0891b2',
                      '&:hover': { bgcolor: '#0e7490' },
                    },
                    '&:hover': { bgcolor: '#1e293b' },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? '#fff' : '#22d3ee',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <Box>
                    <Typography
                      sx={{
                        color: isActive ? '#fff' : '#94a3b8',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography sx={{ color: isActive ? 'rgba(255,255,255,0.6)' : '#475569', fontSize: '0.7rem' }}>
                      {item.sublabel}
                    </Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};
