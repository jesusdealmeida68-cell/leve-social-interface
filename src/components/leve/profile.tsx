import { Grid3x3, Heart, MessageCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { me, posts, profileCover, type Post } from "./data";
import { Avatar, formatCount } from "./primitives";

/** As publicações do perfil aparecem numa grelha de 2 colunas. */
const myPosts = posts.map((post) => ({ ...post, author: me }));

export function Profile({ onPost }: { onPost: (post: Post) => void }) {
  return (
    <div className="mx-auto max-w-[900px] pb-8">
      <div className="relative h-40 overflow-hidden sm:h-56 sm:rounded-b-[2rem]">
        <img
          src={profileCover}
          alt="Costa de Luanda ao fim do dia"
          className="size-full object-cover"
          width={1200}
          height={1504}
        />
        <div className="absolute inset-0 bg-cover-overlay" aria-hidden="true" />
      </div>

      <section className="relative px-4 sm:px-8" aria-label="Sobre o perfil">
        <div className="-mt-12 flex items-end justify-between gap-3 sm:-mt-14">
          <span className="rounded-full border-4 border-background">
            <Avatar person={me} size="lg" />
          </span>
          <div className="flex items-center gap-2 pb-1">
            <Button>Editar perfil</Button>
          </div>
        </div>

        <h1 className="mt-4 font-display text-2xl font-semibold">{me.name}</h1>
        <p className="text-sm text-muted-foreground">{me.handle}</p>
        <p className="mt-4 max-w-lg text-[15px] leading-6 text-foreground/85">
          Direção criativa, imagem e ideias em movimento. Luanda, Angola.
        </p>

        <dl className="mt-5 flex gap-6 whitespace-nowrap text-sm">
          <div className="flex items-baseline gap-1.5">
            <dt className="order-2 text-muted-foreground">seguidores</dt>
            <dd className="font-bold">{formatCount(18400)}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="order-2 text-muted-foreground">a seguir</dt>
            <dd className="font-bold">482</dd>
          </div>
        </dl>

        <div className="mt-6 flex border-b border-border">
          <span className="-mb-px flex h-12 items-center gap-2 border-b-2 border-primary px-4 text-sm font-semibold">
            <Grid3x3 className="size-4" />
            Publicações
          </span>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 px-4 sm:px-8">
        {myPosts.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => onPost(post)}
            aria-label={`Abrir publicação: ${post.caption}`}
            className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-secondary text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img
              src={post.image}
              alt=""
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              width={600}
              height={750}
            />

            {post.video && (
              <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
                <Play className="size-3 fill-current" aria-hidden="true" />
                {post.duration}
              </span>
            )}

            <span
              className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-2.5 py-2 text-xs font-semibold text-white"
              aria-hidden="true"
            >
              <span className="flex items-center gap-1">
                <Heart className="size-3.5 fill-current text-primary" />
                {formatCount(post.likes)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="size-3.5" />
                {formatCount(post.comments)}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
