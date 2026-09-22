import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Bell, Home, LogOut, MessagesSquare, PenLine, Plus, UserRound, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  countUnreadMessages,
  countUnreadNotifications,
  listNotifications,
  myPhoneVerified,
  timeAgo,
} from "@/lib/leve";
import { Avatar, IconButton, Logo, PersonLink } from "./primitives";
import { VerifyPhoneBanner } from "./verify-phone";
import type { Section } from "./data";

export const nav = [
  { key: "feed", label: "Feed", path: "/", icon: Home },
  { key: "messages", label: "Mensagens", path: "/mensagens", icon: MessagesSquare },
  { key: "profile", label: "Perfil", path: "/perfil", icon: UserRound },
] as const;

/** Navegação lateral do desktop. */
export function Sidebar({ section, onCreate }: { section: Section; onCreate: () => void }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: unreadMessages } = useQuery({
    queryKey: ["unread-messages", user?.id ?? null],
    queryFn: () => countUnreadMessages(user!.id),
    enabled: Boolean(user),
    refetchInterval: 15000,
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border px-4 py-7 lg:flex">
      <div className="flex items-center justify-between gap-2 px-3">
        <Link
          to="/"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo />
        </Link>
        {!user && (
          <Button asChild size="sm" className="h-8 rounded-full px-4 text-[13px]">
            <Link to="/entrar">Entrar</Link>
          </Button>
        )}
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
              {item.key === "messages" && Boolean(unreadMessages) && (
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

      {user && profile && (
        <div className="mt-auto flex items-center gap-1 rounded-full pr-1 transition-colors hover:bg-accent/60">
          <Link
            to="/perfil"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-full p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar person={profile} size="md" />
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-bold">{profile.name}</span>
              <span className="block truncate text-[13px] text-muted-foreground">
                @{profile.username}
              </span>
            </span>
          </Link>
          <IconButton
            label="Sair da conta"
            onClick={() => {
              signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4" />
          </IconButton>
        </div>
      )}
    </aside>
  );
}

/** Cabeçalho do telemóvel: logotipo, navegação e ações, tudo fixo no topo. */
export function MobileHeader() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          to="/"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo />
        </Link>
        {!user && (
          <Button asChild size="sm" className="h-8 rounded-full px-4 text-[13px]">
            <Link to="/entrar">Entrar</Link>
          </Button>
        )}
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
  const { user, profile } = useAuth();
  const { data: unreadMessages } = useQuery({
    queryKey: ["unread-messages", user?.id ?? null],
    queryFn: () => countUnreadMessages(user!.id),
    enabled: Boolean(user),
    refetchInterval: 15000,
  });
  const { data: unreadNotifications } = useQuery({
    queryKey: ["unread-notifications", user?.id ?? null],
    queryFn: () => countUnreadNotifications(user!.id),
    enabled: Boolean(user),
    refetchInterval: 15000,
  });

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-between px-3">
        <TabLink to="/" label="Início" selected={section === "feed"}>
          <Home className="size-[22px]" strokeWidth={section === "feed" ? 2.4 : 1.8} />
        </TabLink>

        <TabLink
          to="/mensagens"
          label="Mensagens"
          selected={section === "messages"}
          badge={Boolean(unreadMessages)}
        >
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

        <TabLink
          label="Notificações"
          selected={notificationsOpen}
          badge={Boolean(unreadNotifications)}
          onClick={onNotifications}
        >
          <Bell className="size-[22px]" strokeWidth={notificationsOpen ? 2.4 : 1.8} />
        </TabLink>

        <TabLink to="/perfil" label="Perfil" selected={section === "profile"}>
          {profile ? (
            <Avatar
              person={profile}
              size="sm"
              className={cn(
                "size-6 ring-2 ring-transparent transition-[box-shadow]",
                section === "profile" && "ring-primary",
              )}
            />
          ) : (
            <UserRound className="size-[22px]" strokeWidth={section === "profile" ? 2.4 : 1.8} />
          )}
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
  const { user } = useAuth();
  const { data: items } = useQuery({
    queryKey: ["notifications", user?.id ?? null],
    queryFn: () => listNotifications(user!.id),
    enabled: open && Boolean(user),
  });
  const { data: phoneVerified } = useQuery({
    queryKey: ["my-phone-verified", user?.id ?? null],
    queryFn: myPhoneVerified,
    enabled: Boolean(user),
  });

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
        {user && (
          <div className="px-1 pb-1">
            <VerifyPhoneBanner verified={Boolean(phoneVerified)} />
          </div>
        )}
        <ul>
          {!user ? (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">
              Entra para ver as tuas notificações.
            </li>
          ) : items && items.length > 0 ? (
            items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-accent/60"
              >
                {item.actor ? (
                  <>
                    <PersonLink person={item.actor}>
                      <Avatar person={item.actor} size="sm" />
                    </PersonLink>
                    <PersonLink person={item.actor} className="min-w-0 flex-1 hover:underline">
                      <p className="text-sm leading-5">
                        <strong className="font-bold">{item.actor.name.split(" ")[0]}</strong>{" "}
                        {item.body}
                      </p>
                    </PersonLink>
                  </>
                ) : (
                  <p className="min-w-0 flex-1 text-sm leading-5">{item.body}</p>
                )}
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(item.created_at)}
                </span>
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">
              Ainda sem notificações.
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
