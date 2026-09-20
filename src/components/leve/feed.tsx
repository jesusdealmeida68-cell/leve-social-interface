import {
  Bell,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { me, posts, storyPeople, suggestions, trending, type Post } from "./data";
import { ActionButton, Avatar, IconButton, formatCount } from "./primitives";

export function Feed({
  onStory,
  onPost,
  onCreate,
  notificationsOpen,
  onNotifications,
}: {
  onStory: (index: number) => void;
  onPost: (post: Post) => void;
  onCreate: () => void;
  notificationsOpen: boolean;
  onNotifications: () => void;
}) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const filtered = posts.filter((post) =>
    `${post.author.name} ${post.caption}`.toLowerCase().includes(term),
  );

  return (
    <div className="mx-auto grid max-w-[600px] xl:max-w-[960px] xl:grid-cols-[minmax(0,600px)_320px] xl:gap-10">
      <section className="min-w-0">
        <div className="z-20 bg-background/85 px-4 pb-2 pt-4 backdrop-blur-xl lg:sticky lg:top-0">
          <div className="flex items-center gap-2">
            <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full bg-secondary px-4 transition-shadow focus-within:ring-2 focus-within:ring-ring">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Pesquisar no LEVE"
                placeholder="Pesquisar no LEVE"
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <IconButton
              label="Notificações"
              active={notificationsOpen}
              onClick={onNotifications}
              className="hidden lg:inline-flex"
            >
              <Bell className="size-[22px]" />
            </IconButton>
          </div>
        </div>

        <StoryStrip onStory={onStory} onCreate={onCreate} />

        <div className="space-y-4 px-4 pb-8 pt-2">
          {filtered.length ? (
            filtered.map((post) => (
              <PostCard key={post.id} post={post} onOpen={() => onPost(post)} />
            ))
          ) : (
            <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-border text-center">
              <div>
                <Search className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold">Nada encontrado</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tenta outro nome ou outra palavra.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
      <RightRail />
    </div>
  );
}

function StoryStrip({
  onStory,
  onCreate,
}: {
  onStory: (index: number) => void;
  onCreate: () => void;
}) {
  return (
    <div className="scrollbar-none flex gap-4 overflow-x-auto px-4 py-3">
      <button
        type="button"
        onClick={onCreate}
        className="group shrink-0 rounded-2xl text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="relative block rounded-full border border-dashed border-muted-foreground/60 p-[5px] transition-colors group-hover:border-primary">
          <Avatar person={me} size="xl" />
          <span className="absolute -bottom-0.5 -right-0.5 grid size-6 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground">
            <Plus className="size-3.5" strokeWidth={3} />
          </span>
        </span>
        <span className="mt-1.5 block text-xs text-muted-foreground">Sua história</span>
      </button>

      {storyPeople
        .map((person, index) => ({ person, index }))
        .filter(({ person }) => person.handle !== me.handle)
        .map(({ person, index }) => (
          <button
            key={person.handle}
            type="button"
            onClick={() => onStory(index)}
            className="shrink-0 rounded-2xl text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="block rounded-full bg-story p-[2.5px]">
              <span className="block rounded-full bg-background p-[2.5px]">
                <Avatar person={person} size="xl" />
              </span>
            </span>
            <span className="mt-1.5 block max-w-[74px] truncate text-xs font-medium">
              {person.name.split(" ")[0]}
            </span>
          </button>
        ))}
    </div>
  );
}

function PostCard({ post, onOpen }: { post: Post; onOpen: () => void }) {
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [saved, setSaved] = useState(false);
  const isMine = post.author.handle === me.handle;

  return (
    <article className="rounded-[1.75rem] border border-border bg-card p-3 sm:p-4">
      <header className="flex items-center gap-3 pb-3">
        <Avatar person={post.author} size="md" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[15px] font-bold">{post.author.name}</p>
          <p className="truncate text-[13px] text-muted-foreground">
            {post.author.handle} · {post.time}
          </p>
        </div>
        {!isMine && (
          <Button
            variant={following ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFollowing(!following)}
          >
            {following ? "A seguir" : "Seguir"}
          </Button>
        )}
        <IconButton label="Mais opções" className="-mr-1">
          <MoreHorizontal />
        </IconButton>
      </header>

      <button
        type="button"
        onClick={onOpen}
        aria-label={`Abrir publicação de ${post.author.name}`}
        className="group block w-full overflow-hidden rounded-[1.25rem] bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img
          src={post.image}
          alt={`Publicação de ${post.author.name}`}
          className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          loading="lazy"
          width={1200}
          height={1504}
        />
      </button>

      <div className="mt-2 flex items-center gap-0.5">
        <ActionButton
          label="Curtir"
          pressed={liked}
          active={liked}
          count={formatCount(post.likes + (liked ? 1 : 0))}
          onClick={() => setLiked(!liked)}
        >
          <Heart className="size-[22px]" strokeWidth={1.8} fill={liked ? "currentColor" : "none"} />
        </ActionButton>
        <ActionButton label="Comentários" count={formatCount(post.comments)} onClick={onOpen}>
          <MessageCircle className="size-[22px]" strokeWidth={1.8} />
        </ActionButton>
        <ActionButton label="Compartilhar">
          <Share2 className="size-[22px]" strokeWidth={1.8} />
        </ActionButton>
        <span className="flex-1" />
        <ActionButton
          label="Guardar"
          pressed={saved}
          active={saved}
          onClick={() => setSaved(!saved)}
        >
          <Bookmark
            className="size-[22px]"
            strokeWidth={1.8}
            fill={saved ? "currentColor" : "none"}
          />
        </ActionButton>
      </div>

      <div className="px-1 pb-1">
        <p className="text-sm leading-6">
          <strong className="mr-1.5 font-bold">{post.author.handle}</strong>
          {post.caption}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatCount(post.views)} visualizações
        </p>
      </div>
    </article>
  );
}

function RightRail() {
  const [followed, setFollowed] = useState<string[]>([]);
  const toggle = (handle: string) =>
    setFollowed((items) =>
      items.includes(handle) ? items.filter((item) => item !== handle) : [...items, handle],
    );

  return (
    <aside className="hidden xl:block" aria-label="Sugestões">
      <div className="sticky top-4 space-y-4 py-4">
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-semibold">Quem seguir</h2>
          <ul className="mt-4 space-y-4">
            {suggestions.map((person) => {
              const isFollowed = followed.includes(person.handle);
              return (
                <li key={person.handle} className="flex items-center gap-3">
                  <Avatar person={person} size="sm" />
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-sm font-bold">{person.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{person.handle}</p>
                  </div>
                  <Button
                    variant={isFollowed ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => toggle(person.handle)}
                  >
                    {isFollowed ? "A seguir" : "Seguir"}
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-semibold">Em destaque</h2>
          <ul className="mt-4 space-y-4">
            {trending.map((item) => (
              <li key={item.tag}>
                <p className="text-sm font-semibold">{item.tag}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <p className="flex flex-wrap gap-x-3 gap-y-1 px-2 text-xs leading-5 text-muted-foreground">
          <span>© 2026 LEVE</span>
          <span>Privacidade</span>
          <span>Termos</span>
          <span>Sobre</span>
        </p>
      </div>
    </aside>
  );
}
