import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Ban,
  Check,
  ChevronLeft,
  Compass,
  Crown,
  ImagePlus,
  Image as ImageIcon,
  Images,
  Loader2,
  Lock,
  MoreHorizontal,
  Plus,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import {
  buyPaidItem,
  createPaidItem,
  deletePaidItem,
  listMyPaidItems,
  listMyPurchaseIds,
  listPaidItems,
  myVerified,
  setPaidItemStatus,
  uploadMedia,
  type PaidItem,
  type PaidKind,
  type PaidStatus,
} from "@/lib/leve";
import { cn } from "@/lib/utils";
import { Avatar, PersonLink } from "./primitives";
import { GridSkeleton } from "./loading";

/* ---------------------------------------------------------------------------
 * Conteúdo pago — ligado à base de dados.
 * Só contas com selo de verificação podem publicar/vender conteúdo pago.
 * ------------------------------------------------------------------------- */

type View = "explore" | "mine";

const kinds = {
  video: { label: "Vídeo exclusivo", short: "Vídeo", icon: Video },
  photo: { label: "Fotografia exclusiva", short: "Fotografia", icon: ImageIcon },
  collection: { label: "Coleção exclusiva", short: "Coleção", icon: Images },
} as const;

const statuses = {
  published: { label: "Publicado", className: "bg-emerald-500/20 text-emerald-300" },
  draft: { label: "Rascunho", className: "bg-white/15 text-white/80" },
  suspended: { label: "Suspenso", className: "bg-amber-500/20 text-amber-300" },
} as const;

const covers = { video: "bg-paid-a", photo: "bg-paid-b", collection: "bg-paid-c" } as const;

const formatKz = (value: number) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const tabs: { key: View; label: string; icon: typeof Compass }[] = [
  { key: "explore", label: "Explorar", icon: Compass },
  { key: "mine", label: "Os meus conteúdos", icon: Sparkles },
];

export function PaidContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("explore");
  const [creating, setCreating] = useState(false);
  const [buying, setBuying] = useState<PaidItem | null>(null);

  const verifiedQuery = useQuery({
    queryKey: ["my-verified", user?.id ?? null],
    queryFn: myVerified,
    enabled: Boolean(user),
  });
  const hasBadge = verifiedQuery.data === true;

  const exploreQuery = useQuery({
    queryKey: ["paid-items", user?.id ?? null],
    queryFn: () => listPaidItems(user?.id ?? null),
  });

  const mineQuery = useQuery({
    queryKey: ["my-paid-items", user?.id ?? null],
    queryFn: () => listMyPaidItems(user!.id),
    enabled: Boolean(user),
  });

  const purchasesQuery = useQuery({
    queryKey: ["my-purchases", user?.id ?? null],
    queryFn: () => listMyPurchaseIds(user!.id),
    enabled: Boolean(user),
  });

  const refreshMine = () => {
    queryClient.invalidateQueries({ queryKey: ["my-paid-items"] });
    queryClient.invalidateQueries({ queryKey: ["paid-items"] });
  };

  const bought = new Set(purchasesQuery.data ?? []);

  return (
    <div className="mx-auto min-h-dvh max-w-[640px] bg-background pb-14 text-foreground">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/60 bg-background/85 px-4 backdrop-blur-xl">
        <Link
          to="/perfil"
          aria-label="Voltar ao perfil"
          className="grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-6" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate font-display text-lg font-semibold">
          Conteúdo pago
        </h1>
        <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-3 text-xs font-bold text-primary">
          <Crown className="size-4" aria-hidden="true" />
          Premium
        </span>
      </header>

      <div
        role="tablist"
        aria-label="Secções de conteúdo pago"
        className="sticky top-14 z-10 flex gap-2 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl"
      >
        {tabs.map(({ key, label, icon: Icon }) => {
          const selected = key === view;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setView(key)}
              className={cn(
                "flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-[18px]" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      {view === "explore" ? (
        <main className="space-y-6 px-5 pt-6">
          <div>
            <h2 className="font-display text-xl font-semibold">Descobre conteúdo novo</h2>
            <p className="mt-1.5 text-[15px] leading-6 text-muted-foreground">
              Vídeos, fotografias e coleções exclusivas de criadores verificados do LEVE.
            </p>
          </div>

          {exploreQuery.isLoading ? (
            <GridSkeleton />
          ) : (
            <ul className="space-y-5">
              {(exploreQuery.data ?? []).length ? (
                (exploreQuery.data ?? []).map((item) => (
                  <li key={item.id}>
                    <BrowseCard
                      item={item}
                      owned={bought.has(item.id)}
                      onBuy={() => setBuying(item)}
                    />
                  </li>
                ))
              ) : (
                <Empty
                  icon={Compass}
                  title="Ainda sem conteúdo para descobrir"
                  text="Quando criadores verificados publicarem conteúdo pago, aparece aqui."
                />
              )}
            </ul>
          )}
        </main>
      ) : (
        <main className="space-y-7 px-5 pt-6">
          <section className="rounded-3xl bg-card p-5">
            <h2 className="text-sm font-semibold text-muted-foreground">Estado de verificação</h2>
            <div className="mt-4 flex items-center gap-4">
              <span
                className={cn(
                  "grid size-14 shrink-0 place-items-center rounded-full",
                  hasBadge ? "bg-sky-500/15" : "bg-muted",
                )}
              >
                {hasBadge ? (
                  <BadgeCheck className="size-8 text-sky-400" aria-hidden="true" />
                ) : (
                  <ShieldAlert className="size-7 text-muted-foreground" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0">
                <p className="font-display text-xl font-bold">
                  {hasBadge ? "Verificado" : "Sem selo"}
                </p>
                <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                  {hasBadge
                    ? "Podes publicar e vender conteúdos Premium."
                    : "Só contas com selo podem vender conteúdo. O selo é dado pela administração."}
                </p>
              </div>
            </div>
          </section>

          <Button
            type="button"
            disabled={!hasBadge}
            onClick={() => setCreating(true)}
            className="h-12 w-full rounded-2xl text-[15px] font-bold transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {hasBadge ? <Plus className="size-5" /> : <Lock className="size-5" />}
            {hasBadge ? "Criar conteúdo pago" : "Precisas do selo para vender"}
          </Button>

          <section>
            <h2 className="font-display text-lg font-semibold">Os meus conteúdos</h2>
            <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
              O que publicaste para venda, e como está a vender.
            </p>

            {mineQuery.isLoading ? (
              <div className="mt-5">
                <GridSkeleton />
              </div>
            ) : (
              <ul className="mt-5 space-y-5">
                {(mineQuery.data ?? []).length ? (
                  (mineQuery.data ?? []).map((item) => (
                    <li key={item.id} className="animate-in fade-in-0 duration-300">
                      <MineCard item={item} onChanged={refreshMine} />
                    </li>
                  ))
                ) : (
                  <Empty
                    icon={Crown}
                    title="Nenhum conteúdo aqui"
                    text="Cria o teu primeiro conteúdo Premium para começar a vender."
                  />
                )}
              </ul>
            )}
          </section>
        </main>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto rounded-3xl">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-xl">Criar conteúdo pago</DialogTitle>
            <DialogDescription>Preenche os detalhes do teu conteúdo Premium.</DialogDescription>
          </DialogHeader>
          <CreateForm
            onDone={() => {
              setCreating(false);
              refreshMine();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={buying !== null} onOpenChange={(open) => !open && setBuying(null)}>
        {buying && (
          <PurchaseDialog
            item={buying}
            onDone={() => {
              setBuying(null);
              queryClient.invalidateQueries({ queryKey: ["my-purchases"] });
              queryClient.invalidateQueries({ queryKey: ["paid-items"] });
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------ Peças ------------------------------ */

function Empty({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Compass;
  title: string;
  text: string;
}) {
  return (
    <li className="grid min-h-48 list-none place-items-center rounded-3xl border border-dashed border-border px-6 text-center">
      <div>
        <Icon className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </div>
    </li>
  );
}

function Cover({
  item,
  revealed,
  className,
}: {
  item: PaidItem;
  revealed: boolean;
  className?: string;
}) {
  const Icon = kinds[item.kind].icon;
  if (revealed && item.media_url) {
    return item.media_type === "video" ? (
      <video
        src={item.media_url}
        controls
        playsInline
        className={cn("aspect-[16/10] w-full bg-black object-cover", className)}
      />
    ) : (
      <img
        src={item.media_url}
        alt={item.title}
        className={cn("aspect-[16/10] w-full bg-black object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn("relative grid aspect-[16/10] place-items-center", covers[item.kind], className)}
    >
      <Icon className="size-12 text-white/35" strokeWidth={1.4} aria-hidden="true" />
    </div>
  );
}

function KindPill({ kind }: { kind: PaidKind }) {
  return (
    <span className="inline-flex h-8 items-center rounded-full bg-violet-500/20 px-3.5 text-[13px] font-semibold text-violet-300">
      {kinds[kind].label}
    </span>
  );
}

function StatusBadge({ status, className }: { status: PaidStatus; className?: string }) {
  const meta = statuses[status];
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full px-3 text-xs font-bold backdrop-blur",
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

function BrowseCard({
  item,
  owned,
  onBuy,
}: {
  item: PaidItem;
  owned: boolean;
  onBuy: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-3xl bg-card">
      <div className="relative">
        <Cover item={item} revealed={owned} />
        {!owned && (
          <span className="absolute left-3 top-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-black/50 px-3 text-xs font-bold text-white backdrop-blur">
            <Lock className="size-3.5" aria-hidden="true" />
            Bloqueado
          </span>
        )}
      </div>

      <div className="p-5">
        <PersonLink person={item.seller} className="flex items-center gap-2.5 hover:opacity-80">
          <Avatar person={item.seller} size="sm" />
          <span className="min-w-0 text-sm font-semibold">{item.seller.name}</span>
          <BadgeCheck className="size-4 shrink-0 text-sky-400" aria-hidden="true" />
        </PersonLink>

        <div className="mt-4">
          <KindPill kind={item.kind} />
        </div>

        <h3 className="mt-4 font-display text-xl font-bold leading-tight">{item.title}</h3>
        {item.description && (
          <p className="mt-1.5 text-[15px] leading-6 text-muted-foreground">{item.description}</p>
        )}

        <div className="my-5 h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Preço único</p>
            <p className="font-display text-2xl font-extrabold tracking-tight">
              {formatKz(item.price)} Kz
            </p>
          </div>
          {owned ? (
            <span className="inline-flex h-11 items-center gap-1.5 rounded-full bg-secondary px-5 text-sm font-bold">
              <Check className="size-4" /> Comprado
            </span>
          ) : (
            <Button type="button" onClick={onBuy} className="h-11 rounded-full px-6 font-bold">
              Comprar
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function PurchaseDialog({ item, onDone }: { item: PaidItem; onDone: () => void }) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const buy = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Precisas de entrar para comprar.");
      await buyPaidItem(item.id, user.id, item.price);
    },
    onSuccess: onDone,
    onError: (err) => setError(err instanceof Error ? err.message : "Algo correu mal."),
  });

  return (
    <DialogContent className="w-[calc(100%-1.5rem)] max-w-md gap-0 overflow-y-auto rounded-3xl p-0 sm:rounded-3xl">
      <Cover item={item} revealed={false} />
      <div className="space-y-5 p-5">
        <div>
          <KindPill kind={item.kind} />
          <DialogTitle className="mt-3 font-display text-xl font-bold">{item.title}</DialogTitle>
          <DialogDescription className="mt-1.5 text-[15px] leading-6">
            {item.description || "Conteúdo exclusivo."}
          </DialogDescription>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Vais pagar</p>
          <p className="font-display text-3xl font-extrabold tracking-tight">
            {formatKz(item.price)} Kz
          </p>
        </div>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button
          type="button"
          disabled={buy.isPending}
          onClick={() => buy.mutate()}
          className="h-12 w-full rounded-2xl font-bold"
        >
          {buy.isPending && <Loader2 className="size-4 animate-spin" />}
          Confirmar compra
        </Button>
      </div>
    </DialogContent>
  );
}

function MineCard({ item, onChanged }: { item: PaidItem; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-3xl bg-card">
      <div className="relative">
        <Cover item={item} revealed />
        <StatusBadge status={item.status} className="absolute left-3 top-3" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Opções de ${item.title}`}
              disabled={busy}
              className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {busy ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <MoreHorizontal className="size-5" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5">
            {item.status !== "published" && (
              <DropdownMenuItem
                className="gap-3 rounded-xl py-2.5"
                onSelect={() => run(() => setPaidItemStatus(item.id, "published"))}
              >
                <Check className="size-4" /> Pôr à venda
              </DropdownMenuItem>
            )}
            {item.status === "published" && (
              <DropdownMenuItem
                className="gap-3 rounded-xl py-2.5"
                onSelect={() => run(() => setPaidItemStatus(item.id, "draft"))}
              >
                <Ban className="size-4" /> Retirar da venda
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-3 rounded-xl py-2.5 text-destructive focus:text-destructive"
              onSelect={() => run(() => deletePaidItem(item.id))}
            >
              <Trash2 className="size-4" /> Apagar conteúdo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <KindPill kind={item.kind} />
          <Lock className="size-5 text-primary" aria-hidden="true" />
        </div>

        <h3 className="mt-4 font-display text-xl font-bold leading-tight">{item.title}</h3>
        {item.description && (
          <p className="mt-1.5 line-clamp-2 text-[15px] leading-6 text-muted-foreground">
            {item.description}
          </p>
        )}

        <div className="my-4 h-px bg-border" />

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Preço único</p>
            <p className="font-display text-3xl font-extrabold tracking-tight">
              {formatKz(item.price)} Kz
            </p>
          </div>
          <p className="flex items-center gap-1.5 pb-1.5 text-sm text-muted-foreground">
            <ShoppingBag className="size-4" aria-hidden="true" />
            {item.sales} {item.sales === 1 ? "venda" : "vendas"}
          </p>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------ Criar ------------------------------ */

function CreateForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<PaidKind>("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.files?.[0];
    if (!chosen) return;
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
    setKind(chosen.type.startsWith("video/") ? "video" : "photo");
  };

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Precisas de entrar.");
      const media = file ? await uploadMedia(file, user.id) : null;
      await createPaidItem({
        userId: user.id,
        kind,
        title: title.trim(),
        description: description.trim(),
        price: Number(price) || 0,
        media,
        status: "published",
      });
    },
    onSuccess: onDone,
    onError: (err) =>
      setError(
        err instanceof Error && err.message.includes("row-level security")
          ? "Só contas com selo podem vender conteúdo."
          : err instanceof Error
            ? err.message
            : "Algo correu mal.",
      ),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Dá um título ao conteúdo.");
      return;
    }
    if (!Number(price)) {
      setError("Define um preço.");
      return;
    }
    create.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label className="text-sm">Tipo</Label>
        <div className="mt-2 flex gap-2">
          {(Object.keys(kinds) as PaidKind[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setKind(key)}
              className={cn(
                "h-10 flex-1 rounded-xl text-sm font-semibold transition-colors",
                kind === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {kinds[key].short}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="paid-title">Título</Label>
        <Input
          id="paid-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex.: Sessão completa em estúdio"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="paid-desc">Descrição</Label>
        <Textarea
          id="paid-desc"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="O que a pessoa recebe ao comprar."
          className="mt-1.5 min-h-20"
        />
      </div>

      <div>
        <Label htmlFor="paid-price">Preço (Kz)</Label>
        <Input
          id="paid-price"
          value={price}
          inputMode="numeric"
          onChange={(event) => setPrice(event.target.value.replace(/\D/g, ""))}
          placeholder="5000"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label>Ficheiro</Label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={pick}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-1.5 flex h-24 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-border text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent/40"
        >
          {preview ? (
            <span className="truncate px-4">{file?.name}</span>
          ) : (
            <>
              <ImagePlus className="size-5" /> Escolher foto ou vídeo
            </>
          )}
        </button>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={create.isPending}
        className="h-12 w-full rounded-2xl font-bold"
      >
        {create.isPending && <Loader2 className="size-4 animate-spin" />}
        Publicar conteúdo
      </Button>
    </form>
  );
}
