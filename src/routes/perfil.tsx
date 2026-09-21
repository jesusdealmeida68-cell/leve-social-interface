import { Bookmark, Grid3x3, Heart, Images, MessageCircle, Share2, Video } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { me, profileCover, profilePosts, type Post } from "./data";
import { Avatar, IconButton, formatCount } from "./primitives";

const tabs = [
  { key: "posts", label: "Publicações", icon: Grid3x3 },
  { key: "saved", label: "Guardados", icon: Bookmark },
] as const;

type Tab = (typeof tabs)[number]["key"];

export function Profile({ onPost }: { onPost: (post: Post) => void }) {
  const [tab, setTab] = useState<Tab>("posts");

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
            <IconButton label="Compartilhar perfil" className="border border-input">
              <Share2 />
            </IconButton>
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

        <div
          role="tablist"
          aria-label="Conteúdo do perfil"
          className="mt-6 flex gap-1 border-b border-border"
        >
          {tabs.map((item) => {
            const Icon = item.icon;
            const selected = item.key === tab;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.key)}
                className={cn(
                  "-mb-px flex h-12 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {tab === "posts" ? (
        <ProfilePostGrid posts={profilePosts} onOpen={onPost} />
      ) : (
        <div className="mx-4 mt-6 grid min-h-56 place-items-center rounded-3xl border border-dashed border-border text-center sm:mx-8">
          <div className="px-6">
            <Bookmark className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">Ainda não guardaste nada</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Toca no marcador de uma publicação para a guardar aqui.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Grelha de miniaturas quadradas do perfil, com contagens sobrepostas — como no Publicações. */
function ProfilePostGrid({ posts, onOpen }: { posts: Post[]; onOpen: (post: Post) => void }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-0.5 px-0.5 sm:gap-1 sm:px-1">
      {posts.map((post) => {
        const isVideo = post.id % 2 === 0;
        const isMulti = !isVideo && post.id % 3 === 0;
        const duration = 18 + (post.id % 40);

        return (
          <button
            key={post.id}
            type="button"
            onClick={() => onOpen(post)}
            className="group relative aspect-square overflow-hidden bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <img
              src={post.image}
              alt={post.caption}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              width={400}
              height={400}
            />

            {(isVideo || isMulti) && (
              <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                {isVideo ? (
                  <>
                    <Video className="size-3" strokeWidth={2.2} />
                    {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
                  </>
                ) : (
                  <Images className="size-3.5" strokeWidth={2.2} />
                )}
              </span>
            )}

            <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/75 via-black/15 to-transparent px-2 pb-1.5 pt-6 text-[11px] font-semibold text-white">
              <span className="flex items-center gap-1">
                <Heart className="size-3.5 fill-current" strokeWidth={0} />
                {formatCount(post.likes)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="size-3.5" strokeWidth={2.2} />
                {formatCount(post.comments)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
