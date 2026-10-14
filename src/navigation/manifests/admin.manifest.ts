// ============================================================
// Navigation Manifest — Platform Administration & Governance
// Single source of truth for platform administrative tools
// ============================================================

import type { NavManifest } from '../types';

export const adminManifest: NavManifest = {
  sections: [
    {
      id: 'admin-tenants',
      label: 'Platform Tenants',
      description: 'Manage employer enterprise accounts, recruiter licensing, and global user directory',
      roles: ['PLATFORM_ADMIN'],
      order: 10,
      icon: 'Building2',
    },
    {
      id: 'admin-governance',
      label: 'Platform Governance',
      description: 'Security audit trails, AI engine rate limits, and taxonomy inspection',
      roles: ['PLATFORM_ADMIN'],
      order: 20,
      icon: 'Shield',
    },
  ],
  entries: [
    // Root Dashboard
    {
      id: 'admin-dashboard',
      label: 'Admin Console',
      shortLabel: 'Dashboard',
      description: 'Platform metrics, enterprise tenant status, and system health overview',
      route: '/admin/dashboard',
      icon: 'LayoutDashboard',
      section: 'root',
      roles: ['PLATFORM_ADMIN'],
      order: 1,
      keywords: ['admin', 'dashboard', 'console', 'overview', 'system status'],
      redirectsFrom: ['/admin/analytics'],
      status: 'stable',
    },
    // Platform Tenants
    {
      id: 'admin-companies',
      label: 'Managed Companies',
      shortLabel: 'Companies',
      description: 'Tenant organizations, enterprise subscription status, and company logos.',
      route: '/admin/companies',
      icon: 'Building2',
      section: 'admin-tenants',
      roles: ['PLATFORM_ADMIN'],
      order: 10,
      keywords: ['companies', 'tenants', 'enterprises', 'organizations'],
      status: 'stable',
    },
    {
      id: 'admin-users',
      label: 'User Directory',
      shortLabel: 'Users & Roles',
      description: 'Platform accounts, role assignments, and permission flags.',
      route: '/admin/users',
      icon: 'Users',
      section: 'admin-tenants',
      roles: ['PLATFORM_ADMIN'],
      order: 20,
      keywords: ['users', 'roles', 'accounts', 'permissions', 'access control'],
      status: 'stable',
    },
    // Governance & Security
    {
      id: 'admin-audit',
      label: 'Security Audit Log',
      shortLabel: 'Audit Log',
      description: 'Immutable record of authentication, permission changes, and sensitive operations.',
      route: '/admin/audit',
      icon: 'Shield',
      section: 'admin-governance',
      roles: ['PLATFORM_ADMIN'],
      order: 10,
      keywords: ['audit', 'security', 'logs', 'compliance', 'trail'],
      status: 'stable',
    },
    {
      id: 'admin-settings',
      label: 'Platform Settings',
      shortLabel: 'Settings',
      description: 'AI model parameters, API keys, email dispatchers, and tenant defaults.',
      route: '/admin/settings',
      icon: 'Settings',
      section: 'admin-governance',
      roles: ['PLATFORM_ADMIN'],
      order: 20,
      keywords: ['settings', 'configuration', 'api keys', 'ai models'],
      redirectsFrom: ['/admin/ai'],
      status: 'stable',
    },
    {
      id: 'admin-careers-data',
      label: 'Careers Data Platform',
      shortLabel: 'Careers Data',
      description: 'Inspect raw engineering roles, skills taxonomy, and market CTC datasets.',
      route: '/dev/careers-data',
      icon: 'Database',
      section: 'admin-governance',
      roles: ['PLATFORM_ADMIN'],
      order: 30,
      keywords: ['careers data', 'taxonomy', 'dataset', 'explorer', 'dev'],
      status: 'stable',
    },
    {
      id: 'admin-notifications',
      label: 'System Alerts',
      shortLabel: 'Notifications',
      description: 'Critical system warnings, security alerts, and platform error logs.',
      route: '/admin/notifications',
      icon: 'Bell',
      section: 'admin-governance',
      roles: ['PLATFORM_ADMIN'],
      order: 40,
      keywords: ['notifications', 'system alerts', 'warnings'],
      status: 'stable',
    },
  ],
};

export default adminManifest;
