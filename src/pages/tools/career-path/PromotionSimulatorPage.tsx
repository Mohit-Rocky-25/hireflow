// ============================================================
// Legacy Redirect Component (/tools/career-path/promotion-simulator -> /tools/career-path/dream-job-roadmap)
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';

export function PromotionSimulatorPage() {
  return <Navigate to="/tools/career-path/dream-job-roadmap" replace />;
}
