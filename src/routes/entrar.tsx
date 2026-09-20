import { createFileRoute } from "@tanstack/react-router";
import { Auth } from "@/components/leve/auth";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — LEVE" },
      { name: "description", content: "Entra ou cria a tua conta no LEVE." },
      { property: "og:title", content: "Entrar — LEVE" },
      { property: "og:description", content: "Entra ou cria a tua conta no LEVE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Auth,
});
