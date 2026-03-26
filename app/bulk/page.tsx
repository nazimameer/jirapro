export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth";
import { getProjects, getUsers, getStatuses, getBoards } from "@/actions/jira";
import { getTemplates } from "@/actions/templates";
import { redirect } from "next/navigation";
import BulkCreateForm from "@/components/BulkCreateForm";
import ThemeWrapper from "@/components/ThemeWrapper";
import Navbar from "@/components/Navbar";

export default async function BulkPage() {
  await requireAuth();

  // Fetch data in parallel for the form
  const [projectsRes, usersRes, statusesRes, templatesRes, boardsRes] = await Promise.all([
    getProjects(),
    getUsers(),
    getStatuses(),
    getTemplates(),
    getBoards()
  ]);

  if (projectsRes.error?.status === 403) {
    redirect("/select-site");
  }

  return (
    <ThemeWrapper>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <BulkCreateForm 
          projects={Array.isArray(projectsRes.data) ? projectsRes.data : projectsRes.data?.values || []}
          users={(usersRes.data as any[]) || []}
          statuses={(statusesRes.data as any[]) || []}
          initialTemplates={(templatesRes.data as any[]) || []}
          boards={boardsRes.data?.values || []}
        />
      </main>
    </ThemeWrapper>
  );
}
