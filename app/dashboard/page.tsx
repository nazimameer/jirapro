import { requireAuth } from "@/lib/auth";
import { getProjects } from "@/actions/jira";
import Link from "next/link";
import ThemeWrapper from "@/components/ThemeWrapper";
import Navbar from "@/components/Navbar";

export default async function DashboardPage() {
  const user = await requireAuth();
  const { data, error } = await getProjects();
  const projects = (data as any[]) || [];

  return (
    <ThemeWrapper>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-2">Projects</h2>
            <p className="text-slate-400 font-medium">Select a project to start bulk creating tasks.</p>
          </div>
          <Link 
            href="/bulk"
            className="px-6 py-3 bg-white text-black rounded-full hover:bg-slate-200 transition-all font-black shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2"
          >
            Bulk Create Tasks
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>

        {error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl backdrop-blur-md">
            <p className="font-bold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Error loading projects: {error.message}
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            </div>
            <p className="text-slate-400 font-medium">No projects found. Make sure you have access to Jira projects.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <div 
                key={project.id} 
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-5 mb-6">
                  {project.avatarUrls && (
                    <img 
                      src={project.avatarUrls["48x48"]} 
                      alt={project.name} 
                      className="w-14 h-14 rounded-2xl shadow-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-xl text-white group-hover:text-indigo-400 transition-colors">{project.name}</h3>
                    <p className="text-sm font-bold text-slate-500 tracking-wider uppercase">{project.key}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-white/5 text-slate-400 border border-white/10 uppercase tracking-widest">
                    {project.projectTypeKey}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ThemeWrapper>
  );
}
