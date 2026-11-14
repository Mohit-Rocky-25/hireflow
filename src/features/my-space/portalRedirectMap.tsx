import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

/**
 * Redirect map for legacy routes:
 * /portal -> /?my=overview
 * /portal/resumes -> /?my=resumes
 * /portal/audits/:id -> /?my=scans&audit=:id
 */
export function getRedirectTarget(pathname: string, auditId?: string): string {
  if (auditId || pathname.startsWith('/portal/audits/')) {
    const id = auditId || pathname.replace(/^\/portal\/audits\//, '');
    return `/?my=scans&audit=${encodeURIComponent(id)}`;
  }
  if (pathname === '/portal/resumes') {
    return '/?my=resumes';
  }
  return '/?my=overview';
}

export const PortalRedirect: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auditId } = useParams<{ auditId?: string }>();

  useEffect(() => {
    const target = getRedirectTarget(location.pathname, auditId);
    navigate(target, { replace: true });
  }, [location.pathname, auditId, navigate]);

  return null;
};

