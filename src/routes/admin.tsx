import { createFileRoute } from "@tanstack/react-router";
import { Admin } from "@/components/leve/admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administração — LEVE" },
      { name: "description", content: "Painel de administração do LEVE." },
    ],
  }),
  component: Admin,
});
