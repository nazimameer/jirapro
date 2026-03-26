export const dynamic = "force-dynamic";

import { requireAuth, getAccessibleResourcesForCurrentUser } from "@/lib/auth";
import SelectSiteClient from "@/components/SelectSiteClient";
import { redirect } from "next/navigation";

export default async function SelectSitePage() {
  await requireAuth();
  const resources = await getAccessibleResourcesForCurrentUser();
  
  if (!resources || resources.length === 0) {
    redirect("/dashboard");
  }

  return <SelectSiteClient resources={resources} />;
}
