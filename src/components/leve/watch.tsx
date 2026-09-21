import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { getPost } from "@/lib/leve";
import { CommentsSection } from "./overlays";
import { Avatar, Logo, PersonLink } from "./primitives";
import { VideoPlayer } from "./video-player";

/** Página de abrir uma publicação (foto ou vídeo): a mesma página serve para os dois. Os comentários aparecem no fim. */
export function Watch({ postId }: { postId: string }) {
  const { user } = useAuth();
  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postId, user?.id ?? null],
    queryFn: () => getPost(postId, user?.id ?? null),
  });

  return (
    <div className="mx-auto min-h-dvh max-w-[600px] bg-background pb-10 text-foreground">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/85 px-4 backdrop-blur-xl">
        <Link
          to="/"
          aria-label="Voltar"
          className="grid size-9 shrink-0 place-items-center rounded-full text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <Logo />
      </header>

      {isLoading ? (
        <div className="aspect-[4/5] w-full animate-pulse bg-secondary" />
      ) : !post ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          Esta publicação já não está disponível.
        </p>
      ) : (
        <>
          <article className="py-4">
            {post.media_type === "video" && post.media_url ? (
              <VideoPlayer
                src={post.media_url}
                label={`Vídeo de ${post.author.name}`}
                className="aspect-[4/5] w-full"
                autoPlayOnMount
              />
            ) : post.media_url ? (
              <img
                src={post.media_url}
                alt={`Publicação de ${post.author.name}`}
                className="aspect-[4/5] w-full object-cover"
                width={1200}
                height={1504}
              />
            ) : null}
            <div className="flex items-center gap-3 px-4 pt-3">
              <PersonLink person={post.author}>
                <Avatar person={post.author} size="sm" />
              </PersonLink>
              <PersonLink
                person={post.author}
                className="min-w-0 flex-1 leading-tight hover:underline"
              >
                <p className="truncate text-sm font-bold">{post.author.name}</p>
                {post.caption && (
                  <p className="truncate text-[13px] text-muted-foreground">{post.caption}</p>
                )}
              </PersonLink>
            </div>
          </article>

          <div className="mt-1 px-4">
            <h2 className="mb-1 text-sm font-bold text-muted-foreground">Comentários</h2>
            <CommentsSection post={post} />
          </div>
        </>
      )}
    </div>
  );
}
