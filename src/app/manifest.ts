import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const basePath = process.env.GITHUB_ACTIONS === "true" ? "/dieta-super" : "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DietaSuper UK",
    short_name: "DietaSuper",
    description:
      "Compara precios y calorías entre Aldi, Lidl, Asda y Morrisons UK y optimiza la compra semanal en pareja.",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    lang: "es",
    theme_color: "#059669",
    background_color: "#f8fafc",
    categories: ["food", "shopping", "health"],
    icons: [
      {
        src: `${basePath}/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
