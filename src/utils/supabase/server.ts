import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies();
  const h = await headers(); // optional, helps behind proxies

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // IMPORTANT: supply both getAll and setAll so Supabase can read/write session cookies
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
      // optional: pass through proxy headers so refresh works reliably on Vercel/NGINX
      global: {
        headers: {
          "x-forwarded-host": h.get("x-forwarded-host") ?? h.get("host") ?? "",
          "x-forwarded-proto": h.get("x-forwarded-proto") ?? "https",
        },
      },
    }
  );
}
