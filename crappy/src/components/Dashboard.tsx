import { useState } from 'react';
import { format, parse } from 'date-fns';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import CircularProgress from '@mui/material/CircularProgress';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TuneIcon from '@mui/icons-material/Tune';
import type { DashboardStats, ChartDataPoint, AppSettings, MonthSettings } from '../types/WorkData';
import { DashboardChart } from './DashboardChart';

interface Props {
  stats: DashboardStats;
  chartData: ChartDataPoint[];
  selectedMonth: string;
  isCurrentMonth: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  defaults: AppSettings;
  monthOverride: MonthSettings | null;
  onSaveMonthSettings: (override: MonthSettings | null) => Promise<void>;
}

export const Dashboard = ({
  stats,
  chartData,
  selectedMonth,
  isCurrentMonth,
  onPrevMonth,
  onNextMonth,
  defaults,
  monthOverride,
  onSaveMonthSettings,
}: Props) => {
  const [showMonthEdit, setShowMonthEdit] = useState(false);
  const [editMin, setEditMin] = useState('');
  const [editMax, setEditMax] = useState('');
  const [saving, setSaving] = useState(false);

  const {
    currentTotal, estimatedTotal, requiredDailyHours, upperLimitDailyHours,
    towardsMin, towardsMax, remainingBusinessDays, targetMin, targetMax, dailyAverage,
  } = stats;

  const isOnTrack = estimatedTotal >= targetMin && estimatedTotal <= targetMax;
  const isUnder = estimatedTotal < targetMin;
  const landingColor = isOnTrack ? '#10b981' : isUnder ? '#f59e0b' : '#f43f5e';
  const landingLabel = isOnTrack ? '下限クリア・上限OK' : isUnder ? '下限割れ注意' : '上限超過注意';

  const monthLabel = format(parse(selectedMonth, 'yyyy-MM', new Date()), 'yyyy年M月');

  const openEdit = () => {
    setEditMin(String(monthOverride?.targetMin ?? defaults.targetMin));
    setEditMax(String(monthOverride?.targetMax ?? defaults.targetMax));
    setShowMonthEdit(true);
  };

  const handleSaveMonthSettings = async () => {
    const min = Number(editMin);
    const max = Number(editMax);
    if (min <= 0 || max <= min) return;
    setSaving(true);
    await onSaveMonthSettings({ targetMin: min, targetMax: max });
    setSaving(false);
    setShowMonthEdit(false);
  };

  const handleResetMonthSettings = async () => {
    setSaving(true);
    await onSaveMonthSettings(null);
    setSaving(false);
    setShowMonthEdit(false);
  };

  return (
    <Stack spacing={2}>
      {/* Month navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton size="small" onClick={onPrevMonth} sx={{ color: '#64748b' }}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
          {monthLabel}
          {monthOverride && (
            <Chip
              label="月別設定"
              size="small"
              sx={{ ml: 1, bgcolor: 'rgba(8,145,178,0.1)', color: '#0891b2', fontWeight: 700, fontSize: '0.6rem', height: 18 }}
            />
          )}
        </Typography>
        <IconButton size="small" onClick={onNextMonth} disabled={isCurrentMonth} sx={{ color: '#64748b' }}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

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
            {isCurrentMonth ? 'REQUIRED PACE' : '月次実績'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography
                  sx={{ fontSize: '4.5rem', fontWeight: 900, fontFamily: 'monospace', lineHeight: 1, color: '#22d3ee', letterSpacing: '-0.03em' }}
                >
                  {isCurrentMonth ? requiredDailyHours : currentTotal}
                </Typography>
                <Typography sx={{ color: '#334155', fontWeight: 700, fontSize: '1.1rem' }}>
                  {isCurrentMonth ? 'h / day' : 'h'}
                </Typography>
              </Box>
              {isCurrentMonth && (
                <Typography sx={{ color: '#475569', fontSize: '0.75rem', mt: 0.5 }}>
                  上限 <Box component="span" sx={{ color: '#94a3b8', fontWeight: 700 }}>{upperLimitDailyHours}h/day</Box> まで
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '0.55rem', color: '#334155', fontWeight: 800, letterSpacing: '0.1em', mb: 0.5 }}>
                {isCurrentMonth ? 'REMAINING' : 'TARGET'}
              </Typography>
              <Typography
                sx={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'monospace', fontStyle: 'italic', color: '#fff', lineHeight: 1 }}
              >
                {isCurrentMonth ? `${remainingBusinessDays}d` : `${targetMin}〜${targetMax}h`}
              </Typography>
              {isCurrentMonth && (
                <Typography sx={{ color: '#475569', fontSize: '0.7rem' }}>
                  avg {dailyAverage}h/day
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <Card>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', mb: 1 }}>
              下限まで
            </Typography>
            <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace', color: '#f59e0b', lineHeight: 1 }}>
              {towardsMin}h
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mt: 0.5 }}>
              {isCurrentMonth ? `${requiredDailyHours}h/day 必要` : `下限 ${targetMin}h`}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', mb: 1 }}>
              上限まで
            </Typography>
            <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace', color: '#f43f5e', lineHeight: 1 }}>
              {towardsMax}h
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mt: 0.5 }}>
              {isCurrentMonth ? `${upperLimitDailyHours}h/day 以内に` : `上限 ${targetMax}h`}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Chart */}
      <Card>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', mb: 0.5 }}>
                {isCurrentMonth ? '月末着地予測' : '月次累計'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'monospace', color: landingColor, lineHeight: 1 }}>
                  {estimatedTotal}h
                </Typography>
                <Chip
                  label={landingLabel}
                  size="small"
                  sx={{ bgcolor: `${landingColor}18`, color: landingColor, fontWeight: 700, fontSize: '0.65rem', border: `1px solid ${landingColor}40` }}
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

          {/* Month settings */}
          <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              目標：<Box component="span" sx={{ fontWeight: 700, color: '#64748b' }}>{targetMin}h〜{targetMax}h</Box>
              {monthOverride && <Box component="span" sx={{ ml: 0.5, color: '#0891b2', fontSize: '0.65rem' }}>（月別設定）</Box>}
              {!monthOverride && <Box component="span" sx={{ ml: 0.5, color: '#94a3b8', fontSize: '0.65rem' }}>（デフォルト）</Box>}
            </Typography>
            <IconButton size="small" onClick={openEdit} sx={{ color: '#cbd5e1', '&:hover': { color: '#0891b2' } }}>
              <TuneIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Collapse in={showMonthEdit}>
            <Box sx={{ mt: 1.5, p: 2, bgcolor: '#f8fafc', borderRadius: 3 }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.1em', mb: 1.5 }}>
                {monthLabel} の目標設定
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, mb: 0.5 }}>下限（h）</Typography>
                  <TextField
                    type="number"
                    value={editMin}
                    onChange={e => setEditMin(e.target.value)}
                    size="small"
                    fullWidth
                    slotProps={{ htmlInput: { style: { textAlign: 'center', fontFamily: 'monospace', fontWeight: 800 } } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#f59e0b' }, '&.Mui-focused fieldset': { borderColor: '#f59e0b' } } }}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, mb: 0.5 }}>上限（h）</Typography>
                  <TextField
                    type="number"
                    value={editMax}
                    onChange={e => setEditMax(e.target.value)}
                    size="small"
                    fullWidth
                    slotProps={{ htmlInput: { style: { textAlign: 'center', fontFamily: 'monospace', fontWeight: 800 } } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#f43f5e' }, '&.Mui-focused fieldset': { borderColor: '#f43f5e' } } }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {monthOverride && (
                  <Button
                    size="small"
                    disabled={saving}
                    onClick={handleResetMonthSettings}
                    sx={{ borderRadius: 2, color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    デフォルトに戻す
                  </Button>
                )}
                <Box sx={{ flex: 1 }} />
                <Button
                  size="small"
                  onClick={() => setShowMonthEdit(false)}
                  sx={{ borderRadius: 2, color: '#94a3b8', fontSize: '0.72rem' }}
                >
                  キャンセル
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  disabled={saving}
                  onClick={handleSaveMonthSettings}
                  startIcon={saving ? <CircularProgress size={12} color="inherit" /> : null}
                  sx={{ borderRadius: 2, bgcolor: '#0f172a', fontWeight: 700, fontSize: '0.72rem', '&:hover': { bgcolor: '#1e293b' }, boxShadow: 'none' }}
                >
                  保存
                </Button>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Stack>
  );
};
