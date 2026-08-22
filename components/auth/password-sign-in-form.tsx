"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithPassword, type PasswordLoginState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: PasswordLoginState = { status: "idle", message: "" };

export function PasswordSignInForm({ nextPath }: Readonly<{ nextPath: string }>) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signInWithPassword, initialState);

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) router.replace(state.redirectTo);
  }, [router, state.redirectTo, state.status]);

  return <form action={formAction} className="space-y-4" noValidate><input name="next" type="hidden" value={nextPath} /><label className="block space-y-2" htmlFor="password-email"><span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Email address</span><Input id="password-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label><label className="block space-y-2" htmlFor="password"><span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Password</span><Input id="password" name="password" type="password" autoComplete="current-password" required /></label><Button className="w-full" size="touch" type="submit" disabled={pending}>{pending ? "Signing in" : "Sign in with password"}</Button>{state.status !== "idle" ? <p className={state.status === "error" ? "text-sm font-medium text-error" : "text-sm font-medium text-ink"} role="status">{state.message}</p> : null}</form>;
}
