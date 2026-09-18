import { getSupabaseAdmin } from "./_core/supabase";
import { ENV } from "./_core/env";

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseAdmin();
  const key = normalizeKey(relKey);
  const body =
    typeof data === "string" ? Buffer.from(data) : Buffer.from(data as Uint8Array);

  const { error } = await supabase.storage
    .from(ENV.supabaseStorageBucket)
    .upload(key, body, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: publicData } = supabase.storage
    .from(ENV.supabaseStorageBucket)
    .getPublicUrl(key);

  return { key, url: publicData.publicUrl };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseAdmin();
  const key = normalizeKey(relKey);
  const { data } = supabase.storage.from(ENV.supabaseStorageBucket).getPublicUrl(key);
  return { key, url: data.publicUrl };
}
