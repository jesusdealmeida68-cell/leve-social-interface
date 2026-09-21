import { Bell, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { posts, suggestions, trending } from "./data";
import { Avatar, IconButton, PostThumb } from "./primitives";

export function Feed({
  notificationsOpen,
  onNotifications,
}: {
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

        {filtered.length ? (
          <div className="grid grid-cols-2 gap-3 px-4 pb-10 pt-4">
            {filtered.map((post) => (
              <PostThumb key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="mx-4 mt-4 grid min-h-64 place-items-center rounded-3xl border border-dashed border-border text-center">
            <div>
              <Search className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">Nada encontrado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tenta outro nome ou outra palavra.
              </p>
            </div>
          </div>
        )}
      </section>
      <RightRail />
    </div>
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
