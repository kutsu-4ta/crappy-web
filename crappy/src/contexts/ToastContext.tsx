import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface ToastCtx {
  showToast: (message: string, severity?: Severity) => void;
}

const ToastContext = createContext<ToastCtx>({ showToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; message: string; severity: Severity }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = useCallback((message: string, severity: Severity = 'success') => {
    setState({ open: true, message, severity });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={2500}
        onClose={() => setState(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 8 }}
      >
        <Alert
          severity={state.severity}
          onClose={() => setState(s => ({ ...s, open: false }))}
          sx={{ width: '100%', fontWeight: 700, borderRadius: 3 }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
