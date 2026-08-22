import Link from "next/link";
import { KeyRound, LogOut } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { MobileWorkspaceNav } from "@/components/mobile-workspace-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/(workspace)/actions";

export default function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen"><header className="sticky top-0 z-20 border-b border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4"><BrandMark /><div className="flex items-center gap-2"><Link href="/dashboard" className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted hover:text-brand sm:inline">Workspace</Link><ThemeToggle className="sm:hidden" /><Link href="/account/security" className="inline-flex size-9 items-center justify-center border border-line bg-surface text-ink transition-transform duration-150 hover:text-brand active:scale-[0.97]" aria-label="Password security"><KeyRound className="size-4" /></Link><form action={signOut}><Button variant="outline" size="compact" type="submit" className="hidden sm:inline-flex">Sign out</Button></form><form action={signOut} className="sm:hidden"><Button variant="outline" size="compact" type="submit" aria-label="Sign out" className="grid size-9 place-items-center p-0"><LogOut className="size-4" /></Button></form></div></div></header>{children}<MobileWorkspaceNav /></div>;
}
