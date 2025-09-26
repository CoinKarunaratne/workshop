"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signUpWithPassword(_prevState: unknown, formData: FormData) {
  // Ensure this request is uncached and cookies are available
  void cookies();

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const redirectedFrom = String(formData.get("redirectedFrom") || "/app");
  // Optional extra fields you might collect:
  // const workshop = String(formData.get("workshop") || "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is DISABLED, session is set immediately
  if (data.session) {
    redirect(redirectedFrom);
  }

  // If email confirmation is ENABLED, no session yet — send user to sign-in with a hint
  redirect("/signin?checkEmail=1");
}
