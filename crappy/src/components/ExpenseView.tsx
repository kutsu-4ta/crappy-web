import { useState, useEffect, useRef, useCallback } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type { Expense, ExpenseTag } from '../types/WorkData';
import { subscribeToExpenses, saveExpenseItems } from '../lib/firestoreService';
import { uploadReceipt, deleteReceipt } from '../lib/receiptStorage';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

// ── 定数 ─────────────────────────────────────────────────────────────────────

const TAG_LABELS: Record<ExpenseTag, string> = {
  entertainment: '接待',
  equipment: '備品',
  transport: '交通費',
  communication: '通信費',
  other: 'その他',
};

const TAG_COLORS: Record<ExpenseTag, { bg: string; color: string }> = {
  entertainment: { bg: '#ffe4e6', color: '#e11d48' },
  equipment:     { bg: '#dbeafe', color: '#1d4ed8' },
  transport:     { bg: '#fef3c7', color: '#d97706' },
  communication: { bg: '#ede9fe', color: '#7c3aed' },
  other:         { bg: '#f1f5f9', color: '#475569' },
};

const TAG_TO_ACCOUNT: Record<ExpenseTag, string> = {
  entertainment: '交際費',
  equipment:     '消耗品費',
  transport:     '旅費交通費',
  communication: '通信費',
  other:         '雑費',
};

// ── 共通 Select sx ────────────────────────────────────────────────────────────

const selectSx = {
  borderRadius: 2,
  bgcolor: '#f8fafc',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0891b2' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0891b2' },
};

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#f8fafc',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#0891b2' },
    '&.Mui-focused fieldset': { borderColor: '#0891b2' },
  },
};

// ── コンポーネント ─────────────────────────────────────────────────────────────

export const ExpenseView = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // ── データ state ──────────────────────────────────────────────────────────
  const [expenses, setExpenses]     = useState<Expense[]>([]);
  const [loading, setLoading]       = useState(true);
  const expensesRef                 = useRef<Expense[]>([]);

  const today        = new Date();
  const currentMonth = format(today, 'yyyy-MM');

  // ── 入力フォーム state ────────────────────────────────────────────────────
  const [form, setForm] = useState({
    date:        format(today, 'yyyy-MM-dd'),
    amount:      '',
    description: '',
    tag:         'other' as ExpenseTag,
  });
  const [uploading,      setUploading]      = useState(false);
  const [pendingReceipt, setPendingReceipt] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── インライン編集 state ──────────────────────────────────────────────────
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [editForm,   setEditForm]   = useState({
    date:        '',
    amount:      '',
    description: '',
    tag:         'other' as ExpenseTag,
  });
  const [saving, setSaving] = useState(false);

  // ── Firestore 購読 ────────────────────────────────────────────────────────
  useEffect(() => { expensesRef.current = expenses; }, [expenses]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeToExpenses(user.uid, currentMonth, items => {
      setExpenses(items);
      setLoading(false);
    });
    return unsub;
  }, [user, currentMonth]);

  // ── 追加 ─────────────────────────────────────────────────────────────────
  const handleAdd = useCallback(async () => {
    if (!user || !form.amount || !form.description) return;
    const expenseId = crypto.randomUUID();
    let receiptUrl: string | undefined;
    let receiptPath: string | undefined;

    if (pendingReceipt) {
      setUploading(true);
      try {
        const r = await uploadReceipt(user.uid, currentMonth, expenseId, pendingReceipt);
        receiptUrl  = r.url;
        receiptPath = r.path;
      } finally {
        setUploading(false);
      }
    }

    const newExpense: Expense = {
      id:          expenseId,
      date:        form.date,
      amount:      Math.round(Number(form.amount)),
      description: form.description,
      tag:         form.tag,
      ...(receiptUrl  && { receiptUrl }),
      ...(receiptPath && { receiptPath }),
    };

    const updated = [...expensesRef.current, newExpense];
    setExpenses(updated);
    await saveExpenseItems(user.uid, currentMonth, updated);
    showToast('経費を追加しました');

    setForm(prev => ({ ...prev, amount: '', description: '' }));
    setPendingReceipt(null);
    setPendingPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [user, form, pendingReceipt, currentMonth, showToast]);

  // ── 編集開始 ──────────────────────────────────────────────────────────────
  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm({
      date:        expense.date,
      amount:      String(expense.amount),
      description: expense.description,
      tag:         expense.tag,
    });
  };

  // ── 編集保存 ──────────────────────────────────────────────────────────────
  const handleUpdate = useCallback(async () => {
    if (!user || !editingId || !editForm.amount || !editForm.description) return;
    setSaving(true);
    const updated = expensesRef.current.map(e =>
      e.id === editingId
        ? { ...e, date: editForm.date, amount: Math.round(Number(editForm.amount)), description: editForm.description, tag: editForm.tag }
        : e,
    );
    setExpenses(updated);
    await saveExpenseItems(user.uid, currentMonth, updated);
    showToast('保存しました');
    setSaving(false);
    setEditingId(null);
  }, [user, editingId, editForm, currentMonth, showToast]);

  // ── 削除 ─────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (expense: Expense) => {
    if (!user) return;
    const updated = expensesRef.current.filter(e => e.id !== expense.id);
    setExpenses(updated);
    await saveExpenseItems(user.uid, currentMonth, updated);
    if (expense.receiptPath) await deleteReceipt(expense.receiptPath);
    showToast('削除しました');
  }, [user, currentMonth, showToast]);

  // ── CSV 出力 ──────────────────────────────────────────────────────────────
  const exportCSV = useCallback(() => {
    const header = '取引日,勘定科目,税区分,金額,摘要';
    const rows = [...expenses]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => `${e.date},${TAG_TO_ACCOUNT[e.tag]},課税仕入10%,${e.amount},${e.description}`);
    const csv  = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `expenses_${currentMonth}.csv`; a.click();
    URL.revokeObjectURL(url);
  }, [expenses, currentMonth]);

  // ── ローディング ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={220} sx={{ borderRadius: 4 }} />
        <Skeleton variant="rounded" height={80}  sx={{ borderRadius: 4 }} />
        <Card>
          <CardContent sx={{ p: 2 }}>
            {[1, 2, 3].map(i => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" height={14} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="70%" height={18} />
                </Box>
                <Skeleton variant="text" width={64} height={20} />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Stack>
    );
  }

  const sortedExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  const totalAmount    = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Stack spacing={2}>

      {/* ── 入力フォーム ──────────────────────────────────────────────── */}
      <Card>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.12em', mb: 1.5 }}>
            経費入力
          </Typography>
          <Stack spacing={1.25}>
            {/* 行 1: 日付 / タグ */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
              <TextField
                type="date"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                size="small"
                sx={textFieldSx}
                variant="outlined"
              />
              <FormControl size="small">
                <Select
                  value={form.tag}
                  onChange={e => setForm(p => ({ ...p, tag: e.target.value as ExpenseTag }))}
                  sx={selectSx}
                  variant="outlined"
                >
                  {(Object.entries(TAG_LABELS) as [ExpenseTag, string][]).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* 行 2: 金額 / 添付 */}
            <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
              <TextField
                type="number"
                placeholder="金額（円）"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                size="small"
                slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontWeight: 700 } } }}
                sx={{ ...textFieldSx, flex: 1 }}
                variant="outlined"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setPendingReceipt(file);
                  setPendingPreview(URL.createObjectURL(file));
                }}
              />
              {pendingPreview ? (
                <Tooltip title={pendingReceipt?.name ?? ''}>
                  <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <Box
                      component="img"
                      src={pendingPreview}
                      onClick={() => window.open(pendingPreview, '_blank')}
                      sx={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 1.5, border: '1px solid #e2e8f0', cursor: 'pointer', display: 'block' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => { setPendingReceipt(null); setPendingPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      sx={{ position: 'absolute', top: -8, right: -8, width: 16, height: 16, bgcolor: '#f43f5e', color: '#fff', '&:hover': { bgcolor: '#e11d48' }, p: 0 }}
                    >
                      <CloseIcon sx={{ fontSize: 10 }} />
                    </IconButton>
                  </Box>
                </Tooltip>
              ) : (
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ color: '#cbd5e1', border: '1px dashed #e2e8f0', borderRadius: 1.5, width: 36, height: 36, '&:hover': { color: '#0891b2', borderColor: '#0891b2' } }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Box>

            {/* 行 3: 内容 */}
            <TextField
              placeholder="内容"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              size="small"
              fullWidth
              sx={textFieldSx}
              variant="outlined"
            />

            {/* 追加ボタン */}
            <Button
              variant="contained"
              startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
              onClick={handleAdd}
              disabled={!form.amount || !form.description || uploading}
              fullWidth
              sx={{ borderRadius: 2.5, fontWeight: 700, py: 1, bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' }, boxShadow: 'none' }}
            >
              {uploading ? 'アップロード中...' : '追加'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ── サマリーバー ──────────────────────────────────────────────── */}
      <Card sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: 'none' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, color: '#475569', letterSpacing: '0.12em', mb: 0.25 }}>
              今月合計
            </Typography>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'monospace', color: '#fff', lineHeight: 1 }}>
              ¥{totalAmount.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#334155', mt: 0.25 }}>
              {expenses.length}件
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={exportCSV}
            disabled={expenses.length === 0}
            size="small"
            sx={{ borderRadius: 2.5, bgcolor: '#0891b2', fontWeight: 700, fontSize: '0.75rem', '&:hover': { bgcolor: '#0e7490' }, boxShadow: '0 4px 12px rgba(8,145,178,0.35)' }}
          >
            CSV出力
          </Button>
        </CardContent>
      </Card>

      {/* ── 経費一覧 ──────────────────────────────────────────────────── */}
      <Card>
        {sortedExpenses.length === 0 ? (
          <CardContent sx={{ py: 5, textAlign: 'center' }}>
            <Typography sx={{ color: '#cbd5e1', fontSize: '0.875rem' }}>今月の経費はまだありません</Typography>
          </CardContent>
        ) : (
          <Box>
            {sortedExpenses.map((expense, idx) => {
              const tagStyle  = TAG_COLORS[expense.tag];
              const isEditing = editingId === expense.id;

              return (
                <Box key={expense.id}>
                  {/* ── 通常表示行 ─────────────────────────────────── */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      bgcolor: isEditing ? 'rgba(8,145,178,0.03)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* 写真サムネイル（クリックで拡大・読取専用） */}
                    {expense.receiptUrl ? (
                      <Tooltip title="領収書を表示">
                        <Box
                          component="img"
                          src={expense.receiptUrl}
                          onClick={() => window.open(expense.receiptUrl, '_blank')}
                          sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1.5, border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0 }}
                        />
                      </Tooltip>
                    ) : (
                      <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ReceiptIcon sx={{ fontSize: 18, color: '#e2e8f0' }} />
                      </Box>
                    )}

                    {/* テキスト情報 */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.4 }}>
                        <Chip
                          label={TAG_LABELS[expense.tag]}
                          size="small"
                          sx={{ bgcolor: tagStyle.bg, color: tagStyle.color, height: 17, fontSize: '0.6rem', fontWeight: 800 }}
                        />
                        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          {expense.date}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {expense.description}
                      </Typography>
                    </Box>

                    {/* 金額 */}
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', flexShrink: 0 }}>
                      ¥{expense.amount.toLocaleString()}
                    </Typography>

                    {/* 編集 / 削除ボタン */}
                    <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        onClick={() => isEditing ? setEditingId(null) : startEdit(expense)}
                        sx={{
                          color: isEditing ? '#0891b2' : '#cbd5e1',
                          '&:hover': { color: '#0891b2', bgcolor: 'rgba(8,145,178,0.08)' },
                        }}
                      >
                        {isEditing ? <CloseIcon sx={{ fontSize: 16 }} /> : <EditIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(expense)}
                        sx={{ color: '#e2e8f0', '&:hover': { color: '#f43f5e', bgcolor: 'rgba(244,63,94,0.06)' } }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* ── インライン編集フォーム（Collapse） ────────── */}
                  <Collapse in={isEditing} timeout={180}>
                    <Box sx={{ px: 2, pb: 2, pt: 0.5, bgcolor: 'rgba(8,145,178,0.03)', borderTop: '1px solid #f1f5f9' }}>
                      <Stack spacing={1.25}>
                        {/* 日付 / タグ */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
                          <TextField
                            type="date"
                            value={editForm.date}
                            onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))}
                            size="small"
                            sx={textFieldSx}
                            variant="outlined"
                          />
                          <FormControl size="small">
                            <Select
                              value={editForm.tag}
                              onChange={e => setEditForm(p => ({ ...p, tag: e.target.value as ExpenseTag }))}
                              sx={selectSx}
                              variant="outlined"
                            >
                              {(Object.entries(TAG_LABELS) as [ExpenseTag, string][]).map(([k, v]) => (
                                <MenuItem key={k} value={k}>{v}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>

                        {/* 金額 */}
                        <TextField
                          type="number"
                          placeholder="金額（円）"
                          value={editForm.amount}
                          onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))}
                          size="small"
                          fullWidth
                          slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontWeight: 700 } } }}
                          sx={textFieldSx}
                          variant="outlined"
                        />

                        {/* 内容 */}
                        <TextField
                          placeholder="内容"
                          value={editForm.description}
                          onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                          size="small"
                          fullWidth
                          sx={textFieldSx}
                          variant="outlined"
                        />

                        {/* 操作ボタン */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={saving ? <CircularProgress size={12} color="inherit" /> : <CheckIcon />}
                            onClick={handleUpdate}
                            disabled={!editForm.amount || !editForm.description || saving}
                            sx={{ flex: 2, borderRadius: 2, bgcolor: '#0f172a', fontWeight: 700, '&:hover': { bgcolor: '#1e293b' }, boxShadow: 'none', fontSize: '0.75rem' }}
                          >
                            {saving ? '保存中...' : '保存'}
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setEditingId(null)}
                            sx={{ flex: 1, borderRadius: 2, borderColor: '#e2e8f0', color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem', '&:hover': { borderColor: '#94a3b8' } }}
                          >
                            キャンセル
                          </Button>
                        </Box>
                      </Stack>
                    </Box>
                  </Collapse>

                  {idx < sortedExpenses.length - 1 && (
                    <Divider sx={{ mx: 2, borderColor: '#f7f8fa' }} />
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Card>
    </Stack>
  );
};
