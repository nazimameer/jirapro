import { requireAuth } from "@/lib/auth";
import { getProjects, getUsers, getStatuses } from "@/actions/jira";
import { getTemplates } from "@/actions/templates";
import BulkCreateForm from "@/components/BulkCreateForm";
import Link from "next/link";

export default async function BulkPage() {
  await requireAuth();

  // Fetch data in parallel for the form
  const [projectsRes, usersRes, statusesRes, templatesRes] = await Promise.all([
    getProjects(),
    getUsers(),
    getStatuses(),
    getTemplates()
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-700">
              ← Dashboard
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Bulk Task Creator</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BulkCreateForm 
          projects={(projectsRes.data as any[]) || []}
          users={(usersRes.data as any[]) || []}
          statuses={(statusesRes.data as any[]) || []}
          initialTemplates={(templatesRes.data as any[]) || []}
        />
      </main>
    </div>
  );
}
