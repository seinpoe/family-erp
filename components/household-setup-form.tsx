"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createHouseholdWorkspace, type HouseholdSetupState } from "@/app/(workspace)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: HouseholdSetupState = { status: "idle", message: "" };

export function HouseholdSetupForm() {
  const [state, formAction, pending] = useActionState(createHouseholdWorkspace, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <form action={formAction} className="mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
      <label className="space-y-1"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.13em] text-muted">Household name</span><Input name="name" placeholder="The Lin Family" required /></label>
      <label className="space-y-1"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.13em] text-muted">Workspace slug</span><Input name="slug" placeholder="lin-family" pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></label>
      <label className="space-y-1"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.13em] text-muted">Timezone</span><Input name="timezone" defaultValue="UTC" required /></label>
      <label className="space-y-1"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.13em] text-muted">Base currency</span><Input name="baseCurrency" defaultValue="USD" maxLength={3} required /></label>
      <div className="sm:col-span-2"><Button type="submit" size="touch" disabled={pending}>{pending ? "Creating workspace" : "Create household workspace"}</Button>{state.status !== "idle" ? <p className={state.status === "error" ? "mt-3 text-sm font-medium text-error" : "mt-3 text-sm font-medium text-ink"} role="status">{state.message}</p> : null}</div>
    </form>
  );
}
