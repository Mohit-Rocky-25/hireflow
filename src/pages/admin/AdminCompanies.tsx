// ============================================================
// HireFlow — Platform Admin: Companies Management
// ============================================================
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Building2, Search, Plus, MapPin, Globe, Users, Briefcase } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export function AdminCompanies() {
  const { companies, jobs, companyMembers, createCompany } = useStore();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: 'Technology',
    location: '',
    website: '',
    size: '11-50',
    description: '',
  });

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name.trim()) return;

    createCompany({
      name: newCompany.name.trim(),
      industry: newCompany.industry,
      location: newCompany.location || 'Remote',
      website: newCompany.website,
      size: newCompany.size,
      description: newCompany.description || `${newCompany.name} is an active employer on HireFlow.`,
    });

    toast('success', `Company "${newCompany.name}" onboarded successfully.`);
    setShowAddModal(false);
    setNewCompany({ name: '', industry: 'Technology', location: '', website: '', size: '11-50', description: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Registered Organizations</h1>
          <p className="text-sm text-muted">Manage companies, employer accounts, and tenant workspaces.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Company
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-surface rounded-card border border-border p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company name, industry, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(comp => {
          const compJobs = jobs.filter(j => j.companyId === comp.id);
          const members = companyMembers.filter(m => m.companyId === comp.id);

          return (
            <div
              key={comp.id}
              className="bg-surface rounded-card border border-border p-5 hover:border-primary/40 hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-btn bg-primary/10 flex items-center justify-center text-primary font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] px-2 py-0.5 bg-blue-50 text-primary rounded-full font-medium">
                    {comp.industry}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground">{comp.name}</h3>
                <p className="text-xs text-muted mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {comp.location} • {comp.size} employees
                </p>
                <p className="text-xs text-secondary mt-3 line-clamp-2">{comp.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Briefcase className="w-3.5 h-3.5 text-primary" /> {compJobs.length} Jobs
                </span>
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Users className="w-3.5 h-3.5 text-indigo-500" /> {members.length} Members
                </span>
                {comp.website && (
                  <a
                    href={comp.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline flex items-center gap-0.5"
                  >
                    <Globe className="w-3 h-3" /> Web
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-card border border-border max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-foreground">Add New Organization</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCompany.name}
                  onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary"
                  placeholder="Acme Corp"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Industry</label>
                  <input
                    type="text"
                    value={newCompany.industry}
                    onChange={e => setNewCompany({ ...newCompany, industry: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Company Size</label>
                  <select
                    value={newCompany.size}
                    onChange={e => setNewCompany({ ...newCompany, size: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Location</label>
                  <input
                    type="text"
                    value={newCompany.location}
                    onChange={e => setNewCompany({ ...newCompany, location: e.target.value })}
                    placeholder="New York, NY"
                    className="w-full px-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Website</label>
                  <input
                    type="url"
                    value={newCompany.website}
                    onChange={e => setNewCompany({ ...newCompany, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newCompany.description}
                  onChange={e => setNewCompany({ ...newCompany, description: e.target.value })}
                  placeholder="Overview of the company..."
                  className="w-full px-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold border border-border rounded-btn text-muted hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-btn hover:bg-primary-hover"
                >
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
