import { createFileRoute } from "@tanstack/react-router";
import { LeveApp } from "@/components/leve-app";

export const Route = createFileRoute("/perfil/$handle")({
  head: ({ params }) => ({
    meta: [
      { title: `Perfil de @${params.handle} — LEVE` },
      { name: "description", content: "Publicações e perfil no protótipo social LEVE." },
      { property: "og:title", content: `Perfil de @${params.handle} — LEVE` },
      { property: "og:description", content: "Publicações e perfil no protótipo social LEVE." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { handle } = Route.useParams();
  return <LeveApp section="profile" profileHandle={`@${handle}`} />;
}
