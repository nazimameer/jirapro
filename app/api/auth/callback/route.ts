import { exchangeCodeForToken, getAtlassianMe, createSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    await connectDB();

    // 1. Exchange code for tokens
    const tokens = await exchangeCodeForToken(code);

    // 2. Get user info from Atlassian
    const atlassianUser = await getAtlassianMe(tokens.access_token);

    // 3. Upsert user in MongoDB
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    
    const user = await User.findOneAndUpdate(
      { accountId: atlassianUser.account_id },
      {
        email: atlassianUser.email,
        tokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: expiresAt,
        },
      },
      { upsert: true, new: true }
    );

    // 4. Create session
    await createSession(user.accountId);

    // 5. Redirect to home or dashboard
    return NextResponse.redirect(new URL("/", request.url));
  } catch (err: any) {
    console.error("Auth callback error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
