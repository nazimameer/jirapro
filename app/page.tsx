import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white overflow-hidden relative selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      {/* Navigation */}
      <nav className="absolute top-0 w-full z-10 border-b border-white/5 bg-black/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">JiraPro</span>
          </div>
          <div>
            {user ? (
              <Link 
                href="/dashboard"
                className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/api/auth/login"
                className="px-5 py-2.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.864 13.911a3.02 3.02 0 11-3.02-3.02h3.02v3.02zm1.908-4.928a3.02 3.02 0 10-2.14-5.161L12.772.484a5.003 5.003 0 114.619 8.441l-4.619-4.881zm.001 5.485h-10.74l10.74 10.746V14.468zM24 10.871A5.042 5.042 0 0113.882 15.93l9.049-9.05a5.021 5.021 0 011.069 3.991z"/>
                </svg>
                Sign in with Atlassian
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 px-6 flex flex-col items-center justify-center min-h-screen text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">Jira Bulk Manager v2.0</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1] max-w-5xl">
          Supercharge your <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 animate-gradient-x">Jira Workflow</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          The ultimate utility for creating multiple Jira tasks instantly. Use templates, paste raw text, and watch our smart engine build out your epic backlog in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {user ? (
            <Link 
              href="/bulk"
              className="px-8 py-4 rounded-full bg-white text-black hover:bg-slate-200 text-base font-black transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              Start Creating Tasks
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          ) : (
            <Link 
              href="/api/auth/login"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white text-base font-black transition-all shadow-[0_0_40px_rgba(99,102,241,0.4)] flex items-center justify-center gap-3 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.864 13.911a3.02 3.02 0 11-3.02-3.02h3.02v3.02zm1.908-4.928a3.02 3.02 0 10-2.14-5.161L12.772.484a5.003 5.003 0 114.619 8.441l-4.619-4.881zm.001 5.485h-10.74l10.74 10.746V14.468zM24 10.871A5.042 5.042 0 0113.882 15.93l9.049-9.05a5.021 5.021 0 011.069 3.991z"/>
              </svg>
              Connect your Jira
            </Link>
          )}
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Create 50+ issues in seconds. Paste directly from spreadsheets or notes, and our engine automatically structures the payload.</p>
          </div>
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Save Templates</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Save repeated launch checklists, QA suites, or sprint templates. Load them in one click and never type the same issue twice.</p>
          </div>
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Enterprise Secure</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Full at-rest AES-256 encryption for access tokens. Your data never touches the client side, ensuring total zero-trust security.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
