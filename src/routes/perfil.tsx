import { createFileRoute } from "@tanstack/react-router";
import { LeveApp } from "@/components/leve-app";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "O teu perfil — LEVE" },
      { name: "description", content: "As tuas publicações no LEVE." },
      { property: "og:title", content: "O teu perfil — LEVE" },
      {
        property: "og:description",
        content: "As tuas publicações no LEVE.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LeveApp section="profile" />,
});
