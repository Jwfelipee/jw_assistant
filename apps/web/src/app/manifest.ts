import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Assistente S-140",
    short_name: "S-140",
    description:
      "Programação da reunião do meio de semana — designações S-140",
    start_url: "/",
    display: "standalone",
    background_color: "#e8ecf0",
    theme_color: "#2f6b62",
    orientation: "portrait-primary",
    lang: "pt-BR",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
