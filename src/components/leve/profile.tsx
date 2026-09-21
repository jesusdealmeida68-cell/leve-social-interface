import { Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { me, posts, profileCover } from "./data";
import { Avatar, formatCount, PostThumb } from "./primitives";

/** As publicações do perfil aparecem numa grelha de 2 colunas. */
const myPosts = posts.map((post) => ({ ...post, author: me }));

export function Profile() {
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
          <PostThumb key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
