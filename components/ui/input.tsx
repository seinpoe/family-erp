import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("min-h-12 w-full border border-line bg-canvas px-3 text-base text-ink outline-none transition placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-ink/20", className)} {...props} />;
}
