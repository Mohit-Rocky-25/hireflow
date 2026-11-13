import React from 'react';
import { useAuthStore } from './useAuthStore';
import { PortalGate } from '@/features/portal/PortalGate';

interface RequireAuthProps {
  children?: React.ReactNode;
  component?: React.ComponentType;
  isAuthenticated?: boolean;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  component: Component,
  isAuthenticated: propAuth,
}) => {
  const { status } = useAuthStore();
  const isAuthenticated = propAuth ?? (status === 'authenticated');

  if (!isAuthenticated) {
    return <PortalGate />;
  }

  if (Component) {
    return <Component />;
  }

  return <>{children}</>;
};
