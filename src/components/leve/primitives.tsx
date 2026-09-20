import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Person } from "./data";

export function formatCount(value: number) {
  return value >= 1000
    ? `${(value / 1000).toLocaleString("pt-PT", { maximumFractionDigits: 1 })} mil`
    : `${value}`;
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label="LEVE">
      <span className="font-display text-[1.6rem] font-bold leading-none tracking-[0.08em]">
        LEVE
      </span>
      <span className="mt-1 size-2 rounded-full bg-story" aria-hidden="true" />
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
  onClick,
  children,
}: {
  label: string;
  count?: string;
  active?: boolean;
  pressed?: boolean;
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
        "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted-foreground transition-[color,background-color,transform] hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
        active && "text-primary hover:text-primary",
      )}
    >
      {children}
      {count !== undefined && <span className="tabular-nums">{count}</span>}
    </button>
  );
}
