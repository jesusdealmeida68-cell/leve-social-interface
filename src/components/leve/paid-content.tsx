import { Link } from "@tanstack/react-router";
import {
  Ban,
  BadgeCheck,
  ChevronLeft,
  Crown,
  Eye,
  ImagePlus,
  Image as ImageIcon,
  Images,
  Link2,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Receipt,
  ShoppingBag,
  Tag,
  TriangleAlert,
  Video,
  Wallet,
} from "lucide-react";
import { useEffect, useId, useState, type ChangeEvent } from "react";
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
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Página "Conteúdos pagos" — SÓ VISUAL.
 * Nada aqui fala com o backend: o estado "Verificado", os cartões de exemplo e
 * os botões de guardar/publicar são apenas desenho. Quando houver ligação real,
 * `previewItems` e o estado de verificação passam a vir da base de dados.
 * ------------------------------------------------------------------------- */

type Kind = "video" | "photo" | "collection";
type Status = "published" | "draft" | "suspended";
type Filter = "all" | Status;

type PaidItem = {
  id: string;
  kind: Kind;
  status: Status;
  title: string;
  description: string;
  price: number;
  sales: number;
};

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

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "published", label: "Publicados" },
  { key: "draft", label: "Rascunhos" },
  { key: "suspended", label: "Suspensos" },
];

const previewItems: PaidItem[] = [
  {
    id: "1",
    kind: "video",
    status: "published",
    title: "Vídeo exclusivo",
    description: "Uma descrição breve sobre o conteúdo.",
    price: 2500,
    sales: 0,
  },
  {
    id: "2",
    kind: "photo",
    status: "draft",
    title: "Fotografias exclusivas",
    description: "Uma descrição breve sobre o conteúdo.",
    price: 1500,
    sales: 0,
  },
  {
    id: "3",
    kind: "collection",
    status: "suspended",
    title: "Coleção exclusiva",
    description: "Uma descrição breve sobre o conteúdo.",
    price: 5000,
    sales: 0,
  },
];

/** Capas abstratas de representação (sem fotos de pessoas), uma por tipo de conteúdo. */
const covers = { video: "bg-paid-a", photo: "bg-paid-b", collection: "bg-paid-c" } as const;

const formatKz = (value: number) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export function PaidContent() {
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<PaidItem | null>(null);

  const visible = filter === "all" ? previewItems : previewItems.filter((i) => i.status === filter);

  return (
    <div className="mx-auto min-h-dvh max-w-[600px] bg-background pb-12 text-foreground">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/60 bg-background/85 px-3 backdrop-blur-xl">
        <Link
          to="/perfil"
          aria-label="Voltar ao perfil"
          className="grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-6" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate font-display text-lg font-semibold">
          Conteúdos pagos
        </h1>
        <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-3 text-xs font-bold text-primary">
          <Crown className="size-4" aria-hidden="true" />
          Premium
        </span>
      </header>

      <main className="space-y-6 px-4 pt-4">
        <section aria-labelledby="verificacao" className="rounded-3xl bg-card p-5">
          <h2 id="verificacao" className="text-sm font-semibold text-muted-foreground">
            Estado de verificação
          </h2>
          <div className="mt-4 flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-sky-500/15">
              <BadgeCheck className="size-8 fill-sky-500 text-white" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl font-bold">Verificado</p>
              <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                Podes publicar e vender conteúdos Premium
              </p>
            </div>
          </div>
        </section>

        <Button
          type="button"
          onClick={() => setCreating(true)}
          className="h-12 w-full rounded-2xl text-[15px] font-bold shadow-[0_10px_28px_-10px_oklch(0.63_0.22_18/0.75)] transition-transform active:scale-[0.98]"
        >
          <Plus className="size-5" />
          Criar conteúdo pago
        </Button>

        <section aria-labelledby="meus-conteudos">
          <h2 id="meus-conteudos" className="font-display text-lg font-semibold">
            Os meus conteúdos
          </h2>

          <div
            role="group"
            aria-label="Filtrar conteúdos"
            className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4"
          >
            {filters.map((item) => {
              const selected = item.key === filter;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFilter(item.key)}
                  className={cn(
                    "h-10 shrink-0 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_oklch(0.63_0.22_18/0.8)]"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <ul className="mt-4 space-y-4">
            {visible.length ? (
              visible.map((item) => (
                <li
                  key={item.id}
                  className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                >
                  <ContentCard item={item} onOpen={() => setDetail(item)} />
                </li>
              ))
            ) : (
              <li className="grid min-h-48 place-items-center rounded-3xl border border-dashed border-border px-6 text-center">
                <div>
                  <Crown className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold">Nenhum conteúdo aqui</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Os conteúdos deste estado aparecem nesta lista.
                  </p>
                </div>
              </li>
            )}
          </ul>
        </section>
      </main>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto rounded-3xl">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-xl">Criar conteúdo pago</DialogTitle>
            <DialogDescription>Preenche os detalhes do teu conteúdo Premium.</DialogDescription>
          </DialogHeader>
          <CreateForm />
        </DialogContent>
      </Dialog>

      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        {detail && <DetailContent item={detail} />}
      </Dialog>
    </div>
  );
}

function StatusBadge({ status, className }: { status: Status; className?: string }) {
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

function Cover({ item, className }: { item: PaidItem; className?: string }) {
  const Icon = kinds[item.kind].icon;
  return (
    <div
      className={cn(
        "relative grid aspect-[16/10] place-items-center",
        covers[item.kind],
        className,
      )}
    >
      <Icon className="size-12 text-white/35" strokeWidth={1.4} aria-hidden="true" />
    </div>
  );
}

function ContentCard({ item, onOpen }: { item: PaidItem; onOpen: () => void }) {
  return (
    <article className="overflow-hidden rounded-3xl bg-card">
      <div className="relative">
        <Cover item={item} />
        <StatusBadge status={item.status} className="absolute left-3 top-3" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Opções de ${item.title}`}
              className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MoreHorizontal className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5">
            <DropdownMenuItem className="gap-3 rounded-xl py-2.5">
              <Pencil className="size-4" /> Editar conteúdo
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 rounded-xl py-2.5">
              <Tag className="size-4" /> Alterar preço
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 rounded-xl py-2.5" onSelect={onOpen}>
              <Eye className="size-4" /> Consultar detalhes
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-3 rounded-xl py-2.5 text-destructive focus:text-destructive">
              <Ban className="size-4" /> Retirar da venda
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex h-8 items-center rounded-full bg-violet-500/20 px-3.5 text-[13px] font-semibold text-violet-300">
            {kinds[item.kind].label}
          </span>
          <Lock className="size-5 text-primary" aria-hidden="true" />
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="mt-4 block rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <h3 className="font-display text-xl font-bold leading-tight">{item.title}</h3>
        </button>
        <p className="mt-1.5 line-clamp-2 text-[15px] leading-6 text-muted-foreground">
          {item.description}
        </p>

        {item.status === "suspended" && (
          <p className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-500/10 p-3 text-sm leading-5 text-amber-200">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Conteúdo suspenso: não está disponível para compra.
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

function DetailContent({ item }: { item: PaidItem }) {
  return (
    <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-md gap-0 overflow-y-auto rounded-3xl p-0 sm:rounded-3xl">
      <Cover item={item} />
      <div className="space-y-5 p-5">
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge status={item.status} />
            <span className="text-sm text-muted-foreground">{kinds[item.kind].short}</span>
          </div>
          <DialogTitle className="mt-3 font-display text-xl font-bold">{item.title}</DialogTitle>
          <DialogDescription className="mt-1.5 text-[15px] leading-6">
            {item.description}
          </DialogDescription>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Preço atual</p>
          <p className="font-display text-3xl font-extrabold tracking-tight">
            {formatKz(item.price)} Kz
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-secondary p-4">
            <dt className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <ShoppingBag className="size-4" aria-hidden="true" /> Compras confirmadas
            </dt>
            <dd className="mt-2 font-display text-2xl font-bold">{item.sales}</dd>
          </div>
          <div className="rounded-2xl bg-secondary p-4">
            <dt className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Wallet className="size-4" aria-hidden="true" /> Receita
            </dt>
            <dd className="mt-2 font-display text-2xl font-bold">
              {formatKz(item.sales * item.price)} Kz
            </dd>
          </div>
        </dl>

        <section aria-labelledby={`historico-${item.id}`}>
          <h3 id={`historico-${item.id}`} className="text-sm font-semibold">
            Histórico de vendas
          </h3>
          <div className="mt-2 grid min-h-28 place-items-center rounded-2xl border border-dashed border-border px-4 text-center">
            <div>
              <Receipt className="mx-auto size-5 text-muted-foreground" aria-hidden="true" />
              <p className="mt-2 text-sm text-muted-foreground">
                As vendas confirmadas aparecem aqui.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby={`link-${item.id}`}>
          <h3 id={`link-${item.id}`} className="text-sm font-semibold">
            Link de acesso
          </h3>
          <p className="mt-2 flex items-center gap-3 rounded-2xl bg-secondary px-4 py-3.5 text-sm">
            <Lock className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="tracking-[0.25em] text-muted-foreground" aria-label="Link oculto">
              ••••••••••••
            </span>
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Só tu vês este link. O comprador recebe-o depois de o pagamento ser confirmado.
          </p>
        </section>
      </div>
    </DialogContent>
  );
}

const kindOptions: Kind[] = ["video", "photo", "collection"];

const fieldClass = "h-12 rounded-2xl border-transparent bg-secondary px-4 shadow-none";

function CreateForm() {
  const base = useId();
  const [kind, setKind] = useState<Kind>("video");
  const [preview, setPreview] = useState<{ url: string; video: boolean } | null>(null);

  // Liberta a pré-visualização anterior quando se troca de ficheiro ou se fecha o formulário.
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );

  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const video = file.type.startsWith("video/");
    if (!video && !file.type.startsWith("image/")) return;
    setPreview({ url: URL.createObjectURL(file), video });
  };

  return (
    <div className="grid gap-4">
      <label className="group relative grid aspect-[16/10] cursor-pointer place-items-center overflow-hidden rounded-2xl border border-dashed border-input bg-secondary/60 transition-colors focus-within:ring-2 focus-within:ring-ring hover:border-primary">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={pick}
          aria-label="Carregar capa ou vídeo de representação"
          className="sr-only"
        />
        {preview ? (
          <>
            {preview.video ? (
              <video
                src={preview.url}
                muted
                playsInline
                autoPlay
                loop
                className="size-full object-cover"
              />
            ) : (
              <img
                src={preview.url}
                alt="Pré-visualização da capa"
                className="size-full object-cover"
              />
            )}
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              Trocar
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-2 px-4 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-primary/15 text-primary transition-transform group-hover:scale-105">
              <ImagePlus className="size-6" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold">Carregar capa ou vídeo</span>
            <span className="text-xs text-muted-foreground">Toca para escolher um ficheiro</span>
          </span>
        )}
      </label>

      <div className="grid gap-2">
        <Label htmlFor={`${base}-title`}>Título</Label>
        <Input id={`${base}-title`} placeholder="Ex.: Vídeo exclusivo" className={fieldClass} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${base}-desc`}>Descrição</Label>
        <Textarea
          id={`${base}-desc`}
          placeholder="Uma descrição breve sobre o conteúdo."
          className="min-h-24 resize-none rounded-2xl border-transparent bg-secondary px-4 py-3 shadow-none"
        />
      </div>

      <div className="grid gap-2">
        <span id={`${base}-kind`} className="text-sm font-medium leading-none">
          Tipo de conteúdo
        </span>
        <div role="radiogroup" aria-labelledby={`${base}-kind`} className="grid grid-cols-3 gap-2">
          {kindOptions.map((key) => {
            const Icon = kinds[key].icon;
            const selected = key === kind;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setKind(key)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "bg-primary/15 text-primary ring-1 ring-primary"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {kinds[key].short}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${base}-price`}>Preço</Label>
        <div className="relative">
          <Input
            id={`${base}-price`}
            inputMode="numeric"
            placeholder="0"
            className={cn(fieldClass, "pr-12")}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
            Kz
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${base}-link`}>Link de acesso</Label>
        <div className="relative">
          <Link2
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id={`${base}-link`}
            type="url"
            inputMode="url"
            placeholder="https://"
            className={cn(fieldClass, "pl-11")}
          />
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          O comprador só recebe este link depois de o pagamento ser confirmado.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button type="button" variant="secondary" className="h-12 rounded-2xl font-semibold">
          Guardar rascunho
        </Button>
        <Button type="button" className="h-12 rounded-2xl font-bold">
          Publicar conteúdo
        </Button>
      </div>
    </div>
  );
}
