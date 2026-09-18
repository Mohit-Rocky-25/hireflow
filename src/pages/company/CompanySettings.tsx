// HireFlow — Company Settings
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Settings, Save } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export function CompanySettings() {
  const { currentCompanyId, companies, updateCompany } = useStore();
  const company = companies.find(c => c.id === currentCompanyId);
  const [form, setForm] = useState({
    name: company?.name || '', description: company?.description || '',
    industry: company?.industry || '', location: company?.location || '',
    website: company?.website || '', size: company?.size || '',
  });

  const handleSave = () => {
    if (!currentCompanyId) return;
    updateCompany(currentCompanyId, form);
    toast('success', 'Company settings updated');
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground">Company Settings</h1>
      <div className="bg-surface rounded-card border border-border p-6 space-y-4">
        <div><label className="block text-sm font-medium text-foreground mb-1.5">Company Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none" /></div>
        <div><label className="block text-sm font-medium text-foreground mb-1.5">Description</label><textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none resize-none" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Industry</label><input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Location</label><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Website</label><input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Size</label><input value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none" /></div>
        </div>
        <button onClick={handleSave} className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-hover transition-all flex items-center gap-2"><Save className="w-4 h-4" />Save Changes</button>
      </div>
    </div>
  );
}
