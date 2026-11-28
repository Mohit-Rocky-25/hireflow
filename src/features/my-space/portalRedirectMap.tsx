import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

/**
 * Canonical redirect map for legacy /portal routes -> /my-space:
 * /portal -> /my-space
 * /portal/resumes -> /my-space/resumes
 * /portal/audits/:id -> /my-space/scans?audit=:id
 */
export function getRedirectTarget(pathname: string, auditId?: string): string {
  if (auditId || pathname.startsWith('/portal/audits/')) {
    const id = auditId || pathname.replace(/^\/portal\/audits\//, '');
    return `/my-space/scans?audit=${encodeURIComponent(id)}`;
  }
  if (pathname === '/portal/resumes') {
    return '/my-space/resumes';
  }
  return '/my-space';
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

