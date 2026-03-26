import ThemeWrapper from "@/components/ThemeWrapper";
import Navbar from "@/components/Navbar";

export default function TermsPage() {
  return (
    <ThemeWrapper>
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-6 py-40 relative">
        <h1 className="text-5xl md:text-6xl font-black mb-16 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
          Terms of Service
        </h1>
        
        <div className="space-y-16 text-slate-400 leading-relaxed font-medium">
          <section className="group">
            <h2 className="text-xs font-black text-indigo-400 mb-4 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-8 h-[1px] bg-indigo-500/30 group-hover:w-12 transition-all" />
              01. Agreement to Terms
            </h2>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/5 backdrop-blur-md">
              <p className="text-lg">
                By accessing Jira Pro, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access our automation suite.
              </p>
            </div>
          </section>

          <section className="group">
            <h2 className="text-xs font-black text-fuchsia-400 mb-4 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-8 h-[1px] bg-fuchsia-500/30 group-hover:w-12 transition-all" />
              02. Use License
            </h2>
            <p className="text-lg">
              Permission is granted to use Jira Pro for personal or commercial Jira automation. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section className="group">
            <h2 className="text-xs font-black text-emerald-400 mb-4 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-8 h-[1px] bg-emerald-500/30 group-hover:w-12 transition-all" />
              03. Service Limitations
            </h2>
            <p className="text-lg">
              Jira Pro is provided "as is". We make no warranties, expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties or conditions of merchantability.
            </p>
          </section>
        </div>
      </main>
    </ThemeWrapper>
  );
}
