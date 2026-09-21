import { createFileRoute } from "@tanstack/react-router";
import { Watch } from "@/components/leve/watch";

export const Route = createFileRoute("/video/$postId")({
  head: () => ({
    meta: [
      { title: "Publicação — LEVE" },
      { name: "description", content: "Vê as publicações da comunidade LEVE." },
      { property: "og:title", content: "Publicação — LEVE" },
      { property: "og:description", content: "Vê as publicações da comunidade LEVE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();
  return <Watch postId={Number(postId)} />;
}
