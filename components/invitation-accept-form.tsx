"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { acceptHouseholdInvitation, initialModuleActionState } from "@/app/(workspace)/module-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InvitationAcceptForm() {
  const [state, formAction, pending] = useActionState(acceptHouseholdInvitation, initialModuleActionState);
  const router = useRouter();
  useEffect(() => { if (state.status === "success") router.refresh(); }, [router, state.status]);
  return <form action={formAction} className="mt-6 grid gap-3"><label className="grid gap-1"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">One-time invitation code</span><Input name="code" autoComplete="off" required /></label>{state.status !== "idle" ? <p role="status" className={state.status === "error" ? "text-sm font-medium text-error" : "text-sm font-medium text-ink"}>{state.message}</p> : null}<Button type="submit" size="touch" disabled={pending}>{pending ? "Joining workspace" : "Accept invitation"}</Button></form>;
}
