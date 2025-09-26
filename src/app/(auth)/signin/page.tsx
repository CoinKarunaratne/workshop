"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FormMessage } from "@/components/form/form-message";
import { toast } from "sonner";
import { GoogleMark } from "@/components/icons/google-mark";
import { signInWithPassword } from "./actions"; // <-- server action

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInPage() {
  // ---- state (unchanged) ----
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/app";
  // ---------------------------

  // UI-only field errors
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const supabase = createClient(); // still available for future OAuth button
  const [pending, startTransition] = useTransition();

  const validate = () => {
    let ok = true;
    if (!EMAIL_RE.test(email)) {
      setEmailErr("Enter a valid email address.");
      ok = false;
    } else setEmailErr(null);

    if (!password) {
      setPwdErr("Password is required.");
      ok = false;
    } else setPwdErr(null);

    return ok;
  };

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 font-semibold">
          <span aria-hidden className="inline-block size-6 rounded bg-primary" />
          WrenchFlow
        </div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to manage jobs, customers, and invoices.
        </p>
      </div>

      {/* CHANGED: use a Server Action via the form `action` prop */}
      <form
        action={(formData) => {
          setServerError(null);
          if (!validate()) return;

          // pass current values to the server action
          formData.set("email", email);
          formData.set("password", password);
          formData.set("redirectedFrom", redirectedFrom);

          setLoading(true);
          startTransition(async () => {
            const res = await signInWithPassword(null as any, formData);
            setLoading(false);

            if ((res as any)?.error) {
              const msg = String((res as any).error).toLowerCase();
              if (msg.includes("confirm")) {
                toast.info("Please confirm your email, then try signing in.");
              } else {
                toast.error("Invalid login");
              }
              setServerError((res as any).error);
              return;
            }

            // No client redirect here — the server action already redirected.
            toast.success("Signed in successfully");
          });
        }}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@garage.co.nz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => {
              if (!EMAIL_RE.test(email)) setEmailErr("Enter a valid email address.");
              else setEmailErr(null);
            }}
            aria-invalid={!!emailErr}
            aria-describedby={emailErr ? "email-error" : undefined}
            autoComplete="email"
            required
          />
          {emailErr ? (
            <FormMessage id="email-error"> {emailErr} </FormMessage>
          ) : (
            <FormMessage type="hint">Use your business email if possible.</FormMessage>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPwdErr(password ? null : "Password is required.")}
            aria-invalid={!!pwdErr}
            aria-describedby={pwdErr ? "password-error" : undefined}
            autoComplete="current-password"
            required
          />
          {pwdErr ? (
            <FormMessage id="password-error"> {pwdErr} </FormMessage>
          ) : (
            <FormMessage type="hint">Minimum 8 characters recommended.</FormMessage>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(v) => setRemember(Boolean(v))}
            />{" "}
            <span>Remember me</span>
          </label>
          <Link
            href="#"
            className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>

        {serverError && <FormMessage>{serverError}</FormMessage>}

        <Button type="submit" className="w-full" disabled={loading || pending}>
          {loading || pending ? "Signing in..." : "Sign in"}
        </Button>

        {/* Divider + Google */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={async () => {
            // Wire later to /callback:
            // const supabase = createClient({ persistSession: remember })
            // await supabase.auth.signInWithOAuth({
            //   provider: "google",
            //   options: { redirectTo: `${location.origin}/callback` },
            // })
          }}
        >
          <GoogleMark className="mr-2 size-4" />
          Continue with Google
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline underline-offset-2 hover:text-foreground">
          Start free
        </Link>
      </p>
    </div>
  );
}
