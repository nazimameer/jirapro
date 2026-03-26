import ThemeWrapper from "@/components/ThemeWrapper";
import Navbar from "@/components/Navbar";

export default function PrivacyPage() {
  return (
    <ThemeWrapper>
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-6 py-40 relative">
        <h1 className="text-5xl md:text-6xl font-black mb-16 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
          Privacy Protocol
        </h1>
        
        <div className="space-y-16 text-slate-400 leading-relaxed font-medium">
          <section className="group">
            <h2 className="text-xs font-black text-indigo-400 mb-4 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-8 h-[1px] bg-indigo-500/30 group-hover:w-12 transition-all" />
              01. Neural Data Intake
            </h2>
            <p className="text-lg">
              We only collect necessary information to provide our services. This includes your Atlassian account ID and standard profile information provided via OAuth. We do not store your Jira issue content permanently beyond the scope of providing templates and bulk creation features.
            </p>
          </section>

          <section className="group">
            <h2 className="text-xs font-black text-fuchsia-400 mb-4 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-8 h-[1px] bg-fuchsia-500/30 group-hover:w-12 transition-all" />
              02. Encryption Grid
            </h2>
            <p className="text-lg">
              Security is our core priority. All session tokens are encrypted at-rest using AES-256-CBC. Your data never touches the client-side browser logic, ensuring a zero-trust architecture.
            </p>
          </section>

          <section className="group">
            <h2 className="text-xs font-black text-emerald-400 mb-4 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-8 h-[1px] bg-emerald-500/30 group-hover:w-12 transition-all" />
              03. Session Tokens
            </h2>
            <p className="text-lg">
              We use secure, HttpOnly cookies for session management. We do not use tracking or advertising cookies.
            </p>
          </section>

          <section className="group">
            <h2 className="text-xs font-black text-amber-400 mb-4 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-8 h-[1px] bg-amber-500/30 group-hover:w-12 transition-all" />
              04. External Nodes
            </h2>
            <p className="text-lg">
              Our service interacts exclusively with the official Atlassian API. We do not sell or share your data with any other third parties.
            </p>
          </section>
        </div>
      </main>
    </ThemeWrapper>
  );
}
