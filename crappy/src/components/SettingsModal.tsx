import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TuneIcon from '@mui/icons-material/Tune';
import type { AppSettings } from '../types/WorkData';

interface Props {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal = ({ settings, onSave, onClose }: Props) => {
  const [form, setForm] = useState({
    targetMin: String(settings.targetMin),
    targetMax: String(settings.targetMax),
  });

  const handleSave = () => {
    const min = Number(form.targetMin);
    const max = Number(form.targetMax);
    if (min > 0 && max > min) {
      onSave({ targetMin: min, targetMax: max });
      onClose();
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <Box sx={{ px: 3, pt: 3, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ p: 1, bgcolor: 'rgba(8, 145, 178, 0.1)', borderRadius: 2 }}>
          <TuneIcon sx={{ color: '#0891b2', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>月次設定</Typography>
          <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>稼働時間の上限・下限を設定</Typography>
        </Box>
      </Box>
      <DialogContent sx={{ px: 3, pt: 2.5 }}>
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.12em', mb: 1 }}>
              下限時間（h）
            </Typography>
            <TextField
              type="number"
              value={form.targetMin}
              onChange={e => setForm(prev => ({ ...prev, targetMin: e.target.value }))}
              fullWidth
              slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontWeight: 800, fontSize: '1.4rem', textAlign: 'center' } } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#f8fafc',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#f59e0b' },
                  '&.Mui-focused fieldset': { borderColor: '#f59e0b' },
                },
              }}
              variant="outlined"
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.12em', mb: 1 }}>
              上限時間（h）
            </Typography>
            <TextField
              type="number"
              value={form.targetMax}
              onChange={e => setForm(prev => ({ ...prev, targetMax: e.target.value }))}
              fullWidth
              slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontWeight: 800, fontSize: '1.4rem', textAlign: 'center' } } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#f8fafc',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#f43f5e' },
                  '&.Mui-focused fieldset': { borderColor: '#f43f5e' },
                },
              }}
              variant="outlined"
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button
          onClick={onClose}
          sx={{ flex: 1, borderRadius: 3, color: '#64748b', fontWeight: 700 }}
        >
          キャンセル
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            flex: 2,
            borderRadius: 3,
            bgcolor: '#0f172a',
            fontWeight: 700,
            '&:hover': { bgcolor: '#1e293b' },
            boxShadow: 'none',
          }}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};
