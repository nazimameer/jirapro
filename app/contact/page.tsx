import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      
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

      <main className="max-w-4xl mx-auto px-6 py-20 relative flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-8">
           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
           </svg>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-center">Get in touch.</h1>
        <p className="text-xl text-slate-400 text-center max-w-xl mb-12">
          Have questions about security, enterprise plans, or custom features? Our mission control is ready to help.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          <a href="mailto:support@jirapro.io" className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
            <span className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Technical Support</span>
            <span className="text-xl font-bold block mb-1">support@jirapro.io</span>
            <span className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">Response within 12 Earth hours.</span>
          </a>
          
          <a href="https://twitter.com/jirapro" target="_blank" className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
            <span className="block text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-2">Community</span>
            <span className="text-xl font-bold block mb-1">@jirapro_app</span>
            <span className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">Join the conversation.</span>
          </a>
        </div>
      </main>
    </div>
  );
}
