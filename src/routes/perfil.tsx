import { createFileRoute } from "@tanstack/react-router";
import { LeveApp } from "@/components/leve-app";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil de Amara — LEVE" }, { name: "description", content: "Perfil criativo de Amara Costa no protótipo social LEVE." }, { property: "og:title", content: "Perfil de Amara — LEVE" }, { property: "og:description", content: "Perfil criativo de Amara Costa no protótipo social LEVE." }, { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <LeveApp section="profile" />,
});