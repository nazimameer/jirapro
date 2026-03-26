import ThemeWrapper from "@/components/ThemeWrapper";
import Navbar from "@/components/Navbar";

export default function ContactPage() {
  return (
    <ThemeWrapper>
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-40 relative">
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
            Need specialized Jira automation or encountered a logic loop? Our engineering team is standing by.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-10 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-md group hover:bg-indigo-500/10 transition-all">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Technical Support</h3>
            <p className="text-slate-400 font-medium mb-6">Reach out for API integrations, bugs, or account issues.</p>
            <a href="mailto:support@jirapro.io" className="text-indigo-400 font-black tracking-widest text-xs uppercase hover:text-indigo-300 transition-colors flex items-center gap-2">
              support@jirapro.io
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>

          <div className="p-10 rounded-[2.5rem] bg-fuchsia-500/5 border border-fuchsia-500/10 backdrop-blur-md group hover:bg-fuchsia-500/10 transition-all">
            <div className="w-14 h-14 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center mb-8 border border-fuchsia-500/20 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Live Status</h3>
            <p className="text-slate-400 font-medium mb-6">Check our uptime and system integrity in real-time.</p>
            <a href="#" className="text-fuchsia-400 font-black tracking-widest text-xs uppercase hover:text-fuchsia-300 transition-colors flex items-center gap-2">
              Status Console
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
        </div>
      </main>
    </ThemeWrapper>
  );
}
