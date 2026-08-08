import React, { createContext, useCallback, useState, type ReactNode } from "react";

export type AuthModalMode = "login" | "signup";

interface AuthModalContextType {
  isOpen: boolean;
  mode: AuthModalMode;
  open: (mode?: AuthModalMode, onSuccess?: () => void) => void;
  close: () => void;
  setMode: (mode: AuthModalMode) => void;
  handleSuccess: () => void;
}

export const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

// Sign in/up live as a modal over the current page (opened from the home page header,
// or by any protected action like Checkout) instead of dedicated /login /signup routes.
export const AuthModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthModalMode>("login");
  const [onSuccess, setOnSuccess] = useState<(() => void) | null>(null);

  const open = useCallback((nextMode: AuthModalMode = "login", onSuccessCb?: () => void) => {
    setMode(nextMode);
    setOnSuccess(() => onSuccessCb ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setOnSuccess(null);
  }, []);

  const handleSuccess = useCallback(() => {
    setIsOpen(false);
    onSuccess?.();
    setOnSuccess(null);
  }, [onSuccess]);

  return (
    <AuthModalContext.Provider value={{ isOpen, mode, open, close, setMode, handleSuccess }}>
      {children}
    </AuthModalContext.Provider>
  );
};
