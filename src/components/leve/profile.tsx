import { Bookmark, Grid3x3, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PostCard } from "./feed";
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
        <div className="mt-5 space-y-5 px-4 sm:px-8">
          {profilePosts.map((post) => (
            <PostCard key={post.id} post={post} onOpen={() => onPost(post)} />
          ))}
        </div>
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
