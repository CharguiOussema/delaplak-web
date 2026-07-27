import React, { useEffect, useState } from 'react';
import { useAccess } from '../../hooks/useAccess';
import type { AccessModule } from '../../hooks/useAccess';
import { NoAccess } from './NoAccess';

interface AccessControlProps {
  module: AccessModule;
  children: React.ReactNode;
  writeOnly?: boolean;
}

export const AccessControl: React.FC<AccessControlProps> = ({ module, children, writeOnly = false }) => {
  const { hasAccess, canWrite } = useAccess();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) return null;
  if (!hasAccess(module)) return <NoAccess />;
  if (writeOnly && !canWrite(module)) return <NoAccess />;

  return <>{children}</>;
};
