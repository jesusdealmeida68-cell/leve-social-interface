import { createFileRoute } from "@tanstack/react-router";
import { LeveApp } from "@/components/leve-app";

export const Route = createFileRoute("/historia")({
  head: () => ({ meta: [{ title: "Histórias — LEVE" }, { name: "description", content: "Conteúdos temporários e histórias da comunidade LEVE." }, { property: "og:title", content: "Histórias — LEVE" }, { property: "og:description", content: "Conteúdos temporários e histórias da comunidade LEVE." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <LeveApp section="stories" />,
});