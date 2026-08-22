import { Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="grid size-9 place-items-center border border-ink bg-ink text-canvas shadow-tactile-sm" aria-hidden="true"><Layers3 className="size-4" strokeWidth={2.5} /></span>
      <span className="leading-none"><strong className="block text-sm font-black uppercase tracking-[-0.04em]">Hearthline</strong><span className="block pt-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Family ERP</span></span>
    </div>
  );
}
