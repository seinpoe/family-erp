"use client";

import { useActionState } from "react";
import { requestMagicLink, type LoginState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: LoginState = { status: "idle", message: "" };

export function MagicLinkForm({ nextPath = "/dashboard" }: Readonly<{ nextPath?: string }>) {
  const [state, formAction, pending] = useActionState(requestMagicLink, initialState);
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input name="next" type="hidden" value={nextPath} />
      <label className="block space-y-2" htmlFor="email">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Email address</span>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </label>
      <Button className="w-full" size="touch" type="submit" disabled={pending}>{pending ? "Sending secure link" : "Send secure sign-in link"}</Button>
      {state.status !== "idle" ? <p className={state.status === "error" ? "text-sm font-medium text-error" : "text-sm font-medium text-ink"} role="status">{state.message}</p> : null}
    </form>
  );
}
