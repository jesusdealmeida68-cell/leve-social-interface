import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Person, Post } from "./data";
import leveIcon from "@/assets/leve-icon.png";

export function formatCount(value: number) {
  return value >= 1000
    ? `${(value / 1000).toLocaleString("pt-PT", { maximumFractionDigits: 1 })} mil`
    : `${value}`;
}

const logoIconSizes = {
  sm: "size-6",
  md: "size-7",
  lg: "size-9",
} as const;

const logoTextSizes = {
  sm: "text-xl",
  md: "text-[1.75rem]",
  lg: "text-4xl",
} as const;

export function Logo({
  size = "md",
  className,
}: {
  size?: keyof typeof logoIconSizes;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} aria-label="LEVE">
      <img
        src={leveIcon}
        alt=""
        aria-hidden="true"
        className={cn(logoIconSizes[size], "shrink-0 object-contain")}
      />
      <span className={cn("font-logo leading-none tracking-normal", logoTextSizes[size])}>
        Leve
      </span>
    </span>
  );
}

const avatarSizes = {
  sm: { box: "size-9", text: "text-xs" },
  md: { box: "size-11", text: "text-sm" },
  xl: { box: "size-16", text: "text-lg" },
  lg: { box: "size-24", text: "text-2xl" },
} as const;

export function Avatar({
  person,
  size = "md",
  className,
}: {
  person: Person;
  size?: keyof typeof avatarSizes;
  className?: string;
}) {
  const { box, text } = avatarSizes[size];

  if (!person.image) {
    const initials = person.name
      .split(" ")
      .map((word) => word.charAt(0))
      .slice(0, 2)
      .join("");
    return (
      <span
        role="img"
        aria-label={`Foto de ${person.name}`}
        className={cn(
          box,
          text,
          "grid shrink-0 place-items-center rounded-full bg-story font-display font-bold text-primary-foreground",
          className,
        )}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={person.image}
      alt={`Foto de ${person.name}`}
      className={cn(box, "shrink-0 rounded-full object-cover", className)}
      width={96}
      height={96}
    />
  );
}

export function IconButton({
  label,
  children,
  onClick,
  active = false,
  className,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "text-muted-foreground hover:text-foreground",
        active && "text-primary hover:text-primary",
        className,
      )}
    >
      {children}
    </Button>
  );
}

/** Botão de ação de uma publicação (curtir, comentar, guardar…). Compacto, nunca esticado. */
export function ActionButton({
  label,
  count,
  active = false,
  pressed,
  tone = "primary",
  onClick,
  children,
}: {
  label: string;
  count?: string;
  active?: boolean;
  pressed?: boolean;
  tone?: "primary" | "like";
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-muted-foreground transition-[color,background-color,transform] hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90",
        active &&
          (tone === "like"
            ? "bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive"
            : "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"),
      )}
    >
      {children}
      {count !== undefined && <span className="tabular-nums">{count}</span>}
    </button>
  );
}

/** Miniatura de publicação para grelhas de 2 colunas (feed e perfil). Vídeo abre a página de assistir. */
export function PostThumb({ post, onOpen }: { post: Post; onOpen: () => void }) {
  const content = (
    <>
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
    </>
  );

  const className =
    "group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-secondary text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (post.video) {
    return (
      <Link
        to="/video/$postId"
        params={{ postId: String(post.id) }}
        aria-label={`Assistir vídeo: ${post.caption}`}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Abrir publicação: ${post.caption}`}
      className={className}
    >
      {content}
    </button>
  );
}
