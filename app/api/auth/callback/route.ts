import { exchangeCodeForToken, getAtlassianMe, createSession, getAccessibleResources } from "@/lib/auth";
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

    // 3. Get accessible resources (to get cloudId)
    const resources = await getAccessibleResources(tokens.access_token);
    const cloudId = resources[0]?.id;

    // 4. Upsert user in MongoDB
    const user = await User.findOneAndUpdate(
      { accountId: atlassianUser.account_id },
      {
        email: atlassianUser.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        cloudId: cloudId, // Cache the cloudId
      },
      { upsert: true, new: true }
    );

    // 5. Create session
    await createSession(user.accountId);

    // 6. Redirect to home or dashboard
    return NextResponse.redirect(new URL("/", request.url));
  } catch (err: any) {
    console.error("Auth callback error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
