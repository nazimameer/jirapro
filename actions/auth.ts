"use server";

import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function setSelectedSite(cloudId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await dbConnect();
    await User.findOneAndUpdate(
      { accountId: user.accountId },
      { cloudId }
    );

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to set selected site:", error);
    return { success: false, error: error.message };
  }
}
