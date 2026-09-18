// ============================================================
// HireFlow — Landing Page
// ============================================================
import { Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, Building2, Users, Brain, 
  Calendar, BarChart3, Shield, CheckCircle, ChevronRight,
  Briefcase, Star, Zap
} from 'lucide-react';
import { useStore } from '../store/useStore';

export function LandingPage() {
  const { isAuthenticated, currentUser } = useStore();

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-btn bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">HireFlow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/jobs" className="text-sm font-medium text-secondary hover:text-foreground transition-colors">Find Jobs</Link>
            <a href="#features" className="text-sm font-medium text-secondary hover:text-foreground transition-colors">Features</a>
            <a href="#companies" className="text-sm font-medium text-secondary hover:text-foreground transition-colors">For Companies</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && currentUser ? (
              <Link
                to={currentUser.role === 'CANDIDATE' ? '/candidate/dashboard' : currentUser.role === 'INTERVIEWER' ? '/interviewer/dashboard' : currentUser.role === 'PLATFORM_ADMIN' ? '/admin/dashboard' : '/company/dashboard'}
                className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-hover transition-all shadow-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-100 rounded-btn transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-5 py-2.5 bg-black-btn text-white text-sm font-semibold rounded-btn hover:bg-black-hover transition-all shadow-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-ai-light text-ai text-sm font-medium rounded-full mb-6 animate-fade-in">
            <Brain className="w-4 h-4" />
            AI-Powered Recruitment Platform
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight animate-slide-up">
            Hire smarter.
            <br />
            <span className="bg-gradient-to-r from-primary to-ai bg-clip-text text-transparent">
              Spend less time filtering.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-secondary max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Let companies define what they need. Let AI organize and analyze applications.
            Let people make the final hiring decisions.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/register?role=company"
              className="px-8 py-3.5 bg-black-btn text-white text-base font-semibold rounded-btn hover:bg-black-hover transition-all shadow-md hover:shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Building2 className="w-5 h-5" />
              For Companies
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/jobs"
              className="px-8 py-3.5 bg-primary text-white text-base font-semibold rounded-btn hover:bg-primary-hover transition-all shadow-md hover:shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Briefcase className="w-5 h-5" />
              Find Jobs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Demo Accounts */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-card max-w-lg mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-sm font-semibold text-amber-800 mb-2">🔑 Demo Accounts (password: demo123)</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-amber-700">
              <div><strong>BHR:</strong> demo-bhr@example.com</div>
              <div><strong>HR:</strong> demo-hr@example.com</div>
              <div><strong>Interviewer:</strong> demo-interviewer@example.com</div>
              <div><strong>Candidate:</strong> demo-candidate@example.com</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              From job creation to interviews,
              <br />
              manage the <span className="text-primary">complete hiring workflow</span>
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Reduce repetitive screening work while keeping the hiring process transparent and human-controlled.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Building2 className="w-6 h-6" />, title: 'Create Roles', desc: 'Define job positions with specific requirements and weights', color: 'text-primary bg-primary-light' },
              { icon: <Brain className="w-6 h-6" />, title: 'AI Screening', desc: 'Automated resume parsing and requirement matching', color: 'text-ai bg-ai-light' },
              { icon: <Star className="w-6 h-6" />, title: 'Rank & Review', desc: 'Evidence-based candidate ranking with explanations', color: 'text-warning bg-amber-50' },
              { icon: <Calendar className="w-6 h-6" />, title: 'Interview & Hire', desc: 'Schedule interviews, collect feedback, make decisions', color: 'text-success bg-green-50' },
            ].map((step, i) => (
              <div key={i} className="bg-surface rounded-card-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-btn ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to <span className="text-ai">hire better</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Shield />, title: 'Multi-Tenant Security', desc: 'Complete data isolation between companies with row-level security' },
              { icon: <Brain />, title: 'AI Match Analysis', desc: 'Semantic matching with explainable scores and evidence' },
              { icon: <Users />, title: 'Role-Based Access', desc: '5 distinct roles with permission-aware dashboards' },
              { icon: <BarChart3 />, title: 'Real Analytics', desc: 'Database-driven metrics, no fake numbers' },
              { icon: <Calendar />, title: 'Interview Management', desc: 'Assign interviewers, schedule, collect structured feedback' },
              { icon: <Zap />, title: 'Real-Time Updates', desc: 'Instant notifications for applications, interviews, and status changes' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-card bg-surface border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300">
                <div className="w-10 h-10 rounded-btn bg-primary-light text-primary flex items-center justify-center shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-secondary">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Candidates */}
      <section id="candidates" className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-light">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            For Candidates
          </h2>
          <p className="text-lg text-secondary mb-8 max-w-2xl mx-auto">
            Create your profile, upload your resume, discover relevant roles, apply, and track your applications — all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {['Create Profile', 'Upload Resume', 'Discover Roles', 'Apply', 'Track Applications', 'Manage Interviews'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-surface rounded-btn shadow-card text-sm font-medium text-foreground">
                <CheckCircle className="w-4 h-4 text-success" />
                {item}
              </div>
            ))}
          </div>
          <Link
            to="/register?role=candidate"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white text-base font-semibold rounded-btn hover:bg-primary-hover transition-all shadow-md"
          >
            Get Started as Candidate
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-foreground text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-btn bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">HireFlow</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2026 HireFlow. AI-Powered Hiring Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
