import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { format, startOfWeek, addDays, addWeeks } from 'date-fns';
import type { WorkSession } from '../types/WorkData';
import { isBusinessDay } from '../lib/businessDays';

interface Props {
  sessions: WorkSession[];
  onUpdate: (id: string, hours: number) => void;
  onDelete: (id: string) => void;
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export const AttendanceCalendar = ({ sessions, onUpdate, onDelete }: Props) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date();

  const weekStart = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), weekOffset);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dailyData = useMemo(() => {
    const map: Record<string, WorkSession[]> = {};
    for (const s of sessions) {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    }
    return map;
  }, [sessions]);

  const weekTotal = weekDays.reduce((sum, day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return sum + (dailyData[dateStr] ?? []).reduce((s, sess) => s + sess.hours, 0);
  }, 0);

  const isCurrentWeek = weekOffset === 0;

  return (
    <Stack spacing={1.5}>
      {/* Header */}
      <Card>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={() => setWeekOffset(p => p - 1)}>
              <ChevronLeftIcon />
            </IconButton>
            <Button
              size="small"
              variant={isCurrentWeek ? 'contained' : 'outlined'}
              onClick={() => setWeekOffset(0)}
              sx={{ borderRadius: 2, minWidth: 60, fontWeight: 700, fontSize: '0.75rem' }}
            >
              今週
            </Button>
            <IconButton size="small" onClick={() => setWeekOffset(p => p + 1)}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em' }}>週計</Typography>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'monospace', color: '#0f172a' }}>
              {weekTotal.toFixed(1)}h
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Day Cards */}
      {weekDays.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const isToday = dateStr === format(today, 'yyyy-MM-dd');
        const isBizDay = isBusinessDay(day);
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        const daySessions = dailyData[dateStr] ?? [];
        const dayTotal = daySessions.reduce((s, sess) => s + sess.hours, 0);

        return (
          <Card
            key={dateStr}
            sx={{
              opacity: isBizDay ? 1 : 0.5,
              border: isToday ? '1.5px solid #0891b2' : '1px solid #e2e8f0',
              boxShadow: isToday ? '0 0 0 3px rgba(8, 145, 178, 0.1)' : 'none',
            }}
          >
            {/* Day header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2.5,
                py: 1.5,
                bgcolor: isToday ? 'rgba(8, 145, 178, 0.05)' : '#f8fafc',
                borderBottom: daySessions.length > 0 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: isWeekend ? '#f43f5e' : '#0f172a',
                  }}
                >
                  {format(day, 'M/d')} ({DAY_LABELS[day.getDay()]})
                </Typography>
                {isToday && (
                  <Chip
                    label="TODAY"
                    size="small"
                    sx={{ bgcolor: '#0891b2', color: '#fff', fontWeight: 800, fontSize: '0.6rem', height: 18 }}
                  />
                )}
                {!isBizDay && !isWeekend && (
                  <Chip
                    label="祝"
                    size="small"
                    color="error"
                    sx={{ fontWeight: 800, fontSize: '0.6rem', height: 18 }}
                  />
                )}
              </Box>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  color: dayTotal > 0 ? '#0891b2' : '#e2e8f0',
                }}
              >
                {dayTotal > 0 ? `${dayTotal.toFixed(2)}h` : '—'}
              </Typography>
            </Box>

            {/* Sessions */}
            {daySessions.map(sess => (
              <Box
                key={sess.id}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 1.5 }}
              >
                <TextField
                  type="number"
                  value={sess.hours}
                  onChange={e => onUpdate(sess.id, Math.max(0, Number(e.target.value)))}
                  slotProps={{ htmlInput: { step: 0.25, min: 0, max: 24, style: { textAlign: 'center', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem' } } }}
                  sx={{
                    width: 90,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#f8fafc',
                      '& fieldset': { borderColor: '#e2e8f0' },
                      '&:hover fieldset': { borderColor: '#0891b2' },
                      '&.Mui-focused fieldset': { borderColor: '#0891b2' },
                    },
                  }}
                  variant="outlined"
                  size="small"
                />
                <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>h</Typography>
                {sess.note && (
                  <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sess.note}
                  </Typography>
                )}
                <IconButton
                  size="small"
                  onClick={() => onDelete(sess.id)}
                  sx={{ color: '#e2e8f0', '&:hover': { color: '#f43f5e' }, ml: 'auto' }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Card>
        );
      })}
    </Stack>
  );
};
