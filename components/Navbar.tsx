import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">JiraPro</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8 ml-12">
          <Link href="/privacy" className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Privacy</Link>
          <Link href="/terms" className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Terms</Link>
          <Link href="/contact" className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <span className="hidden sm:inline text-xs font-bold text-slate-500 uppercase tracking-widest">{user.email}</span>
              <Link 
                href="/dashboard"
                className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all"
              >
                Dashboard
              </Link>
              <Link 
                href="/api/auth/logout"
                className="text-xs font-bold text-red-400/70 hover:text-red-400 uppercase tracking-widest transition-colors"
                prefetch={false}
              >
                Logout
              </Link>
            </>
          ) : (
            <Link 
              href="/api/auth/login"
              className="px-5 py-2.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.864 13.911a3.02 3.02 0 11-3.02-3.02h3.02v3.02zm1.908-4.928a3.02 3.02 0 10-2.14-5.161L12.772.484a5.003 5.003 0 114.619 8.441l-4.619-4.881zm.001 5.485h-10.74l10.74 10.746V14.468zM24 10.871A5.042 5.042 0 0113.882 15.93l9.049-9.05a5.021 5.021 0 011.069 3.991z"/>
              </svg>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
