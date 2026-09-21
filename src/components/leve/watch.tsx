import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { CommentsSection } from "./overlays";
import { Avatar, Logo } from "./primitives";
import { getPostById, posts, type Post } from "./data";
import { VideoPlayer } from "./video-player";

/**
 * Página de abrir uma publicação (foto ou vídeo): a publicação aberta e as
 * outras aparecem empilhadas na vertical logo a seguir — a mesma página serve
 * para fotos e para vídeos. Os comentários só aparecem no fim.
 */
export function Watch({ postId }: { postId: number }) {
  const main = getPostById(postId);
  const others = posts.filter((post) => post.id !== postId);
  const queue = main ? [main, ...others] : others;
  const commentsFor = main ?? queue[0];

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

      {!commentsFor ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          Esta publicação já não está disponível.
        </p>
      ) : (
        <>
          <div className="divide-y divide-border">
            {queue.map((post) => (
              <MediaBlock key={post.id} post={post} />
            ))}
          </div>

          <div className="mt-5 px-4">
            <h2 className="mb-1 text-sm font-bold text-muted-foreground">Comentários</h2>
            <CommentsSection post={commentsFor} />
          </div>
        </>
      )}
    </div>
  );
}

function MediaBlock({ post }: { post: Post }) {
  return (
    <article className="py-4 first:pt-0">
      {post.video ? (
        <VideoPlayer
          src={post.video}
          poster={post.image}
          durationHint={post.duration}
          label={`Vídeo de ${post.author.name}`}
          className="aspect-[4/5] w-full"
        />
      ) : (
        <img
          src={post.image}
          alt={`Publicação de ${post.author.name}`}
          className="aspect-[4/5] w-full object-cover"
          width={1200}
          height={1504}
        />
      )}
      <div className="flex items-center gap-3 px-4 pt-3">
        <Avatar person={post.author} size="sm" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-bold">{post.author.name}</p>
          <p className="truncate text-[13px] text-muted-foreground">{post.caption}</p>
        </div>
      </div>
    </article>
  );
}
