"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FormMessage } from "@/components/form/form-message";
import { toast } from "sonner";
import { GoogleMark } from "@/components/icons/google-mark";
import { createClient } from "@/utils/supabase/client";
import { signUpWithPassword } from "./actions"; // <-- server action

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpPage() {
  // ---- your logic (unchanged) ----
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/app";
  // --------------------------------

  // UI-only
  const [workshop, setWorkshop] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const [termsErr, setTermsErr] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  const supabase = createClient();
  const [pending, startTransition] = useTransition();

  const validate = () => {
    let ok = true;

    if (!EMAIL_RE.test(email)) {
      setEmailErr("Enter a valid email address.");
      ok = false;
    } else setEmailErr(null);

    if (password.length < 8) {
      setPwdErr("Use at least 8 characters.");
      ok = false;
    } else setPwdErr(null);

    if (!accepted) {
      setTermsErr("You must agree to continue.");
      ok = false;
    } else setTermsErr(null);

    return ok;
  };

  // NOTE: UI remains unchanged; only the form action is switched to the server action
  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 font-semibold">
          <span aria-hidden className="inline-block size-6 rounded bg-primary" />
          WrenchFlow
        </div>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          14-day free trial • No credit card required
        </p>
      </div>

      <form
        action={(formData) => {
          setServerError(null);
          if (!validate()) return;

          // pass current values to the server action
          formData.set("email", email);
          formData.set("password", password);
          formData.set("redirectedFrom", redirectedFrom);
          formData.set("workshop", workshop);

          setLoading(true);
          startTransition(async () => {
            const res = await signUpWithPassword(null as any, formData);
            setLoading(false);

            if ((res as any)?.error) {
              toast.error("Signup failed");
              setServerError(String((res as any).error));
              return;
            }

            // No client redirect: server action already redirected.
            // If email confirmation is enabled, they'll land on /signin?checkEmail=1
            toast.success("Account created successfully");
          });
        }}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor="workshop">Workshop name</Label>
          <Input
            id="workshop"
            placeholder="RotorLab Auto"
            value={workshop}
            onChange={(e) => setWorkshop(e.target.value)}
          />
          <FormMessage type="hint">You can change this later in Settings.</FormMessage>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="owner@rotorlab.nz"
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
            onBlur={() => setPwdErr(password.length < 8 ? "Use at least 8 characters." : null)}
            aria-invalid={!!pwdErr}
            aria-describedby={pwdErr ? "password-error" : undefined}
            autoComplete="new-password"
            required
          />
          {pwdErr ? (
            <FormMessage id="password-error"> {pwdErr} </FormMessage>
          ) : (
            <FormMessage type="hint">At least 8 characters.</FormMessage>
          )}
        </div>

        <div className="space-y-1">
          <label className="flex items-start gap-2 text-sm leading-tight">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(v) => {
                const next = Boolean(v);
                setAccepted(next);
                setTermsErr(next ? null : termsErr);
              }}
              aria-invalid={!!termsErr}
              aria-describedby={termsErr ? "terms-error" : undefined}
              required
            />
            <span>
              I agree to the{" "}
              <a className="underline underline-offset-2" href="#">
                Terms
              </a>{" "}
              and{" "}
              <a className="underline underline-offset-2" href="#">
                Privacy
              </a>
              .
            </span>
          </label>
          {termsErr && <FormMessage id="terms-error">{termsErr}</FormMessage>}
        </div>

        {serverError && <FormMessage>{serverError}</FormMessage>}

        <Button type="submit" className="w-full" disabled={loading || pending}>
          {loading || pending ? "Signing up..." : "Sign up"}
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
            // Wire later when you set up /callback (same as signin flow):
            // const supabase = createClient()
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
        Already have an account?{" "}
        <Link href="/signin" className="underline underline-offset-2 hover:text-foreground">
          Sign in
        </Link>
      </p>
    </div>
  );
}
