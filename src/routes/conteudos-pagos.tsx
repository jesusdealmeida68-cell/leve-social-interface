import { createFileRoute } from "@tanstack/react-router";
import { PaidContent } from "@/components/leve/paid-content";

export const Route = createFileRoute("/conteudos-pagos")({
  head: () => ({
    meta: [
      { title: "Conteúdos pagos — LEVE" },
      { name: "description", content: "Gere os teus conteúdos pagos no LEVE." },
      { property: "og:title", content: "Conteúdos pagos — LEVE" },
      { property: "og:description", content: "Gere os teus conteúdos pagos no LEVE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaidContent,
});
