import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hearthline Family ERP",
    short_name: "Hearthline",
    description: "A private family operations workspace.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f8f8f8",
    theme_color: "#2e2e2e",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
