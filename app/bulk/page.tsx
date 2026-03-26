import { requireAuth } from "@/lib/auth";
import { getProjects, getUsers, getStatuses } from "@/actions/jira";
import { getTemplates } from "@/actions/templates";
import BulkCreateForm from "@/components/BulkCreateForm";
import ThemeWrapper from "@/components/ThemeWrapper";
import Navbar from "@/components/Navbar";

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
    <ThemeWrapper>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <BulkCreateForm 
          projects={(projectsRes.data as any[]) || []}
          users={(usersRes.data as any[]) || []}
          statuses={(statusesRes.data as any[]) || []}
          initialTemplates={(templatesRes.data as any[]) || []}
        />
      </main>
    </ThemeWrapper>
  );
}
