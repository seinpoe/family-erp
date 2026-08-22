import { InvitationAcceptForm } from "@/components/invitation-accept-form";

export default function InvitePage() {
  return <main className="container py-8 sm:py-12"><section className="mx-auto max-w-xl border border-ink bg-surface p-5 shadow-tactile sm:p-7"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted">Private household access</p><h1 className="mt-3 text-4xl font-black uppercase leading-[0.88] tracking-[-0.07em]">Join a workspace.</h1><p className="mt-4 text-sm leading-6 text-muted">Paste the one-time invitation code shared with you through a private channel. Your signed-in email must match the invited email.</p><InvitationAcceptForm /></section></main>;
}
