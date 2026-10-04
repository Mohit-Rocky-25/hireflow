import { useState } from 'react';
import { Target, ArrowRight, Zap, TrendingUp, Compass, Code, DollarSign, Brain, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function CareerPathSimulator() {
  const [role, setRole] = useState('');
  const [goal, setGoal] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);

  const mockSalaryData = [
    { year: 'Year 0', salary: 70000 },
    { year: 'Year 1', salary: 85000 },
    { year: 'Year 2', salary: 110000 },
    { year: 'Year 3', salary: 140000 },
    { year: 'Year 4', salary: 180000 },
  ];

  const handleSimulate = () => {
    if (!role || !goal) return;
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setRoadmap({
        current: role,
        target: goal,
        estimatedTime: '3-4 Years',
        salaryJump: '+$110,000',
        steps: [
          {
            title: 'Master Advanced State Management',
            description: 'Move beyond basic React context. Learn Zustand, Redux Toolkit, and handling complex async data with React Query.',
            icon: <Brain className="w-5 h-5 text-purple-500" />
          },
          {
            title: 'Learn System Design',
            description: 'Start understanding how large-scale applications are architected. Learn about load balancers, caching (Redis), and microservices.',
            icon: <Target className="w-5 h-5 text-blue-500" />
          },
          {
            title: 'Lead a Major Feature',
            description: 'Transition from taking tickets to architecting features end-to-end. Mentor junior developers on your team.',
            icon: <Zap className="w-5 h-5 text-yellow-500" />
          }
        ]
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-12 px-8 relative">
      
      {/* Absolute Top-Left Back Button */}
      <div className="absolute top-8 left-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-black text-text hover:text-primary transition-colors">
          <ArrowRight className="w-6 h-6 rotate-180" /> Back to Home
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        <div className="text-center max-w-3xl mx-auto mb-12 mt-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4">
            Career Path <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Simulator</span>
          </h1>
          <p className="text-secondary text-lg">
            Map out your exact trajectory. Enter your current role and your dream job, and we'll calculate the skills and timeline to get there.
          </p>
        </div>

        {!roadmap && (
          <div className="bg-surface rounded-card p-8 border border-border shadow-xl max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-muted" /> Current Role
                </label>
                <input 
                  type="text" 
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Junior Frontend Developer"
                  className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center border border-border">
                  <ArrowRight className="w-4 h-4 text-muted rotate-90 md:rotate-0" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Dream Role
                </label>
                <input 
                  type="text" 
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="e.g. Staff Engineer"
                  className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <button
                onClick={handleSimulate}
                disabled={!role || !goal || isSimulating}
                className={`w-full relative overflow-hidden group px-8 py-4 rounded-lg font-black text-lg transition-all ${
                  isSimulating ? 'bg-surface-3 text-secondary cursor-not-allowed' : 'bg-primary text-white hover:scale-[1.02] hover:shadow-xl'
                }`}
              >
                {isSimulating ? (
                  <span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Calculating Trajectory...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><TrendingUp className="w-5 h-5" /> Generate Career Map</span>
                )}
              </button>
            </div>
          </div>
        )}

        {roadmap && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-surface rounded-card p-6 border border-border shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Estimated Time</p>
                  <p className="text-2xl font-black text-foreground">{roadmap.estimatedTime}</p>
                </div>
              </div>
              <div className="bg-surface rounded-card p-6 border border-border shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Projected Salary Jump</p>
                  <p className="text-2xl font-black text-success">{roadmap.salaryJump}</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Steps */}
              <div className="bg-surface rounded-card p-6 border border-border shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-6">The Action Plan</h3>
                <div className="space-y-6">
                  {roadmap.steps.map((step: any, i: number) => (
                    <div key={i} className="flex gap-4 relative">
                      {i !== roadmap.steps.length - 1 && (
                        <div className="absolute top-10 left-[1.15rem] bottom-[-20px] w-0.5 bg-border z-0" />
                      )}
                      <div className="w-10 h-10 rounded-full bg-surface border-2 border-border flex items-center justify-center shrink-0 z-10 shadow-sm">
                        {step.icon}
                      </div>
                      <div className="pt-2">
                        <h4 className="text-sm font-bold text-foreground mb-1">{step.title}</h4>
                        <p className="text-sm text-secondary leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div className="bg-surface rounded-card p-6 border border-border shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-foreground mb-6">Salary Trajectory</h3>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockSalaryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                        width={60}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Salary']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="salary" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSalary)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button onClick={() => setRoadmap(null)} className="px-6 py-3 bg-surface-2 border border-border text-sm font-bold rounded-btn hover:bg-surface-3 transition-colors">
                Start Over
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
// Need to add Clock import to lucide-react in the final version
