// ============================================================
// Legacy Redirect Component (/tools/career-path/company-ladder -> /tools/career-path/company-levels)
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';

export function CompanyLadderPage() {
  return <Navigate to="/tools/career-path/company-levels" replace />;
}
