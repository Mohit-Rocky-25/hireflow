// ============================================================
// HireFlow — Protected Route Guard
// ============================================================
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export type GuardDecision =
  | { allowed: true }
  | { allowed: false; redirect: string; state?: any };

export function evaluateRouteGuard(
  isAuthenticated: boolean,
  currentUser: { role: UserRole } | null,
  roles?: UserRole[],
  location?: any
): GuardDecision {
  if (!isAuthenticated || !currentUser) {
    return { allowed: false, redirect: '/login', state: { from: location } };
  }

  if (roles && !roles.includes(currentUser.role)) {
    const roleRedirects: Record<UserRole, string> = {
      PLATFORM_ADMIN: '/admin/dashboard',
      BHR_MANAGER: '/company/dashboard',
      HR_RECRUITER: '/company/dashboard',
      INTERVIEWER: '/interviewer/dashboard',
      CANDIDATE: '/candidate/dashboard',
    };
    return { allowed: false, redirect: roleRedirects[currentUser.role] || '/' };
  }

  return { allowed: true };
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser } = useStore();
  const location = useLocation();

  const decision = evaluateRouteGuard(isAuthenticated, currentUser, roles, location);
  if (!decision.allowed) {
    return <Navigate to={decision.redirect} state={decision.state} replace />;
  }

  return <>{children}</>;
}
