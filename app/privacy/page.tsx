import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      
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
        <h1 className="text-4xl md:text-5xl font-black mb-12 tracking-tight">Privacy Policy</h1>
        
        <div className="space-y-12 text-slate-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">01. Data Collection</h2>
            <p>
              We only collect necessary information to provide our services. This includes your Atlassian account ID and standard profile information provided via OAuth. We do not store your Jira issue content permanently beyond the scope of providing templates and bulk creation features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">02. Security & Encryption</h2>
            <p>
              Security is our core priority. All session tokens are encrypted at-rest using AES-256-CBC. Your data never touches the client-side browser logic, ensuring a zero-trust architecture.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">03. Cookie Usage</h2>
            <p>
              We use secure, HttpOnly cookies for session management. We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">04. Third-Party Services</h2>
            <p>
              Our service interacts exclusively with the official Atlassian API. We do not sell or share your data with any other third parties.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
