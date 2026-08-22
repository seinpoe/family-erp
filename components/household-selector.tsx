"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { chooseActiveHousehold, type HouseholdSwitchState } from "@/app/(workspace)/dashboard/actions";
import type { HouseholdOption } from "@/lib/dashboard/summary";
import { Button } from "@/components/ui/button";

const initialState: HouseholdSwitchState = { status: "idle", message: "" };

export function HouseholdSelector({ households, activeHouseholdId }: { households: HouseholdOption[]; activeHouseholdId?: string }) {
  const [state, formAction, pending] = useActionState(chooseActiveHousehold, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  if (households.length < 2) return null;
  return (
    <section className="mb-5 border border-line bg-surface p-3 shadow-tactile-sm" aria-label="Active household">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Active household</p>
      <form action={formAction} className="mt-2 flex flex-wrap gap-2">
        {households.map((household) => <Button key={household.id} type="submit" name="householdId" value={household.id} variant={household.id === activeHouseholdId ? "solid" : "outline"} size="compact" disabled={pending}>{household.name}</Button>)}
      </form>
      {state.status !== "idle" ? <p className={state.status === "error" ? "mt-3 text-sm font-medium text-error" : "mt-3 text-sm font-medium text-ink"} role="status">{state.message}</p> : null}
    </section>
  );
}
