export const mobileWorkspaceNavigation = [
  { href: "/dashboard", label: "Home", icon: "house" },
  { href: "/finance", label: "Money", icon: "landmark" },
  { href: "/schedule", label: "Plan", icon: "calendar" },
  { href: "/family", label: "Family", icon: "menu" },
] as const;

export function isMobileWorkspaceNavigationActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}
