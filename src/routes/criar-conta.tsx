import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "@/components/leve/signup";

export const Route = createFileRoute("/criar-conta")({
  head: () => ({
    meta: [
      { title: "Criar conta — LEVE" },
      { name: "description", content: "Cria a tua conta gratuita no LEVE em poucos segundos." },
      { property: "og:title", content: "Criar conta — LEVE" },
      {
        property: "og:description",
        content: "Cria a tua conta gratuita no LEVE em poucos segundos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignUp,
});
