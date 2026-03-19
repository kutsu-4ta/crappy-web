import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { DashboardStats } from '../types/WorkData';

interface Props {
  stats: DashboardStats;
}

export const StatusHeader = ({ stats }: Props) => {
  const { currentTotal, estimatedTotal, requiredDailyHours, upperLimitDailyHours, remainingBusinessDays } = stats;

  const items = [
    { label: 'NOW', value: `${currentTotal}h`, color: '#e2e8f0' },
    { label: '→ EST', value: `${estimatedTotal}h`, color: '#22d3ee' },
    { label: 'MIN', value: `${requiredDailyHours}h/d`, color: '#4ade80' },
    { label: 'MAX', value: `${upperLimitDailyHours}h/d`, color: '#fb7185' },
  ];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, height: '100%', overflow: 'hidden' }}>
      {items.map((item, i) => (
        <Box
          key={item.label}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            px: 1.5,
            borderLeft: i > 0 ? '1px solid #1e293b' : 'none',
          }}
        >
          <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#475569', letterSpacing: '0.1em', lineHeight: 1.2 }}>
            {item.label}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'monospace', color: item.color, lineHeight: 1.2 }}>
            {item.value}
          </Typography>
        </Box>
      ))}
      <Box sx={{ ml: 'auto', px: 1.5 }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#334155', letterSpacing: '0.08em' }}>
          {remainingBusinessDays}d
        </Typography>
      </Box>
    </Box>
  );
};
