import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import type { DashboardStats, ChartDataPoint } from '../types/WorkData';
import { DashboardChart } from './DashboardChart';

interface Props {
  stats: DashboardStats;
  chartData: ChartDataPoint[];
}

export const Dashboard = ({ stats, chartData }: Props) => {
  const {
    currentTotal, estimatedTotal, requiredDailyHours, upperLimitDailyHours,
    towardsMin, towardsMax, remainingBusinessDays, targetMin, targetMax, dailyAverage,
  } = stats;

  const isOnTrack = estimatedTotal >= targetMin && estimatedTotal <= targetMax;
  const isUnder = estimatedTotal < targetMin;
  const landingColor = isOnTrack ? '#10b981' : isUnder ? '#f59e0b' : '#f43f5e';
  const landingLabel = isOnTrack ? '下限クリア・上限OK' : isUnder ? '下限割れ注意' : '上限超過注意';

  return (
    <Stack spacing={2}>
      {/* Hero: Required Pace */}
      <Card
        sx={{
          bgcolor: '#0f172a',
          border: 'none',
          borderRadius: 5,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Typography
            sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#475569', letterSpacing: '0.15em', mb: 2 }}
          >
            REQUIRED PACE
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: '4.5rem',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    lineHeight: 1,
                    color: '#22d3ee',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {requiredDailyHours}
                </Typography>
                <Typography sx={{ color: '#334155', fontWeight: 700, fontSize: '1.1rem' }}>
                  h / day
                </Typography>
              </Box>
              <Typography sx={{ color: '#475569', fontSize: '0.75rem', mt: 0.5 }}>
                上限 <Box component="span" sx={{ color: '#94a3b8', fontWeight: 700 }}>{upperLimitDailyHours}h/day</Box> まで
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '0.55rem', color: '#334155', fontWeight: 800, letterSpacing: '0.1em', mb: 0.5 }}>
                REMAINING
              </Typography>
              <Typography
                sx={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  fontStyle: 'italic',
                  color: '#fff',
                  lineHeight: 1,
                }}
              >
                {remainingBusinessDays}d
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '0.7rem' }}>
                avg {dailyAverage}h/day
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Warning Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <Card>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', mb: 1 }}>
              下限まで
            </Typography>
            <Typography
              sx={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace', color: '#f59e0b', lineHeight: 1 }}
            >
              {towardsMin}h
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mt: 0.5 }}>
              {requiredDailyHours}h/day 必要
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', mb: 1 }}>
              上限まで
            </Typography>
            <Typography
              sx={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace', color: '#f43f5e', lineHeight: 1 }}
            >
              {towardsMax}h
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mt: 0.5 }}>
              {upperLimitDailyHours}h/day 以内に
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Chart Card */}
      <Card>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          {/* Summary line */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', mb: 0.5 }}>
                月末着地予測
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    color: landingColor,
                    lineHeight: 1,
                  }}
                >
                  {estimatedTotal}h
                </Typography>
                <Chip
                  label={landingLabel}
                  size="small"
                  sx={{
                    bgcolor: `${landingColor}18`,
                    color: landingColor,
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    border: `1px solid ${landingColor}40`,
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', mb: 0.5 }}>
                累計
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'monospace', color: '#0f172a' }}>
                {currentTotal}h
              </Typography>
            </Box>
          </Box>

          <Box sx={{ height: 220 }}>
            <DashboardChart stats={stats} data={chartData} />
          </Box>

          {/* Legend */}
          <Box sx={{ display: 'flex', gap: 2.5, mt: 2 }}>
            {[
              { color: '#0891b2', label: '実績', solid: true },
              { color: '#22d3ee', label: '予測', solid: false },
              { color: '#10b981', label: 'ターゲット', solid: false, area: true },
            ].map(item => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                {item.area ? (
                  <Box sx={{ width: 14, height: 10, bgcolor: `${item.color}25`, border: `1px solid ${item.color}60`, borderRadius: 0.5 }} />
                ) : (
                  <Box sx={{ width: 14, height: 2, bgcolor: item.solid ? item.color : 'transparent', borderTop: item.solid ? 'none' : `2px dashed ${item.color}` }} />
                )}
                <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>{item.label}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
};
