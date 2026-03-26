import { exchangeCodeForToken, getAtlassianMe, createSession, getAccessibleResources } from "@/lib/auth";
import connectDB from "@/lib/db";
import { trackOAuthFailure, trackOAuthSuccess } from "@/lib/monitoring";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    trackOAuthFailure({ reason: "provider_error_param", error });
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code) {
    trackOAuthFailure({ reason: "missing_oauth_code" });
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
    
    // 4. Determine cloudId and redirection
    let cloudId = null;
    let redirectUrl = "/";

    if (resources.length === 1) {
      cloudId = resources[0].id;
    } else if (resources.length > 1) {
      redirectUrl = "/select-site";
    } else {
      throw new Error("No accessible Jira resources found. Please ensure you have at least one Jira site.");
    }

    // 5. Upsert user in MongoDB
    const user = await User.findOneAndUpdate(
      { accountId: atlassianUser.account_id },
      {
        email: atlassianUser.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        cloudId: cloudId, // Cache the cloudId if auto-selected
      },
      { upsert: true, new: true }
    );

    // 6. Create session
    await createSession(user.accountId);

    trackOAuthSuccess({
      accountId: atlassianUser.account_id,
      hasCloudId: !!cloudId,
      resourcesCount: resources.length,
      redirectUrl,
    });

    // 7. Redirect
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (err: any) {
    console.error("Auth callback error:", err);
    trackOAuthFailure({
      reason: "callback_exception",
      message: err?.message,
      status: err?.status,
    });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
