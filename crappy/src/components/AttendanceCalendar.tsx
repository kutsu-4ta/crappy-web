import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { isBusinessDay } from '../lib/businessDays';
import { useAttendanceCalendar } from '../hooks/useAttendanceCalendar';

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export const AttendanceCalendar = () => {
  const {
    today,
    weekDays,
    weekOffset,
    setWeekOffset,
    dailyData,
    weekTotal,
    loading,
    addSession,
    updateSession,
    deleteSession,
    exportMonthCSV,
  } = useAttendanceCalendar();

  // Local edit state: { [sessionId]: string } — tracks in-progress edits before blur
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Local quick-add state: { [dateStr]: string }
  const [quickAdd, setQuickAdd] = useState<Record<string, string>>({});

  const todayStr = format(today, 'yyyy-MM-dd');
  const isCurrentWeek = weekOffset === 0;
  const viewedMonth = format(weekDays[0], 'yyyy年M月');

  const handleEditChange = (id: string, val: string) => {
    setEditValues(prev => ({ ...prev, [id]: val }));
  };

  const handleEditBlur = (id: string, fallbackHours: number) => {
    const raw = editValues[id];
    if (raw !== undefined) {
      const parsed = parseFloat(raw);
      updateSession(id, isNaN(parsed) || parsed <= 0 ? fallbackHours : parsed);
      setEditValues(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleQuickAdd = async (dateStr: string) => {
    const val = parseFloat(quickAdd[dateStr] ?? '');
    if (!isNaN(val) && val > 0) {
      await addSession(dateStr, val);
      setQuickAdd(prev => {
        const next = { ...prev };
        delete next[dateStr];
        return next;
      });
    }
  };

  return (
    <Stack spacing={1.5}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Card>
        <CardContent
          sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={() => setWeekOffset(p => p - 1)}>
              <ChevronLeftIcon />
            </IconButton>
            <Button
              size="small"
              variant={isCurrentWeek ? 'contained' : 'outlined'}
              onClick={() => setWeekOffset(0)}
              sx={{ borderRadius: 2, minWidth: 52, fontWeight: 700, fontSize: '0.7rem' }}
            >
              今週
            </Button>
            <IconButton size="small" onClick={() => setWeekOffset(p => p + 1)}>
              <ChevronRightIcon />
            </IconButton>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', ml: 0.5 }}>
              {viewedMonth}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={exportMonthCSV}
              sx={{
                borderRadius: 2,
                borderColor: '#e2e8f0',
                color: '#64748b',
                fontWeight: 700,
                fontSize: '0.7rem',
                '&:hover': { borderColor: '#0891b2', color: '#0891b2' },
              }}
            >
              CSV
            </Button>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em' }}>
                週計
              </Typography>
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'monospace', color: '#0f172a' }}>
                {weekTotal.toFixed(1)}h
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ── Day Cards ──────────────────────────────────────────────── */}
      {loading
        ? Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: 3 }} />
          ))
        : weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isToday = dateStr === todayStr;
            const isBizDay = isBusinessDay(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const daySessions = dailyData[dateStr] ?? [];
            const dayTotal = daySessions.reduce((s, sess) => s + sess.hours, 0);
            const hasQuickAdd = quickAdd[dateStr] !== undefined;

            return (
              <Card
                key={dateStr}
                sx={{
                  opacity: isBizDay ? 1 : 0.55,
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
                    borderBottom: daySessions.length > 0 || hasQuickAdd ? '1px solid #f1f5f9' : 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{ fontWeight: 800, fontSize: '0.85rem', color: isWeekend ? '#f43f5e' : '#0f172a' }}
                    >
                      {format(day, 'M/d')}（{DAY_LABELS[day.getDay()]}）
                    </Typography>
                    {isToday && (
                      <Chip
                        label="TODAY"
                        size="small"
                        sx={{ bgcolor: '#0891b2', color: '#fff', fontWeight: 800, fontSize: '0.6rem', height: 18 }}
                      />
                    )}
                    {!isBizDay && !isWeekend && (
                      <Chip label="祝" size="small" color="error" sx={{ fontWeight: 800, fontSize: '0.6rem', height: 18 }} />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.05rem', color: dayTotal > 0 ? '#0891b2' : '#e2e8f0' }}
                    >
                      {dayTotal > 0 ? `${dayTotal.toFixed(2)}h` : '—'}
                    </Typography>
                    {/* Quick-add toggle */}
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (hasQuickAdd) {
                          setQuickAdd(prev => { const n = { ...prev }; delete n[dateStr]; return n; });
                        } else {
                          setQuickAdd(prev => ({ ...prev, [dateStr]: '' }));
                        }
                      }}
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: hasQuickAdd ? 'rgba(8,145,178,0.1)' : 'transparent',
                        color: hasQuickAdd ? '#0891b2' : '#cbd5e1',
                        '&:hover': { color: '#0891b2', bgcolor: 'rgba(8,145,178,0.08)' },
                      }}
                    >
                      <AddIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Existing sessions */}
                {daySessions.map(sess => {
                  const displayVal = editValues[sess.id] ?? String(sess.hours);
                  return (
                    <Box
                      key={sess.id}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.25 }}
                    >
                      <TextField
                        type="number"
                        value={displayVal}
                        onChange={e => handleEditChange(sess.id, e.target.value)}
                        onBlur={() => handleEditBlur(sess.id, sess.hours)}
                        onKeyDown={e => e.key === 'Enter' && handleEditBlur(sess.id, sess.hours)}
                        slotProps={{
                          htmlInput: {
                            step: 0.25,
                            min: 0,
                            max: 24,
                            style: { textAlign: 'center', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.9rem' },
                          },
                        }}
                        sx={{
                          width: 84,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: editValues[sess.id] !== undefined ? 'rgba(8,145,178,0.04)' : '#f8fafc',
                            '& fieldset': { borderColor: editValues[sess.id] !== undefined ? '#0891b2' : '#e2e8f0' },
                            '&:hover fieldset': { borderColor: '#0891b2' },
                            '&.Mui-focused fieldset': { borderColor: '#0891b2' },
                          },
                        }}
                        variant="outlined"
                        size="small"
                      />
                      <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>h</Typography>
                      {sess.note && (
                        <Typography
                          sx={{ fontSize: '0.72rem', color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {sess.note}
                        </Typography>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => deleteSession(sess.id)}
                        sx={{ color: '#e2e8f0', '&:hover': { color: '#f43f5e' }, ml: 'auto' }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}

                {/* Quick-add row */}
                {hasQuickAdd && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.25, bgcolor: 'rgba(8,145,178,0.03)' }}>
                    <TextField
                      type="number"
                      placeholder="0.00"
                      autoFocus
                      value={quickAdd[dateStr]}
                      onChange={e => setQuickAdd(prev => ({ ...prev, [dateStr]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleQuickAdd(dateStr)}
                      slotProps={{
                        htmlInput: {
                          step: 0.25,
                          min: 0,
                          max: 24,
                          style: { textAlign: 'center', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.9rem' },
                        },
                      }}
                      sx={{
                        width: 84,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: '#fff',
                          '& fieldset': { borderColor: '#0891b2' },
                          '&.Mui-focused fieldset': { borderColor: '#0891b2' },
                        },
                      }}
                      variant="outlined"
                      size="small"
                    />
                    <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>h</Typography>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleQuickAdd(dateStr)}
                      disabled={!quickAdd[dateStr] || parseFloat(quickAdd[dateStr]) <= 0}
                      sx={{ borderRadius: 2, minWidth: 40, fontWeight: 700, fontSize: '0.72rem', px: 1.5, bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' }, boxShadow: 'none' }}
                    >
                      追加
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setQuickAdd(prev => { const n = { ...prev }; delete n[dateStr]; return n; })}
                      sx={{ borderRadius: 2, color: '#94a3b8', fontSize: '0.72rem', minWidth: 0, px: 1 }}
                    >
                      ✕
                    </Button>
                  </Box>
                )}
              </Card>
            );
          })}
    </Stack>
  );
};
