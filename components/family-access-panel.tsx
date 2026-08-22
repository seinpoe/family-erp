"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createInvitation, initialModuleActionState, updateMemberRole } from "@/app/(workspace)/module-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type HouseholdMemberView = { user_id: string; role: "owner" | "adult" | "limited" };

export function FamilyAccessPanel({ members, actorRole }: { members: HouseholdMemberView[]; actorRole: "owner" | "adult" | "limited" }) {
  if (actorRole !== "owner") return null;
  return <section className="mt-5 grid gap-5 lg:grid-cols-2"><InviteForm /><MemberRoleList members={members} /></section>;
}

function InviteForm() {
  const [state, formAction, pending] = useActionState(createInvitation, initialModuleActionState);
  return <div className="border border-line bg-soft p-4 shadow-tactile-sm"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Owner control</p><h2 className="mt-1 text-xl font-black uppercase tracking-[-0.05em]">Invite member</h2><form action={formAction} className="mt-4 grid gap-3"><label className="grid gap-1"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Email</span><Input name="email" type="email" required /></label><div className="grid grid-cols-2 gap-3"><label className="grid gap-1"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Role</span><select name="role" className="h-11 border border-line bg-canvas px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"><option value="adult">Adult</option><option value="limited">Limited</option></select></label><label className="grid gap-1"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Expires days</span><Input name="expiresInDays" type="number" min="1" max="30" defaultValue="7" required /></label></div><Button type="submit" size="touch" disabled={pending}>{pending ? "Creating" : "Create private invitation"}</Button></form>{state.status !== "idle" ? <p role="status" className={state.status === "error" ? "mt-3 text-sm font-medium text-error" : "mt-3 text-sm font-medium text-ink"}>{state.message}{state.shareCode ? <code className="mt-2 block select-all border border-line bg-canvas p-2 text-xs text-ink">{state.shareCode}</code> : null}</p> : null}</div>;
}

function MemberRoleList({ members }: { members: HouseholdMemberView[] }) {
  const [state, formAction, pending] = useActionState(updateMemberRole, initialModuleActionState);
  const router = useRouter();
  useEffect(() => { if (state.status === "success") router.refresh(); }, [router, state.status]);
  return <div className="border border-line bg-surface p-4 shadow-tactile-sm"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Owner control</p><h2 className="mt-1 text-xl font-black uppercase tracking-[-0.05em]">Member roles</h2><div className="mt-4 space-y-2">{members.map((member) => <form action={formAction} key={member.user_id} className="flex items-center gap-2 border-l-4 border-brand bg-canvas p-2"><input type="hidden" name="memberId" value={member.user_id} /><span className="min-w-0 flex-1 truncate font-mono text-[10px] text-muted">{member.user_id}</span>{member.role === "owner" ? <span className="font-mono text-[10px] font-bold uppercase text-ink">Owner</span> : <><select name="role" defaultValue={member.role} className="h-9 border border-line bg-surface px-2 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"><option value="adult">Adult</option><option value="limited">Limited</option></select><Button type="submit" size="compact" disabled={pending}>Save</Button></>}</form>)}</div>{state.status !== "idle" ? <p role="status" className={state.status === "error" ? "mt-3 text-sm font-medium text-error" : "mt-3 text-sm font-medium text-ink"}>{state.message}</p> : null}</div>;
}
