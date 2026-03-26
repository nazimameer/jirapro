import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ThemeWrapper from "@/components/ThemeWrapper";
import Navbar from "@/components/Navbar";

export default async function LandingPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <ThemeWrapper>
      <Navbar />

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
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed font-medium">
          The ultimate utility for creating multiple Jira tasks instantly. Use templates, paste raw text, and watch our smart engine build out your backlog in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="/api/auth/login"
            className="px-10 py-5 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white text-base font-black transition-all shadow-[0_0_40px_rgba(99,102,241,0.4)] flex items-center justify-center gap-3 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.864 13.911a3.02 3.02 0 11-3.02-3.02h3.02v3.02zm1.908-4.928a3.02 3.02 0 10-2.14-5.161L12.772.484a5.003 5.003 0 114.619 8.441l-4.619-4.881zm.001 5.485h-10.74l10.74 10.746V14.468zM24 10.871A5.042 5.042 0 0113.882 15.93l9.049-9.05a5.021 5.021 0 011.069 3.991z"/>
            </svg>
            Connect your Jira
          </Link>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tighter">Lightning Fast</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">Create 50+ issues in seconds. Paste directly from spreadsheets or notes, and our engine automatically structures the payload.</p>
          </div>
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tighter">Save Templates</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">Save repeated launch checklists, QA suites, or sprint templates. Load them in one click and never type the same issue twice.</p>
          </div>
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tighter">Enterprise Secure</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">Full at-rest AES-256 encryption. Your data never touches the client side, ensuring total zero-trust security.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-black text-lg tracking-tight text-white/90">JiraPro</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© 2026 JiraPro Smart Workflow Engine.</p>
          </div>
          
          <div className="flex gap-10 items-center">
            <Link href="/privacy" className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors">Terms</Link>
            <Link href="/contact" className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </ThemeWrapper>
  );
}
