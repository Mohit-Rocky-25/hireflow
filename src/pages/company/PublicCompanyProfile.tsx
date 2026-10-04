// ============================================================
// HireFlow — Public Company Profile & Branding Page
// Premium Company Showcase with Salary Analytics & Data Insights
// ============================================================
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { 
  MapPin, Globe, Users, TrendingUp, Building2, ChevronRight, 
  Briefcase, Star, ChevronLeft, ArrowRight, CheckCircle2,
  LineChart, DollarSign, Clock
} from 'lucide-react';
import { Button } from '../../components/ui/Components';

export function PublicCompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { companies, jobs } = useStore();
  
  const [activeTab, setActiveTab] = useState<'about' | 'jobs' | 'insights'>('about');

  // Find company, or mock fallback
  const company = companies.find(c => c.id === id) || {
    id: id || '1',
    name: 'Tata Motors',
    subscription: 'Enterprise',
  };
  
  const companyDomain = (company as any).domain || 'Automotive & Manufacturing';

  const companyJobs = jobs.filter(j => j.companyId === company.id && j.status === 'published');

  // Mock Data Strategy: Salary Analytics & Insights
  const marketInsights = {
    avgSalary: '₹14L - ₹28L',
    growthRate: '+18% YoY',
    topRoles: ['Senior SDE', 'Data Scientist', 'Product Manager'],
    benefits: ['Remote/Hybrid Options', 'Full Medical Coverage', 'ESOPs', 'Annual Bonus'],
    hiringProcessTime: '14 Days Average',
    interviewDifficulty: 'Medium-Hard (3 Rounds)',
  };

  return (
    <div className="min-h-screen bg-bg">
      <PublicNavbar />
      
      <main className="pt-[68px] animate-fade-in">
        {/* Hero Branding Header */}
        <div className="relative h-[280px] bg-surface-2 overflow-hidden border-b border-border">
          {/* Subtle abstract background mesh */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-light/20 to-transparent pointer-events-none" />
          <div className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] bg-primary-glow rounded-full blur-[100px] opacity-20 pointer-events-none" />
          
          <div className="absolute bottom-[24px] left-0 w-full px-[32px] max-w-[1280px] mx-auto flex items-end gap-[24px]">
            <div className="w-[100px] h-[100px] rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white text-[36px] font-extrabold shadow-glow-orange border-[4px] border-surface">
              {company.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 pb-[8px]">
              <div className="flex items-center gap-[12px] mb-[4px]">
                <h1 className="text-[32px] font-bold text-text tracking-tight">{company.name}</h1>
                <span className="px-[12px] py-[4px] bg-primary-light text-primary text-[12px] font-bold rounded-full flex items-center gap-[4px]">
                  <CheckCircle2 className="w-[14px] h-[14px]" /> Verified
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-[16px] text-[14px] text-text-secondary font-medium">
                <span className="flex items-center gap-[6px]"><Building2 className="w-[16px] h-[16px]"/> {companyDomain}</span>
                <span className="flex items-center gap-[6px]"><MapPin className="w-[16px] h-[16px]"/> Mumbai, India (HQ)</span>
                <span className="flex items-center gap-[6px]"><Users className="w-[16px] h-[16px]"/> 10,000+ Employees</span>
              </div>
            </div>
            <Button variant="primary" className="mb-[8px]">
              Follow Company
            </Button>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-[32px] py-[32px]">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-[8px] border-b border-border mb-[32px]">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-[20px] py-[12px] text-[15px] font-bold transition-all border-b-2 ${activeTab === 'about' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text hover:bg-surface-2'}`}
            >
              About Life at {company.name}
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-[20px] py-[12px] text-[15px] font-bold transition-all border-b-2 flex items-center gap-[8px] ${activeTab === 'jobs' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text hover:bg-surface-2'}`}
            >
              Open Roles <span className="px-[8px] py-[2px] bg-surface-3 text-text-muted text-[12px] rounded-full">{companyJobs.length || 10}</span>
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-[20px] py-[12px] text-[15px] font-bold transition-all border-b-2 flex items-center gap-[6px] ${activeTab === 'insights' ? 'border-ai text-ai' : 'border-transparent text-text-secondary hover:text-text hover:bg-surface-2'}`}
            >
              <TrendingUp className="w-[16px] h-[16px]" /> Data & Insights
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'about' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-[32px] animate-fade-in">
                <div className="lg:col-span-2 space-y-[24px]">
                  <h2 className="text-[20px] font-bold text-text">Company Overview</h2>
                  <p className="text-[15px] text-text-secondary leading-[26px]">
                    {company.name} is a global leader in {companyDomain.toLowerCase()}, committed to driving innovation and empowering the next generation of engineers and creators. 
                    We believe in building a culture of continuous learning, diversity, and impact-driven results.
                  </p>
                  
                  <h2 className="text-[20px] font-bold text-text pt-[16px]">Core Values</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                    {['Innovation First', 'Customer Centric', 'Integrity', 'Sustainability'].map(value => (
                      <div key={value} className="bg-surface border border-border p-[20px] rounded-xl flex items-center gap-[12px]">
                        <Star className="w-[20px] h-[20px] text-warning" />
                        <span className="font-bold text-text">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-[24px]">
                  <div className="bg-surface rounded-2xl border border-border p-[24px] shadow-sm">
                    <h3 className="text-[14px] font-bold text-text mb-[16px] uppercase tracking-wider">Perks & Benefits</h3>
                    <ul className="space-y-[12px]">
                      {marketInsights.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-[8px] text-[14px] text-text-secondary font-medium">
                          <CheckCircle2 className="w-[16px] h-[16px] text-success" /> {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="animate-fade-in space-y-[32px]">
                <div>
                  <h2 className="text-[24px] font-bold text-text flex items-center gap-[10px] mb-[8px]">
                    <LineChart className="w-[24px] h-[24px] text-ai" /> Market & Salary Analytics
                  </h2>
                  <p className="text-[15px] text-text-secondary">Real-time data insights for {company.name} based on 2024-25 hiring trends.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
                  <div className="bg-surface border border-border p-[24px] rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <div className="w-[40px] h-[40px] bg-primary-light text-primary rounded-xl flex items-center justify-center mb-[16px]">
                      <DollarSign className="w-[20px] h-[20px]" />
                    </div>
                    <h3 className="text-[14px] font-bold text-text-secondary mb-[4px]">Average SDE Salary</h3>
                    <p className="text-[28px] font-extrabold text-text tracking-tight">{marketInsights.avgSalary}</p>
                    <p className="text-[12px] font-semibold text-success mt-[8px]">Top 15% in India</p>
                  </div>
                  
                  <div className="bg-surface border border-border p-[24px] rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <div className="w-[40px] h-[40px] bg-ai-light text-ai rounded-xl flex items-center justify-center mb-[16px]">
                      <TrendingUp className="w-[20px] h-[20px]" />
                    </div>
                    <h3 className="text-[14px] font-bold text-text-secondary mb-[4px]">Hiring Growth</h3>
                    <p className="text-[28px] font-extrabold text-text tracking-tight">{marketInsights.growthRate}</p>
                    <p className="text-[12px] font-semibold text-text-muted mt-[8px]">Compared to last year</p>
                  </div>

                  <div className="bg-surface border border-border p-[24px] rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <div className="w-[40px] h-[40px] bg-surface-3 text-text-secondary rounded-xl flex items-center justify-center mb-[16px]">
                      <Clock className="w-[20px] h-[20px]" />
                    </div>
                    <h3 className="text-[14px] font-bold text-text-secondary mb-[4px]">Interview Process</h3>
                    <p className="text-[24px] font-extrabold text-text tracking-tight leading-[28px]">{marketInsights.hiringProcessTime}</p>
                    <p className="text-[12px] font-semibold text-text-muted mt-[8px]">{marketInsights.interviewDifficulty}</p>
                  </div>
                </div>

                <div className="bg-surface rounded-2xl border border-border p-[32px] shadow-sm">
                  <h3 className="text-[18px] font-bold text-text mb-[16px]">Most Recruited Roles</h3>
                  <div className="flex flex-wrap gap-[12px]">
                    {marketInsights.topRoles.map(role => (
                      <span key={role} className="px-[16px] py-[8px] bg-surface-2 border border-border rounded-xl text-[14px] font-bold text-text">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="animate-fade-in grid grid-cols-1 gap-[16px]">
                {companyJobs.length > 0 ? companyJobs.map(job => (
                  <Link 
                    key={job.id} 
                    to={`/jobs/${job.id}`}
                    className="bg-surface border border-border p-[24px] rounded-2xl hover:border-primary/50 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-[16px] group"
                  >
                    <div>
                      <h3 className="text-[18px] font-bold text-text group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-[16px] mt-[8px] text-[14px] text-text-secondary font-medium">
                        <span className="flex items-center gap-[6px]"><MapPin className="w-[14px] h-[14px]"/> {job.location}</span>
                        <span className="flex items-center gap-[6px]"><Briefcase className="w-[14px] h-[14px]"/> {job.employmentType}</span>
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="flex items-center gap-[6px]">
                            <DollarSign className="w-[14px] h-[14px]"/> 
                            {job.salaryCurrency} {job.salaryMin ? job.salaryMin.toLocaleString() : '0'} {job.salaryMax ? `- ${job.salaryMax.toLocaleString()}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="secondary" className="shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                      View Details <ArrowRight className="w-[16px] h-[16px]" />
                    </Button>
                  </Link>
                )) : (
                  <div className="text-center py-[64px] border border-border rounded-2xl bg-surface-2/50">
                    <Briefcase className="w-[48px] h-[48px] text-text-muted mx-auto mb-[16px] opacity-50" />
                    <h3 className="text-[16px] font-bold text-text mb-[8px]">No open roles right now</h3>
                    <p className="text-[14px] text-text-secondary">Follow the company to get notified when new positions open up.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
