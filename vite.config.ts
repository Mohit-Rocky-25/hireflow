import { defineConfig, loadEnv, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

function atsApiPlugin(): Plugin {
  return {
    name: 'ats-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/ats/analyze') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { resumeText, jdText, facts, apiKey: clientApiKey } = JSON.parse(body || '{}');
              
              const env = loadEnv('development', process.cwd(), '');
              const apiKey = clientApiKey || env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

              if (!apiKey || apiKey === 'your_gemini_api_key_here') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  isAiAvailable: false,
                  aiErrorNotice: 'GEMINI_API_KEY not set. Using high-accuracy grounded deterministic reasoning.',
                }));
                return;
              }

              const model = env.GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
              
              const prompt = `Candidate Resume Analysis Facts:
ATS Fit Score: ${facts.scoreBreakdown.finalScore}%
Must-Have Coverage: ${facts.scoreBreakdown.mustHaveCoverageScore}%
Evidence Quality: ${facts.scoreBreakdown.evidenceQualityScore}%
Seniority Fit: ${facts.scoreBreakdown.seniorityFitScore}%
Project Relevance: ${facts.scoreBreakdown.projectRelevanceScore}%
Format Safety: ${facts.scoreBreakdown.formatSafetyScore}%
Keyword Stuffing Penalty: ${facts.scoreBreakdown.keywordStuffingPenalty}
Role: ${facts.jd?.roleTitle || 'Software Engineer'}
Experience Required: ${facts.seniorityFit?.requiredYears ?? 'N/A'} yrs (Candidate has ~${facts.seniorityFit?.candidateYears ?? 'N/A'} yrs)
Missing Must-Haves: ${facts.skillMatches?.filter((m: any) => m.importance === 'must_have' && m.status === 'missing').map((m: any) => m.skill).join(', ') || 'None'}
Related Skills: ${facts.skillMatches?.filter((m: any) => m.status === 'related').map((m: any) => m.skill).join(', ') || 'None'}
Weak Bullets: ${facts.bulletAnalyses?.filter((b: any) => b.score < 60).map((b: any) => b.rawText).slice(0, 3).join(' | ') || 'None'}
Format Risks: ${facts.formatRisks?.map((r: any) => r.name).join(', ') || 'None'}
Tier Best Fit: ${facts.marketPositioning?.bestFitTier || 'Tier B'}

Full Resume Text:
${(resumeText || '').slice(0, 3500)}

Full Job Description:
${(jdText || '').slice(0, 2000)}`;

              const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  systemInstruction: {
                    parts: [{
                      text: "You are a veteran technical recruiter and staff engineer. Analyze candidate against target JD. Output strictly valid JSON matching { verdict: { headline, tone, oneParagraphSummary }, recruiterFirst6Seconds, harshTruths: [{ severity, issue, evidenceQuote, whyItHurts, fix }], skillGaps: [{ skill, type, fastestWayToClose, estimatedDays }], bulletRewrites: [{ original, rewritten, whatChanged }], marketPositioning: { bestFitTier, whyNotNextTier, topThreeSignalsToAdd }, interviewRiskQuestions: [{ question, whyTheyWillAsk, prepHint }], sevenDayPlan: [{ day, task, outcome }], thirtyDayPlan: [{ week, focus, deliverable }], alternativeRoles: [{ role, fitScore, reason }] }."
                    }]
                  },
                  contents: [{ role: 'user', parts: [{ text: prompt }] }],
                  generationConfig: {
                    responseMimeType: 'application/json'
                  }
                })
              });

              if (!geminiRes.ok) {
                const errText = await geminiRes.text();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  isAiAvailable: false,
                  aiErrorNotice: `Gemini API response: ${errText.slice(0, 120)}`,
                }));
                return;
              }

              const data = await geminiRes.json();
              const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (jsonText) {
                const parsed = JSON.parse(jsonText);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  isAiAvailable: true,
                  ai: parsed,
                }));
                return;
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ isAiAvailable: false, aiErrorNotice: 'Empty response from Gemini' }));
            } catch (err: any) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ isAiAvailable: false, aiErrorNotice: err.message }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), atsApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})

