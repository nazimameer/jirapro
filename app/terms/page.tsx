import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />
      
      <nav className="border-b border-white/5 bg-black/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center transition-transform group-hover:scale-110">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">JiraPro</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Back to Home</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20 relative">
        <h1 className="text-4xl md:text-5xl font-black mb-12 tracking-tight">Terms of Service</h1>
        
        <div className="space-y-12 text-slate-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">01. Acceptance of Terms</h2>
            <p>
              By accessing JiraPro, you agree to be bound by these terms. Our service is provided "as is" and we are not liable for any issues arising from interactions with official Atlassian APIs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">02. Authorized Use</h2>
            <p>
              You must be an authorized Jira user to use this application. You are responsible for ensuring your use of this tool complies with your organization's IT policies and Jira permissions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">03. Automated Actions</h2>
            <p>
              This tool performs bulk actions. You acknowledge that creating a large number of issues may trigger Jira rate limits or notification spikes. Use responsibly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">04. Termination</h2>
            <p>
              We reserve the right to suspend access to the service if any misuse or security threat is detected.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
