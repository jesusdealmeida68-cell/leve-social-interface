import { Link } from "@tanstack/react-router";
import { ChevronLeft, Eye } from "lucide-react";
import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { getPost, getViewerKey, postMedia, registerPostView, type Post } from "@/lib/leve";
import { CommentsSection } from "./overlays";
import { Avatar, formatCount, Logo, PersonLink } from "./primitives";
import { PostGallery } from "./media-gallery";
import { PostOwnerMenu } from "./post-owner-menu";

/** Página de abrir uma publicação (foto ou vídeo): a mesma página serve para os dois. Os comentários aparecem no fim. */
export function Watch({ postId }: { postId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["post", postId, user?.id ?? null];
  const { data: post, isLoading } = useQuery({
    queryKey,
    queryFn: () => getPost(postId, user?.id ?? null),
  });
  const isOwner = Boolean(user && post && user.id === post.user_id);

  /* Conta a visualização quando a publicação abre (no máximo uma vez a cada
     12 horas por pessoa/aparelho — a repetição fica a cargo do servidor). */
  const registered = useRef<string | null>(null);
  useEffect(() => {
    if (!post || registered.current === post.id) return;
    registered.current = post.id;
    registerPostView(post.id, getViewerKey(user?.id ?? null))
      .then((views) => {
        if (views === null) return;
        queryClient.setQueryData<Post | null>(queryKey, (current) =>
          current ? { ...current, views } : current,
        );
      })
      .catch(() => {
        // Não é grave falhar a contagem de visualizações: ignora-se em silêncio.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

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
        {isOwner && post && (
          <span className="ml-auto">
            <PostOwnerMenu post={post} />
          </span>
        )}
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
            <PostGallery items={postMedia(post)} label={`Publicação de ${post.author.name}`} />
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
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Eye className="size-3.5" aria-hidden="true" />
                {formatCount(post.views)}
              </span>
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
