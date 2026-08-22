"use client";

import { useEffect, useState } from "react";

export function WorkspaceLoadingState() {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDelayed(true), 4500);
    return () => window.clearTimeout(timer);
  }, []);

  return <><section className="border border-line bg-surface p-5 shadow-tactile-sm sm:p-7"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-brand">Secure workspace</p><div className="mt-4 h-8 w-56 max-w-full animate-pulse bg-soft sm:h-10" /><div className="mt-3 h-4 w-full max-w-md animate-pulse bg-soft" /><p className="mt-5 text-sm leading-6 text-muted" aria-live="polite">{delayed ? "This is taking longer than usual. Your data is still protected; refresh the page if it does not continue." : "Loading your household summary securely."}</p>{delayed ? <button type="button" onClick={() => window.location.reload()} className="mt-4 min-h-11 border border-brand bg-brand px-4 text-sm font-bold text-white transition active:scale-[0.97]">Refresh workspace</button> : null}</section><section className="mt-4 grid gap-3 sm:grid-cols-3" aria-hidden="true"><div className="h-24 animate-pulse border border-line bg-surface" /><div className="h-24 animate-pulse border border-line bg-surface" /><div className="h-24 animate-pulse border border-line bg-surface" /></section></>;
}
