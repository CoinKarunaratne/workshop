import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function updateSession(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // write onto the response so the browser receives updated tokens
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Revalidate session (don’t trust raw cookies)
  const { data, error } = await supabase.auth.getUser();
  const user = error ? null : data.user;

  return { res, user };
}
