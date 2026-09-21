import { Bell, Search } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { listFeed, listSuggestions, toggleFollow, type Profile } from "@/lib/leve";
import { Avatar, IconButton, PersonLink, PostThumb } from "./primitives";

export function Feed({
  notificationsOpen,
  onNotifications,
}: {
  notificationsOpen: boolean;
  onNotifications: () => void;
}) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["feed", user?.id ?? null, query],
    queryFn: () => listFeed(user?.id ?? null, query),
  });

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

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 px-4 pb-10 pt-4">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="aspect-[4/5] animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 px-4 pb-10 pt-4">
            {posts.map((post) => (
              <PostThumb key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="mx-4 mt-4 grid min-h-64 place-items-center rounded-3xl border border-dashed border-border text-center">
            <div>
              <Search className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">
                {query ? "Nada encontrado" : "Ainda não há publicações"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {query ? "Tenta outro nome ou outra palavra." : "Sê a primeira pessoa a publicar."}
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: suggestions } = useQuery({
    queryKey: ["suggestions", user?.id ?? null],
    queryFn: () => listSuggestions(user?.id ?? null),
  });

  const follow = useMutation({
    mutationFn: ({ target, next }: { target: Profile; next: boolean }) =>
      toggleFollow(user!.id, target.id, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  if (!suggestions || suggestions.length === 0) return <aside className="hidden xl:block" />;

  return (
    <aside className="hidden xl:block" aria-label="Sugestões">
      <div className="sticky top-4 space-y-4 py-4">
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-semibold">Quem seguir</h2>
          <ul className="mt-4 space-y-4">
            {suggestions.map((person) => (
              <li key={person.id} className="flex items-center gap-3">
                <PersonLink person={person}>
                  <Avatar person={person} size="sm" />
                </PersonLink>
                <PersonLink
                  person={person}
                  className="min-w-0 flex-1 leading-tight hover:underline"
                >
                  <p className="truncate text-sm font-bold">{person.name}</p>
                  <p className="truncate text-xs text-muted-foreground">@{person.username}</p>
                </PersonLink>
                {user && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={follow.isPending}
                    onClick={() => follow.mutate({ target: person, next: true })}
                  >
                    Seguir
                  </Button>
                )}
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
