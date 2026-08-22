import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { PwaRegister } from "@/components/pwa-register";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: { default: "Hearthline — Family ERP", template: "%s — Hearthline" },
  description: "A private, secure operational workspace for household records, schedules, documents, finances, assets, and reminders.",
  applicationName: "Hearthline",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Hearthline" },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, themeColor: "#1877F2" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PwaRegister />{children}<ThemeToggle className="fixed bottom-4 right-4 z-50 hidden sm:flex" /></body></html>;
}
