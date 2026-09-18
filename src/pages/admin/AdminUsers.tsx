// ============================================================
// HireFlow — Platform Admin: Users Management
// ============================================================
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Users, Search, Shield, Building2, UserCheck } from 'lucide-react';
import type { UserRole } from '../../types';

export function AdminUsers() {
  const { users, companies } = useStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const filtered = users.filter(u => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'PLATFORM_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'BHR_MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HR_RECRUITER':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'INTERVIEWER':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CANDIDATE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-border';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted">View all platform users, roles, and organizational associations.</p>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-card border border-border p-4 shadow-sm flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-btn border border-border bg-surface focus:outline-none focus:border-primary"
        >
          <option value="ALL">All Roles ({users.length})</option>
          <option value="PLATFORM_ADMIN">Platform Admins</option>
          <option value="BHR_MANAGER">BHR Managers</option>
          <option value="HR_RECRUITER">HR Recruiters</option>
          <option value="INTERVIEWER">Interviewers</option>
          <option value="CANDIDATE">Candidates</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-surface rounded-card border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-border text-xs text-muted uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Company / Org</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(user => {
                const company = companies.find(c => c.id === user.companyId);
                return (
                  <tr key={user.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{user.displayName}</p>
                          <p className="text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getRoleBadge(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-secondary">
                      {company ? (
                        <span className="flex items-center gap-1.5 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-muted" /> {company.name}
                        </span>
                      ) : (
                        <span className="text-muted italic">None (Independent)</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-success">
                        <UserCheck className="w-3 h-3" /> Active
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
