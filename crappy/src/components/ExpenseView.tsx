import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import type { Expense, ExpenseTag } from '../types/WorkData';
import { storage } from '../lib/storage';

const TAG_LABELS: Record<ExpenseTag, string> = {
  entertainment: '接待',
  equipment: '備品',
  transport: '交通費',
  communication: '通信費',
  other: 'その他',
};

const TAG_COLORS: Record<ExpenseTag, { bg: string; color: string }> = {
  entertainment: { bg: '#ffe4e6', color: '#e11d48' },
  equipment: { bg: '#dbeafe', color: '#1d4ed8' },
  transport: { bg: '#fef3c7', color: '#d97706' },
  communication: { bg: '#ede9fe', color: '#7c3aed' },
  other: { bg: '#f1f5f9', color: '#475569' },
};

export const ExpenseView = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => storage.getExpenses());
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    description: '',
    tag: 'other' as ExpenseTag,
  });

  const today = new Date();
  const currentMonthPrefix = format(today, 'yyyy-MM');
  const monthExpenses = expenses
    .filter(e => e.date.startsWith(currentMonthPrefix))
    .sort((a, b) => b.date.localeCompare(a.date));
  const totalAmount = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = useCallback(() => {
    if (!form.amount || !form.description) return;
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      date: form.date,
      amount: Math.round(Number(form.amount)),
      description: form.description,
      tag: form.tag,
    };
    const updated = [...expenses, newExpense];
    storage.saveExpenses(updated);
    setExpenses(updated);
    setForm(prev => ({ ...prev, amount: '', description: '' }));
  }, [form, expenses]);

  const handleDelete = useCallback((id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    storage.saveExpenses(updated);
    setExpenses(updated);
  }, [expenses]);

  const exportCSV = useCallback(() => {
    const tagToAccount: Record<ExpenseTag, string> = {
      entertainment: '交際費',
      equipment: '消耗品費',
      transport: '旅費交通費',
      communication: '通信費',
      other: '雑費',
    };
    const header = '取引日,勘定科目,税区分,金額,摘要';
    const rows = monthExpenses.map(e =>
      `${e.date},${tagToAccount[e.tag]},課税仕入10%,${e.amount},${e.description}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${currentMonthPrefix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [monthExpenses, currentMonthPrefix]);

  return (
    <Stack spacing={2}>
      {/* Input Form */}
      <Card>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.12em', mb: 2 }}>
            経費入力
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              type="date"
              value={form.date}
              onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
              size="small"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#f8fafc',
                  '& fieldset': { borderColor: '#e2e8f0' },
                },
              }}
              variant="outlined"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                type="number"
                placeholder="金額（円）"
                value={form.amount}
                onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                size="small"
                slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontWeight: 700 } } }}
                sx={{
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
              <FormControl size="small">
                <Select
                  value={form.tag}
                  onChange={e => setForm(prev => ({ ...prev, tag: e.target.value as ExpenseTag }))}
                  sx={{
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0891b2' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0891b2' },
                  }}
                  variant="outlined"
                >
                  {(Object.entries(TAG_LABELS) as [ExpenseTag, string][]).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              placeholder="内容"
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              size="small"
              fullWidth
              sx={{
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
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={!form.amount || !form.description}
              fullWidth
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                py: 1.2,
                bgcolor: '#0f172a',
                '&:hover': { bgcolor: '#1e293b' },
                boxShadow: 'none',
              }}
            >
              追加
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: 'none',
        }}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, color: '#475569', letterSpacing: '0.12em', mb: 0.5 }}>
              今月合計
            </Typography>
            <Typography sx={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'monospace', color: '#fff' }}>
              ¥{totalAmount.toLocaleString()}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={exportCSV}
            disabled={monthExpenses.length === 0}
            size="small"
            sx={{
              borderRadius: 2.5,
              bgcolor: '#0891b2',
              fontWeight: 700,
              fontSize: '0.75rem',
              '&:hover': { bgcolor: '#0e7490' },
              boxShadow: '0 4px 12px rgba(8, 145, 178, 0.35)',
            }}
          >
            CSV出力
          </Button>
        </CardContent>
      </Card>

      {/* Expense List */}
      <Card>
        {monthExpenses.length === 0 ? (
          <CardContent sx={{ py: 5, textAlign: 'center' }}>
            <Typography sx={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
              今月の経費はまだありません
            </Typography>
          </CardContent>
        ) : (
          <Box>
            {monthExpenses.map((expense, idx) => {
              const tagStyle = TAG_COLORS[expense.tag];
              return (
                <Box key={expense.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip
                          label={TAG_LABELS[expense.tag]}
                          size="small"
                          sx={{ bgcolor: tagStyle.bg, color: tagStyle.color, height: 18, fontSize: '0.6rem', fontWeight: 800 }}
                        />
                        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>{expense.date}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {expense.description}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                      ¥{expense.amount.toLocaleString()}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(expense.id)}
                      sx={{ color: '#e2e8f0', '&:hover': { color: '#f43f5e' } }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {idx < monthExpenses.length - 1 && <Divider sx={{ mx: 2.5, borderColor: '#f1f5f9' }} />}
                </Box>
              );
            })}
          </Box>
        )}
      </Card>
    </Stack>
  );
};
