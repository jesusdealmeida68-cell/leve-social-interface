import { Bell, CircleDollarSign, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { listFeed, listSuggestions, toggleFollow, type Profile } from "@/lib/leve";
import { cn } from "@/lib/utils";
import { Avatar, IconButton, PersonLink, PostThumb } from "./primitives";

/** Uma publicação conta como "nova" durante as primeiras 24 horas. */
const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

type FeedTab = "all" | "new";

export function Feed({
  notificationsOpen,
  onNotifications,
}: {
  notificationsOpen: boolean;
  onNotifications: () => void;
}) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<FeedTab>("all");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["feed", user?.id ?? null, query],
    queryFn: () => listFeed(user?.id ?? null, query),
  });

  /* "Conteúdos novos": só o que foi publicado nas últimas 24 horas, o mais recente primeiro. */
  const newPosts = useMemo(() => {
    const limit = Date.now() - NEW_WINDOW_MS;
    return (posts ?? []).filter((post) => new Date(post.created_at).getTime() >= limit);
  }, [posts]);
  const visible = tab === "new" ? newPosts : posts;
  const tabs: { key: FeedTab; label: string; count?: number }[] = [
    { key: "all", label: "Todo o conteúdo" },
    { key: "new", label: "Conteúdos novos", count: newPosts.length },
  ];

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
            {/* Só o botão: por agora não faz nada. */}
            <button
              type="button"
              className="inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-premium px-3.5 text-[13px] font-bold text-[oklch(0.24_0.05_60)] shadow-premium transition-[transform,filter] duration-200 hover:-translate-y-px hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0 active:scale-[0.97] sm:px-4"
            >
              <CircleDollarSign className="hidden size-4 sm:block" strokeWidth={2.2} />
              Conteúdos pagos
            </button>
            <IconButton
              label="Notificações"
              active={notificationsOpen}
              onClick={onNotifications}
              className="hidden lg:inline-flex"
            >
              <Bell className="size-[22px]" />
            </IconButton>
          </div>

          <div
            role="tablist"
            aria-label="Tipo de conteúdo"
            className="mt-3 grid grid-cols-2 border-b border-border"
          >
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={tab === item.key}
                onClick={() => setTab(item.key)}
                className={cn(
                  "-mb-px flex h-11 items-center justify-center gap-2 border-b-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  tab === item.key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {item.count ? (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-bold leading-none text-primary-foreground">
                    {item.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 px-4 pb-10 pt-4">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="aspect-[4/5] animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : visible && visible.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 px-4 pb-10 pt-4">
            {visible.map((post) => (
              <PostThumb key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="mx-4 mt-4 grid min-h-64 place-items-center rounded-3xl border border-dashed border-border text-center">
            <div>
              <Search className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">
                {query
                  ? "Nada encontrado"
                  : tab === "new"
                    ? "Sem conteúdo novo"
                    : "Ainda não há publicações"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {query
                  ? "Tenta outro nome ou outra palavra."
                  : tab === "new"
                    ? "Aqui só aparece o que foi publicado nas últimas 24 horas."
                    : "Sê a primeira pessoa a publicar."}
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
