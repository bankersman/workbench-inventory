import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { WarningDialog } from './components/WarningDialog';

export interface WarningOptions {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

type WarningApi = {
  show: (opts: WarningOptions) => void;
};

const WarningContext = createContext<WarningApi | null>(null);

export function WarningProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const confirmRef = useRef<() => void>(() => {});
  const cancelRef = useRef<() => void>(() => {});

  const show = useCallback((opts: WarningOptions) => {
    setMessage(opts.message);
    confirmRef.current = opts.onConfirm;
    cancelRef.current = opts.onCancel ?? (() => {});
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <WarningContext.Provider value={value}>
      {children}
      <WarningDialog
        open={open}
        message={message}
        onConfirm={() => {
          setOpen(false);
          confirmRef.current();
        }}
        onCancel={() => {
          setOpen(false);
          cancelRef.current();
        }}
      />
    </WarningContext.Provider>
  );
}

/* eslint-disable react-refresh/only-export-components -- hook exported alongside provider */
export function useWarning(): WarningApi {
  const ctx = useContext(WarningContext);
  if (!ctx) {
    throw new Error('useWarning must be used within WarningProvider');
  }
  return ctx;
}
