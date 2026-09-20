import { createFileRoute } from "@tanstack/react-router";
import { LeveApp } from "@/components/leve-app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Feed — LEVE" },
      { name: "description", content: "Descubra criadores, imagens e ideias no protótipo social LEVE." },
      { property: "og:title", content: "Feed — LEVE" },
      { property: "og:description", content: "Descubra criadores, imagens e ideias no protótipo social LEVE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LeveApp section="feed" />,
});
