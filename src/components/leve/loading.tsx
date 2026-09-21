import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Círculo a girar, usado em botões e carregamentos curtos. */
export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("size-5 animate-spin text-primary", className)}
      aria-hidden="true"
      role="presentation"
    />
  );
}

export function LoadingScreen({ label = "A carregar" }: { label?: string }) {
  return (
    <div className="grid min-h-[60dvh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-7" />
        <p className="text-sm text-muted-foreground">{label}…</p>
      </div>
    </div>
  );
}

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-secondary", className)} />;
}

/** Esqueleto de uma publicação do feed. */
export function PostSkeleton() {
  return (
    <article className="border-b border-border/70 px-4 py-4" aria-hidden="true">
      <div className="flex gap-3">
        <Bone className="size-11 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-3">
          <Bone className="h-3.5 w-40" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-2/3" />
          <Bone className="aspect-[4/5] w-full rounded-2xl" />
          <div className="flex gap-6">
            <Bone className="h-3 w-10" />
            <Bone className="h-3 w-10" />
            <Bone className="h-3 w-10" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-label="A carregar publicações">
      {Array.from({ length: count }, (_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <ul className="space-y-1 px-2 py-2" role="status" aria-label="A carregar">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flex items-center gap-3 px-2 py-3">
          <Bone className="size-11 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-3.5 w-32" />
            <Bone className="h-3 w-48" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 sm:px-8" role="status" aria-label="A carregar">
      {Array.from({ length: count }, (_, index) => (
        <Bone key={index} className="aspect-[4/5] w-full rounded-2xl" />
      ))}
    </div>
  );
}

/** Estado vazio elegante, com um convite para a ação seguinte. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 px-6 py-16 text-center">
      {icon && (
        <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
          {icon}
        </span>
      )}
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {description && <p className="text-sm leading-6 text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
