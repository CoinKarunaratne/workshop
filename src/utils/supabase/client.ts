// src/utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr"

type ClientOpts = { persistSession?: boolean }

export function createClient(opts: ClientOpts = {}) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // default true; pass false for non-persistent (clears on refresh)
        persistSession: opts.persistSession ?? true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  )
}
