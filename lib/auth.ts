import dbConnect from "./db";
import User from "@/models/User";
import Session from "@/models/Session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import axios from "axios";

const ATLASSIAN_AUTH_URL = "https://auth.atlassian.com/authorize";
const ATLASSIAN_TOKEN_URL = "https://auth.atlassian.com/oauth/token";

export async function getAtlassianAuthUrl() {
  const params = new URLSearchParams({
    audience: "api.atlassian.com",
    client_id: process.env.ATLASSIAN_CLIENT_ID!,
    scope: "read:me offline_access read:jira-work write:jira-work",
    redirect_uri: process.env.ATLASSIAN_CALLBACK_URL!,
    response_type: "code",
    prompt: "select_account",
    state: "random_state_string",
  });

  return `${ATLASSIAN_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string) {
  const response = await axios.post(ATLASSIAN_TOKEN_URL, {
    grant_type: "authorization_code",
    client_id: process.env.ATLASSIAN_CLIENT_ID,
    client_secret: process.env.ATLASSIAN_CLIENT_SECRET,
    code,
    redirect_uri: process.env.ATLASSIAN_CALLBACK_URL,
  });

  return response.data;
}

export async function getAtlassianMe(accessToken: string) {
  const response = await axios.get("https://api.atlassian.com/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  return response.data;
}

export async function getAccessibleResources(accessToken: string) {
  const response = await axios.get("https://api.atlassian.com/oauth/token/accessible-resources", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}

export async function createSession(userAccountId: string) {
  await dbConnect();
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await Session.create({
    sessionId,
    userAccountId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return sessionId;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  if (!sessionId) return null;

  await dbConnect();
  const session = await Session.findOne({ sessionId });
  if (!session || session.expiresAt < new Date()) return null;

  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await User.findOne({ accountId: session.userAccountId });
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/api/auth/login");
  }
  return user;
}
