import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Bell,
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
import { Avatar, IconButton, Logo, PersonLink } from "./primitives";

export const nav = [
  { key: "feed", label: "Feed", path: "/", icon: Home },
  { key: "messages", label: "Mensagens", path: "/mensagens", icon: MessagesSquare },
  { key: "profile", label: "Perfil", path: "/perfil", icon: UserRound },
] as const;

/** Navegação lateral do desktop. */
export function Sidebar({ section, onCreate }: { section: Section; onCreate: () => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border px-4 py-7 lg:flex">
      <div className="flex items-center justify-between gap-2 px-3">
        <Link
          to="/"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo />
        </Link>
        <Button asChild size="sm" className="h-8 rounded-full px-4 text-[13px]">
          <Link to="/entrar">Entrar</Link>
        </Button>
      </div>

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

/** Cabeçalho do telemóvel: logotipo, navegação e ações, tudo fixo no topo. */
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          to="/"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo />
        </Link>
        <Button asChild size="sm" className="h-8 rounded-full px-4 text-[13px]">
          <Link to="/entrar">Entrar</Link>
        </Button>
      </div>
    </header>
  );
}

/** Barra de navegação fixa no fundo do ecrã, para telemóvel. */
export function MobileTabBar({
  section,
  onCreate,
  onNotifications,
  notificationsOpen,
}: {
  section: Section;
  onCreate: () => void;
  onNotifications: () => void;
  notificationsOpen: boolean;
}) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-between px-3">
        <TabLink to="/" label="Início" selected={section === "feed"}>
          <Home className="size-[22px]" strokeWidth={section === "feed" ? 2.4 : 1.8} />
        </TabLink>

        <TabLink to="/mensagens" label="Mensagens" selected={section === "messages"} badge>
          <MessagesSquare
            className="size-[22px]"
            strokeWidth={section === "messages" ? 2.4 : 1.8}
          />
        </TabLink>

        <button
          type="button"
          onClick={onCreate}
          aria-label="Criar publicação"
          className="-mt-6 grid size-14 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-dock transition-transform active:scale-90"
        >
          <Plus className="size-[26px]" strokeWidth={2.4} />
        </button>

        <TabLink label="Notificações" selected={notificationsOpen} onClick={onNotifications}>
          <Bell className="size-[22px]" strokeWidth={notificationsOpen ? 2.4 : 1.8} />
        </TabLink>

        <TabLink to="/perfil" label="Perfil" selected={section === "profile"}>
          <Avatar
            person={me}
            size="sm"
            className={cn(
              "size-6 ring-2 ring-transparent transition-[box-shadow]",
              section === "profile" && "ring-primary",
            )}
          />
        </TabLink>
      </div>
    </nav>
  );
}

function TabLink({
  to,
  label,
  selected,
  badge = false,
  onClick,
  children,
}: {
  to?: string;
  label: string;
  selected: boolean;
  badge?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  const content = (
    <>
      <span className="relative flex items-center justify-center">
        {children}
        {badge && (
          <span className="absolute -right-1.5 -top-1 size-2 rounded-full bg-primary ring-2 ring-background" />
        )}
      </span>
      <span className="text-[11px] font-semibold leading-none">{label}</span>
    </>
  );

  const className = cn(
    "flex min-w-14 flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    selected && "text-primary",
  );

  if (!to) {
    return (
      <button type="button" aria-label={label} onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link
      to={to}
      aria-label={label}
      aria-current={selected ? "page" : undefined}
      className={className}
    >
      {content}
    </Link>
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
              <PersonLink person={item.person}>
                <Avatar person={item.person} size="sm" />
              </PersonLink>
              <PersonLink person={item.person} className="min-w-0 flex-1 hover:underline">
                <p className="text-sm leading-5">
                  <strong className="font-bold">{item.person.name.split(" ")[0]}</strong>{" "}
                  {item.text}
                </p>
              </PersonLink>
              <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
