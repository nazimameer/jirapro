import { requireAuth } from "@/lib/auth";
import { getProjects } from "@/actions/jira";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireAuth();
  const { data, error } = await getProjects();
  const projects = (data as any[]) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Jira Pro Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{user.email}</span>
            <Link 
              href="/api/auth/logout"
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-slate-800">Your Projects</h2>
          <Link 
            href="/bulk"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
          >
            Bulk Create Tasks
          </Link>
        </div>

        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p>Error loading projects: {error.message}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500">No projects found. Make sure you have access to Jira projects.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <div 
                key={project.id} 
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  {project.avatarUrls && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={project.avatarUrls["48x48"]} 
                      alt={project.name} 
                      className="w-12 h-12 rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900">{project.name}</h3>
                    <p className="text-sm text-slate-500">{project.key}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 uppercase">
                    {project.projectTypeKey}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
