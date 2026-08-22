"use client";

import Link from "next/link";
import { CalendarDays, House, Landmark, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { isMobileWorkspaceNavigationActive, mobileWorkspaceNavigation } from "@/lib/navigation/workspace";

const icons = { house: House, landmark: Landmark, calendar: CalendarDays, menu: Menu };

export function MobileWorkspaceNav() {
  const pathname = usePathname();
  return <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur sm:hidden" aria-label="Primary workspace navigation"><div className="mx-auto grid max-w-lg grid-cols-4">{mobileWorkspaceNavigation.map((item) => { const Icon = icons[item.icon]; const active = isMobileWorkspaceNavigationActive(pathname, item.href); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={active ? "flex min-h-14 flex-col items-center justify-center gap-1 text-brand" : "flex min-h-14 flex-col items-center justify-center gap-1 text-muted transition hover:text-brand"}><span className={active ? "grid size-7 place-items-center bg-brand text-white" : "grid size-7 place-items-center"}><Icon className="size-4" aria-hidden="true" /></span><span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em]">{item.label}</span></Link>; })}</div></nav>;
}
