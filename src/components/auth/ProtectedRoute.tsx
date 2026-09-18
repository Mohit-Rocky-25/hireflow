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

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser } = useStore();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirects: Record<UserRole, string> = {
      PLATFORM_ADMIN: '/admin/dashboard',
      BHR_MANAGER: '/company/dashboard',
      HR_RECRUITER: '/company/dashboard',
      INTERVIEWER: '/interviewer/dashboard',
      CANDIDATE: '/candidate/dashboard',
    };
    return <Navigate to={roleRedirects[currentUser.role]} replace />;
  }

  return <>{children}</>;
}
