// src/lib/supabase.ts
// 懶載入的 Supabase client。只有在 .env.local 有填 URL + anon key 時才建立。
// 沒填就回傳 null，storage.ts 會自動改用 localStorage。

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseEnabled = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseEnabled) return null;
  if (!client) {
    client = createClient(url as string, anonKey as string);
  }
  return client;
}
