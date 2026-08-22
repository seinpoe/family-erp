import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: { default: "Hearthline — Family ERP", template: "%s — Hearthline" },
  description: "A private, secure operational workspace for household records, schedules, documents, finances, assets, and reminders.",
  applicationName: "Hearthline",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Hearthline" },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, themeColor: "#1877F2" };
const themeBootstrap = "try{var p=new URLSearchParams(location.search).get('theme');var s=localStorage.getItem('hearthline-theme');var t=p==='light'||p==='dark'?p:s==='light'||s==='dark'?s:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;localStorage.setItem('hearthline-theme',t)}catch(e){}";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head><body><PwaRegister />{children}</body></html>;
}
