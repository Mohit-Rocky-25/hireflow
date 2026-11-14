import React, { useState } from 'react';
import { useProfileStore } from '@/features/profile/useProfileStore';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { toast } from '@/components/ui/Toast';
import { RefreshCw, Trash2, Check } from 'lucide-react';

export const ProfileSection: React.FC = () => {
  const { profile, updateProfile } = useProfileStore();
  const { isDemo, demoStorage, resetDemoData, deleteAllCloudData } = useAuthStore();

  const [displayName, setDisplayName] = useState(profile.displayName || 'Mohit');
  const [degree, setDegree] = useState(profile.degree || '');
  const [branch, setBranch] = useState(profile.branch || '');
  const [graduationYear, setGraduationYear] = useState<number | string>(
    profile.graduationYear || 2027
  );
  const [targetTier, setTargetTier] = useState(profile.targetTier || 'Tier A');
  const [targetRolesText, setTargetRolesText] = useState(
    profile.targetRoles?.join(', ') || 'Backend Engineer, Systems Engineer'
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const roles = targetRolesText
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    updateProfile({
      displayName,
      degree: degree || undefined,
      branch: branch || undefined,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      targetTier,
      targetRoles: roles,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    toast('success', 'Profile details updated.');
  };

  const handleResetDemo = async () => {
    const ok = window.confirm(
      'Reset demo data? This will restore the shared demo account to its initial state.'
    );
    if (!ok) return;

    try {
      setIsResetting(true);
      await resetDemoData();
      toast('success', 'Demo data reset to initial sample state.');
    } catch {
      toast('error', 'Failed to reset demo data.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteCloud = async () => {
    const ok = window.confirm(
      'Delete all your cloud data? This permanently removes all synced evaluations and items.'
    );
    if (!ok) return;

    try {
      setIsDeleting(true);
      await deleteAllCloudData();
      toast('info', 'Cloud data removed.');
    } catch {
      toast('error', 'Failed to delete cloud data.');
    } finally {
      setIsDeleting(false);
    }
  };

  const syncStatusDescription =
    demoStorage === 'local'
      ? 'Saved on this device only. Offline storage is enabled in this browser.'
      : 'Synced to your account. Evaluations and plan items follow you across devices.';

  return (
    <div className="max-w-[700px]">
      <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#6d6d61] uppercase mb-2">
        Candidate Identity
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-[#f1f1e8] mb-6">
        Profile
      </h2>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-xl border border-[#24241c] bg-[#10100d] space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#6d6d61] mb-1.5">
              First Name or Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#16160f] border border-[#24241c] text-[#f1f1e8] text-sm outline-none focus:border-[#faff69]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6d6d61] mb-1.5">
                Degree
              </label>
              <input
                type="text"
                placeholder="e.g. B.Tech"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#16160f] border border-[#24241c] text-[#f1f1e8] text-sm outline-none focus:border-[#faff69]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6d6d61] mb-1.5">
                Branch or Major
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#16160f] border border-[#24241c] text-[#f1f1e8] text-sm outline-none focus:border-[#faff69]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6d6d61] mb-1.5">
                Graduation Year
              </label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#16160f] border border-[#24241c] text-[#f1f1e8] text-sm outline-none focus:border-[#faff69]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6d6d61] mb-1.5">
                Target Tier
              </label>
              <select
                value={targetTier}
                onChange={(e) => setTargetTier(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#16160f] border border-[#24241c] text-[#f1f1e8] text-sm outline-none focus:border-[#faff69]"
              >
                <option value="Tier A">Tier A (Google, Razorpay, Uber)</option>
                <option value="Tier B">Tier B (Fast-growing product)</option>
                <option value="Tier C">Tier C (Service or IT enterprise)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#6d6d61] mb-1.5">
              Target Roles (comma-separated)
            </label>
            <input
              type="text"
              value={targetRolesText}
              onChange={(e) => setTargetRolesText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#16160f] border border-[#24241c] text-[#f1f1e8] text-sm outline-none focus:border-[#faff69]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#faff69] text-[#090907] font-bold text-xs uppercase tracking-wider hover:bg-[#ebf059] transition-colors cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>

        {/* Sync Settings */}
        <div className="p-6 rounded-xl border border-[#24241c] bg-[#10100d] space-y-4">
          <div className="font-mono text-xs font-semibold tracking-wider text-[#6d6d61] uppercase">
            Data Storage and Sync
          </div>
          <p className="text-sm text-[#9b9b8c] leading-relaxed">
            {syncStatusDescription}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            {isDemo && (
              <button
                type="button"
                onClick={handleResetDemo}
                disabled={isResetting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#24241c] bg-[#16160f] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/40 hover:text-[#faff69] transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'Resetting...' : 'Reset demo data'}</span>
              </button>
            )}

            {demoStorage === 'cloud' && (
              <button
                type="button"
                onClick={handleDeleteCloud}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-900/40 bg-[#16160f] text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete my cloud data'}</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

