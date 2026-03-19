import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from './LoginScreen';

interface Props {
  children: ReactNode;
}

export const AuthGate = ({ children }: Props) => {
  const { authState, signIn, signOutUser, user } = useAuth();

  if (authState === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100svh',
          bgcolor: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#22d3ee' }} />
      </Box>
    );
  }

  if (authState === 'unauthenticated') {
    return <LoginScreen onSignIn={signIn} />;
  }

  if (authState === 'unauthorized') {
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
          textAlign: 'center',
        }}
      >
        <Typography sx={{ fontSize: '2rem', mb: 1 }}>🚫</Typography>
        <Typography sx={{ fontWeight: 800, color: '#fff', mb: 1 }}>アクセス拒否</Typography>
        <Typography sx={{ fontSize: '0.8rem', color: '#475569', mb: 1 }}>
          {user?.email}
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 3 }}>
          このアカウントはアクセス許可されていません
        </Typography>
        <Button
          onClick={signOutUser}
          variant="outlined"
          size="small"
          sx={{ borderColor: '#334155', color: '#64748b', borderRadius: 2 }}
        >
          別のアカウントでサインイン
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};
