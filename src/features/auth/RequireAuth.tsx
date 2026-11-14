import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from './useAuthStore';

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
    return <Navigate to="/" replace />;
  }

  if (Component) {
    return <Component />;
  }

  return <>{children}</>;
};
