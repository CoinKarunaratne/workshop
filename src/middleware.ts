// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

export async function middleware(req: NextRequest) {
  const { res, user } = await updateSession(req)
  const { pathname, origin, search } = req.nextUrl

  // If logged-in and on "/", send to /app
  if (pathname === "/" && user) {
    return NextResponse.redirect(new URL("/app", origin))
  }

  // If guest and visiting /app/*, send to /signin
  if (pathname.startsWith("/app") && !user) {
    const url = new URL("/signin", origin)
    url.searchParams.set("redirectedFrom", pathname + (search || ""))
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: ["/", "/app/:path*"], // run on landing + all app routes
}
