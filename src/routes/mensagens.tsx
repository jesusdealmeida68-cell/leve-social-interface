import { createFileRoute } from "@tanstack/react-router";
import { LeveApp } from "@/components/leve-app";

export const Route = createFileRoute("/mensagens")({
  validateSearch: (search: Record<string, unknown>) => ({
    to: typeof search["to"] === "string" ? search["to"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Mensagens — LEVE" },
      { name: "description", content: "Conversas e mensagens no protótipo social LEVE." },
      { property: "og:title", content: "Mensagens — LEVE" },
      { property: "og:description", content: "Conversas e mensagens no protótipo social LEVE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { to } = Route.useSearch();
  return <LeveApp section="messages" messageTo={to} />;
}
