import { createFileRoute } from "@tanstack/react-router";
import { Watch } from "@/components/leve/watch";

export const Route = createFileRoute("/video/$postId")({
  head: () => ({
    meta: [
      { title: "Assistir — LEVE" },
      { name: "description", content: "Assiste aos vídeos da comunidade LEVE." },
      { property: "og:title", content: "Assistir — LEVE" },
      { property: "og:description", content: "Assiste aos vídeos da comunidade LEVE." },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();
  return <Watch postId={Number(postId)} />;
}
