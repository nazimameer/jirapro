"use server";

import dbConnect from "@/lib/db";
import Template from "@/models/Template";
import { getSession } from "@/lib/auth";
import { TemplateSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

async function handleAction<T>(action: () => Promise<T>) {
  try {
    await dbConnect();
    const result = await action();
    return { data: JSON.parse(JSON.stringify(result)), error: null };
  } catch (error: any) {
    console.error("Template Action Error:", error);
    return { data: null, error: { message: error.message || "An unexpected error occurred" } };
  }
}

export async function getTemplates() {
  return handleAction(async () => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    return Template.find({ userAccountId: session.userAccountId }).sort({ updatedAt: -1 });
  });
}

export async function saveTemplate(payload: any) {
  return handleAction(async () => {
    const validated = TemplateSchema.parse(payload);
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const templateData = {
      ...validated,
      userAccountId: session.userAccountId,
    };

    let template;
    if (validated.templateId) {
      template = await Template.findOneAndUpdate(
        { _id: validated.templateId, userAccountId: session.userAccountId },
        templateData,
        { new: true }
      );
    } else {
      template = await Template.create(templateData);
    }

    revalidatePath("/bulk");
    return template;
  });
}

export async function deleteTemplate(id: string) {
  return handleAction(async () => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    await Template.findOneAndDelete({ _id: id, userAccountId: session.userAccountId });
    revalidatePath("/bulk");
    return { success: true };
  });
}
