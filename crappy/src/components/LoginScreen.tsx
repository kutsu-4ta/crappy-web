import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useState } from 'react';

interface Props {
  onSignIn: () => Promise<void>;
}

// Google "G" SVG logo (official brand asset)
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </g>
  </svg>
);

export const LoginScreen = ({ onSignIn }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await onSignIn();
    } catch (err: any) {
      setError('ログインに失敗しました。もう一度お試しください。');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100svh',
        bgcolor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        background: 'radial-gradient(ellipse at 50% 0%, #1e3a5f 0%, #0f172a 70%)',
      }}
    >
      {/* Logo area */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          sx={{
            fontSize: '3rem',
            fontWeight: 900,
            fontFamily: 'monospace',
            color: '#fff',
            letterSpacing: '-0.05em',
            lineHeight: 1,
            mb: 0.5,
          }}
        >
          crappy
        </Typography>
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#475569',
            letterSpacing: '0.1em',
          }}
        >
          個人事業主向け 稼働管理アプリ
        </Typography>
      </Box>

      {/* Sign-in card */}
      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: 5,
          p: 4,
          width: '100%',
          maxWidth: 360,
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        <Typography
          sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', mb: 0.75 }}
        >
          ログイン
        </Typography>
        <Typography
          sx={{ fontSize: '0.8rem', color: '#94a3b8', mb: 3 }}
        >
          Googleアカウントでサインイン
        </Typography>

        <Button
          variant="outlined"
          fullWidth
          onClick={handleSignIn}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <GoogleIcon />}
          sx={{
            borderRadius: 3,
            py: 1.5,
            borderColor: '#e2e8f0',
            color: '#0f172a',
            fontWeight: 700,
            fontSize: '0.875rem',
            bgcolor: '#fff',
            '&:hover': {
              borderColor: '#cbd5e1',
              bgcolor: '#f8fafc',
            },
            '&:disabled': {
              borderColor: '#e2e8f0',
              color: '#94a3b8',
            },
          }}
        >
          {loading ? 'サインイン中...' : 'Googleでサインイン'}
        </Button>

        {error && (
          <Typography
            sx={{ fontSize: '0.75rem', color: '#ef4444', mt: 2 }}
          >
            {error}
          </Typography>
        )}
      </Box>

      <Typography
        sx={{ mt: 4, fontSize: '0.65rem', color: '#334155', textAlign: 'center' }}
      >
        このアプリは個人利用専用です
      </Typography>
    </Box>
  );
};
