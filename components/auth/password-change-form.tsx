"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword, type PasswordChangeState } from "@/app/(workspace)/account/security/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: PasswordChangeState = { status: "idle", message: "" };

export function PasswordChangeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(changePassword, initialState);
  useEffect(() => { if (state.status === "success") formRef.current?.reset(); }, [state.status]);

  return <form ref={formRef} action={formAction} className="space-y-4" noValidate><label className="block space-y-2" htmlFor="current-password"><span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Current password</span><Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required /></label><label className="block space-y-2" htmlFor="new-password"><span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted">New password</span><Input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={12} required /><span className="block text-xs leading-5 text-muted">Use at least 12 characters. Do not reuse a password from another service.</span></label><label className="block space-y-2" htmlFor="confirm-new-password"><span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Confirm new password</span><Input id="confirm-new-password" name="confirmation" type="password" autoComplete="new-password" minLength={12} required /></label><Button type="submit" size="touch" disabled={pending}>{pending ? "Updating password" : "Update password"}</Button>{state.status !== "idle" ? <p className={state.status === "error" ? "text-sm font-medium text-error" : "text-sm font-medium text-ink"} role="status">{state.message}</p> : null}</form>;
}
