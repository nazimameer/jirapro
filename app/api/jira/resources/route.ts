import { getAccessibleResourcesForCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const resources = await getAccessibleResourcesForCurrentUser();
    return NextResponse.json(resources);
  } catch (error: any) {
    console.error("Failed to fetch resources:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
