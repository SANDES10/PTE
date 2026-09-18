import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

let adminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!adminClient) {
    if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
      throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }
    adminClient = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

export async function verifySupabaseAccessToken(
  accessToken: string
): Promise<any | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await (supabase.auth as any).getUser(accessToken);
  if (error || !data.user) {
    console.warn("[Auth] Invalid Supabase token:", error?.message);
    return null;
  }
  return data.user;
}

export function mapSupabaseUserToProfile(user: any) {
  const provider = user.app_metadata?.provider ?? user.identities?.[0]?.provider;
  return {
    openId: user.id,
    email: user.email ?? null,
    name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      null,
    loginMethod: provider ?? "email",
  };
}
