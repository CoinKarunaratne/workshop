"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signInWithPassword(prevState: any, formData: FormData) {
  // calling cookies() opts this request out of caching (per Supabase docs)
  void cookies();

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const redirectedFrom = String(formData.get("redirectedFrom") || "/app");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // cookies are set by the server client; safe to redirect now
  redirect(redirectedFrom);
}
