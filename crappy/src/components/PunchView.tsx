import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CheckIcon from '@mui/icons-material/Check';
import CircularProgress from '@mui/material/CircularProgress';
import { format } from 'date-fns';

interface Props {
  onSave: (hours: number) => void | Promise<void>;
}

export const PunchView = ({ onSave }: Props) => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedHours, setElapsedHours] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const [clockedOut, setClockedOut] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isWorking && startTime) {
      interval = window.setInterval(() => {
        const diffMs = new Date().getTime() - startTime.getTime();
        setElapsedHours(diffMs / (1000 * 60 * 60));
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [isWorking, startTime]);

  const handleStart = () => {
    const now = new Date();
    setStartTime(now);
    setIsWorking(true);
    setClockedOut(false);
    setElapsedHours(0);
  };

  const handleEnd = () => {
    const diffMs = new Date().getTime() - (startTime?.getTime() ?? 0);
    setElapsedHours(Math.round((diffMs / (1000 * 60 * 60)) * 4) / 4);
    setIsWorking(false);
    setClockedOut(true);
  };

  const handleReset = () => {
    setStartTime(null);
    setElapsedHours(0);
    setIsWorking(false);
    setClockedOut(false);
    setManualInput('');
  };

  const adjust = (amount: number) => {
    setElapsedHours(prev => Math.max(0, Math.round((prev + amount) * 100) / 100));
  };

  const showAdjust = clockedOut || (!isWorking && !clockedOut && elapsedHours > 0);

  return (
    <Stack spacing={2}>
      {/* Timer Display */}
      <Card
        sx={{
          background: isWorking
            ? 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: 'none',
          borderRadius: 5,
          transition: 'background 0.6s ease',
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center', '&:last-child': { pb: 4 } }}>
          <Typography
            sx={{
              fontSize: '0.6rem',
              fontWeight: 800,
              color: isWorking ? 'rgba(255,255,255,0.5)' : '#475569',
              letterSpacing: '0.2em',
              mb: 2,
            }}
          >
            {isWorking ? 'NOW WORKING...' : clockedOut ? 'ADJUST & LOG' : 'READY'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1 }}>
            <Typography
              sx={{
                fontSize: '5.5rem',
                fontWeight: 900,
                fontFamily: 'monospace',
                color: '#fff',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {elapsedHours.toFixed(2)}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: '1.5rem' }}>h</Typography>
          </Box>
          {startTime && (
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', mt: 1.5, letterSpacing: '0.1em' }}>
              {format(startTime, 'HH:mm')} スタート
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Clock In / Clock Out */}
      {!isWorking && !clockedOut && (
        <Button
          variant="outlined"
          size="large"
          startIcon={<PlayArrowIcon />}
          onClick={handleStart}
          sx={{
            height: 72,
            borderRadius: 4,
            border: '2px solid',
            borderColor: 'primary.main',
            color: 'primary.main',
            fontSize: '1.1rem',
            fontWeight: 900,
            fontStyle: 'italic',
            '&:hover': { border: '2px solid', borderColor: 'primary.dark', bgcolor: 'primary.main', color: '#fff' },
          }}
        >
          CLOCK IN
        </Button>
      )}

      {isWorking && (
        <Button
          variant="contained"
          size="large"
          startIcon={<StopIcon />}
          onClick={handleEnd}
          color="secondary"
          sx={{
            height: 72,
            borderRadius: 4,
            fontSize: '1.1rem',
            fontWeight: 900,
            fontStyle: 'italic',
            boxShadow: '0 8px 24px rgba(244, 63, 94, 0.3)',
          }}
        >
          CLOCK OUT
        </Button>
      )}

      {/* Adjust Buttons */}
      {showAdjust && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
            {[
              { label: '−1.0', amount: -1 },
              { label: '−0.25', amount: -0.25 },
              { label: '+0.25', amount: 0.25 },
              { label: '+1.0', amount: 1 },
            ].map(({ label, amount }) => (
              <Button
                key={label}
                variant="outlined"
                onClick={() => adjust(amount)}
                sx={{
                  borderRadius: 3,
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  py: 1.2,
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'rgba(8, 145, 178, 0.04)' },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
            disabled={saving}
            onClick={async () => { setSaving(true); await onSave(elapsedHours); handleReset(); setSaving(false); }}
            sx={{
              borderRadius: 3,
              height: 56,
              bgcolor: '#0f172a',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              color: '#22d3ee',
              '&:hover': { bgcolor: '#1e293b' },
              boxShadow: 'none',
            }}
          >
            {saving ? '保存中...' : `LOG ${elapsedHours.toFixed(2)}h`}
          </Button>
        </>
      )}

      {/* Manual Input */}
      {!isWorking && !clockedOut && elapsedHours === 0 && (
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', mb: 2 }}>
              手動入力
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <TextField
                type="number"
                placeholder="0.00"
                slotProps={{ htmlInput: { step: 0.25, min: 0, max: 24, style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace' } } }}
                value={manualInput}
                onChange={e => {
                  setManualInput(e.target.value);
                  setElapsedHours(Math.max(0, Number(e.target.value)));
                }}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#0891b2' },
                    '&.Mui-focused fieldset': { borderColor: '#0891b2' },
                  },
                }}
                variant="outlined"
              />
              <Typography sx={{ fontWeight: 700, color: '#94a3b8', fontSize: '1.2rem' }}>h</Typography>
            </Box>
            {Number(manualInput) > 0 && (
              <Button
                fullWidth
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
                disabled={saving}
                onClick={async () => { setSaving(true); await onSave(elapsedHours); handleReset(); setSaving(false); }}
                sx={{
                  mt: 2,
                  borderRadius: 3,
                  bgcolor: '#0f172a',
                  color: '#22d3ee',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  '&:hover': { bgcolor: '#1e293b' },
                  boxShadow: 'none',
                }}
              >
                LOG {Number(manualInput).toFixed(2)}h
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};
