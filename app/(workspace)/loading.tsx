import React from "react";

export default function WorkspaceLoading() {
  return <main className="container py-7 sm:py-10" aria-busy="true" aria-label="Loading household workspace"><section className="h-56 animate-pulse border border-ink bg-ink shadow-tactile"><div className="m-6 h-5 w-32 bg-canvas/25" /><div className="mx-6 mt-8 h-12 max-w-xl bg-canvas/25 sm:h-16" /><div className="mx-6 mt-3 h-4 max-w-md bg-canvas/15" /></section><section className="mt-5 grid gap-3 sm:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className={index % 2 ? "h-36 animate-pulse border border-ink bg-ink" : "h-36 animate-pulse border border-line bg-soft"} />)}</section><section className="mt-5 grid gap-4 lg:grid-cols-2"><div className="h-80 animate-pulse border border-ink bg-surface shadow-tactile-sm" /><div className="h-80 animate-pulse border border-ink bg-soft shadow-tactile-sm" /></section><span className="sr-only">Loading your household data</span></main>;
}
