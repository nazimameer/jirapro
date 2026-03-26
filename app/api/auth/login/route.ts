import { getAtlassianAuthUrl } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = await getAtlassianAuthUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Login redirect error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
