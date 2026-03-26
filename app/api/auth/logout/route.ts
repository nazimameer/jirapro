import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Session from "@/models/Session";

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (sessionId) {
    await connectDB();
    await Session.deleteOne({ sessionId });
    cookieStore.delete("session_id");
  }

  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
