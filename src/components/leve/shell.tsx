import { Link } from "@tanstack/react-router";
import {
  Bell,
  Film,
  Home,
  MessagesSquare,
  MoreHorizontal,
  PenLine,
  Plus,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { me, notifications, type Section } from "./data";
import { Avatar, IconButton, Logo } from "./primitives";

export const nav = [
  { key: "feed", label: "Feed", path: "/", icon: Home },
  { key: "messages", label: "Mensagens", path: "/mensagens", icon: MessagesSquare },
  { key: "stories", label: "História", path: "/historia", icon: Film },
  { key: "profile", label: "Perfil", path: "/perfil", icon: UserRound },
] as const;

/** Navegação lateral do desktop. */
export function Sidebar({ section, onCreate }: { section: Section; onCreate: () => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border px-4 py-7 lg:flex">
      <Link
        to="/"
        className="rounded-full px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Logo />
      </Link>

      <nav className="mt-10 flex flex-col gap-1" aria-label="Navegação principal">
        {nav.map((item) => {
          const Icon = item.icon;
          const selected = item.key === section;
          return (
            <Link
              key={item.key}
              to={item.path}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "flex h-12 items-center gap-3.5 rounded-full px-4 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <Icon
                className={cn("size-[22px]", selected && "text-primary")}
                strokeWidth={selected ? 2.3 : 1.8}
              />
              <span>{item.label}</span>
              {item.key === "messages" && (
                <span
                  className="ml-auto size-2 rounded-full bg-primary"
                  aria-label="Mensagens por ler"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <Button className="mt-6 h-12 w-full text-[15px]" onClick={onCreate}>
        <PenLine className="size-[18px]" />
        Criar publicação
      </Button>

      <Link
        to="/perfil"
        className="mt-auto flex items-center gap-3 rounded-full p-2 pr-4 transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar person={me} size="md" />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-bold">{me.name}</span>
          <span className="block truncate text-[13px] text-muted-foreground">{me.handle}</span>
        </span>
        <MoreHorizontal className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </aside>
  );
}

/** Cabeçalho do telemóvel: logotipo à esquerda, ações à direita. */
export function MobileHeader({
  onCreate,
  onNotifications,
  notificationsOpen,
}: {
  onCreate: () => void;
  onNotifications: () => void;
  notificationsOpen: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
      <Link
        to="/"
        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Logo />
      </Link>
      <div className="-mr-2 flex items-center">
        <IconButton label="Criar publicação" onClick={onCreate}>
          <Plus className="size-[22px]" />
        </IconButton>
        <IconButton label="Notificações" active={notificationsOpen} onClick={onNotifications}>
          <Bell className="size-[22px]" />
        </IconButton>
      </div>
    </header>
  );
}

/** Barra inferior flutuante: compacta, com o item ativo em destaque e etiqueta. */
export function BottomDock({ section }: { section: Section }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-popover/85 p-1.5 shadow-dock backdrop-blur-xl">
        {nav.map((item) => {
          const Icon = item.icon;
          const selected = item.key === section;
          return (
            <Link
              key={item.key}
              to={item.path}
              aria-label={item.label}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "relative flex h-12 items-center justify-center gap-2 rounded-full text-sm font-bold transition-[background-color,color,padding] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "bg-primary px-5 text-primary-foreground"
                  : "w-12 text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-[22px]" strokeWidth={selected ? 2.3 : 1.8} />
              {selected && <span>{item.label}</span>}
              {item.key === "messages" && !selected && (
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary ring-2 ring-popover" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <>
      <button
        type="button"
        aria-label="Fechar notificações"
        className="fixed inset-0 z-[35] cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label="Notificações"
        className="fixed right-4 top-16 z-50 w-[min(360px,calc(100vw-2rem))] rounded-3xl border border-border bg-popover p-2 shadow-2xl animate-in fade-in-0 zoom-in-95 lg:right-8 lg:top-20"
      >
        <div className="flex items-center justify-between py-1 pl-4 pr-1">
          <h2 className="font-display text-base font-semibold">Notificações</h2>
          <IconButton label="Fechar" onClick={onClose}>
            <X />
          </IconButton>
        </div>
        <ul>
          {notifications.map((item) => (
            <li
              key={item.person.handle}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-accent/60"
            >
              <Avatar person={item.person} size="sm" />
              <p className="min-w-0 flex-1 text-sm leading-5">
                <strong className="font-bold">{item.person.name.split(" ")[0]}</strong> {item.text}
              </p>
              <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
