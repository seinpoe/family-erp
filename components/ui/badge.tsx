import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center border border-line bg-soft px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink", className)} {...props} />;
}
