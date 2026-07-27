import React from 'react';
import { AccessControl } from './common/AccessControl';
import type { AccessModule } from '../hooks/useAccess';

interface ProtectedModuleRouteProps {
  module: AccessModule;
  children: React.ReactNode;
  writeOnly?: boolean;
}

export const ProtectedModuleRoute: React.FC<ProtectedModuleRouteProps> = ({ module, children, writeOnly = false }) => {
  return (
    <AccessControl module={module} writeOnly={writeOnly}>
      {children}
    </AccessControl>
  );
};
