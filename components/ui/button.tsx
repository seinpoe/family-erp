import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "quiet";
  size?: "default" | "compact" | "touch";
};

export function Button({ className, variant = "solid", size = "default", ...props }: ButtonProps) {
  const variants = {
    solid: "bg-ink text-canvas border-ink hover:bg-black",
    outline: "bg-transparent text-ink border-ink hover:bg-soft",
    quiet: "bg-transparent text-ink border-transparent hover:bg-soft",
  };
  const sizes = { compact: "min-h-9 px-3 text-xs", default: "min-h-11 px-4 text-sm", touch: "min-h-12 px-5 text-sm" };

  return (
    <button
      className={cn("inline-flex items-center justify-center border font-semibold uppercase tracking-[0.12em] transition duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2", variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
