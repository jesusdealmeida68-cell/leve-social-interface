import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  Copy,
  LayoutDashboard,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  adminListAccounts,
  adminRegenerateCode,
  adminSetPhoneVerified,
  adminSetVerified,
  amIAdmin,
  type AdminAccount,
} from "@/lib/leve";
import { Logo } from "./primitives";

const areas = [
  { key: "geral", label: "Visão geral", icon: LayoutDashboard },
  { key: "contas", label: "Contas", icon: Users },
  { key: "numero", label: "Verificação de número", icon: Smartphone },
  { key: "conta", label: "Verificação de conta", icon: ShieldCheck },
] as const;

type AreaKey = (typeof areas)[number]["key"];

export function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [area, setArea] = useState<AreaKey>("geral");
  const queryClient = useQueryClient();

  const adminCheck = useQuery({
    queryKey: ["am-i-admin", user?.id ?? null],
    queryFn: amIAdmin,
    enabled: Boolean(user),
  });

  const accountsQuery = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: adminListAccounts,
    enabled: adminCheck.data === true,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });

  if (authLoading || (user && adminCheck.isLoading)) {
    return <CenteredState icon={Loader2} spin title="A verificar acesso..." />;
  }

  if (!user || adminCheck.data === false) {
    return (
      <CenteredState
        icon={ShieldCheck}
        title="Acesso restrito"
        text="Esta área é só para administradores do LEVE."
        action={
          <Button asChild>
            <Link to="/">Voltar ao início</Link>
          </Button>
        }
      />
    );
  }

  if (adminCheck.isError) {
    return (
      <CenteredState
        icon={AlertTriangle}
        title="Não foi possível verificar o acesso"
        text="Tenta atualizar a página."
      />
    );
  }

  const accounts = accountsQuery.data ?? [];

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl">
      <aside className="hidden w-60 shrink-0 border-r border-border px-4 py-6 sm:block">
        <div className="px-2">
          <Logo size="sm" />
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Administração
          </p>
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          {areas.map((item) => {
            const Icon = item.icon;
            const selected = item.key === area;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setArea(item.key)}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-full px-4 text-left text-sm font-semibold transition-colors",
                  selected
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <Icon className={cn("size-[18px]", selected && "text-primary")} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
        <nav className="mb-5 flex gap-1 overflow-x-auto pb-1 sm:hidden">
          {areas.map((item) => {
            const selected = item.key === area;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setArea(item.key)}
                className={cn(
                  "h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {accountsQuery.isLoading ? (
          <CenteredState icon={Loader2} spin title="A carregar contas..." inline />
        ) : accountsQuery.isError ? (
          <CenteredState
            icon={AlertTriangle}
            title="Não foi possível carregar as contas"
            text="Tenta atualizar a página."
            inline
            action={
              <Button variant="outline" onClick={() => accountsQuery.refetch()}>
                Tentar outra vez
              </Button>
            }
          />
        ) : (
          <>
            {area === "geral" && <Overview accounts={accounts} />}
            {area === "contas" && <AccountsArea accounts={accounts} />}
            {area === "numero" && (
              <PhoneVerificationArea accounts={accounts} onChanged={invalidate} />
            )}
            {area === "conta" && <BadgeArea accounts={accounts} onChanged={invalidate} />}
          </>
        )}
      </main>
    </div>
  );
}

/* ------------------------------ Visão geral ------------------------------ */

function Overview({ accounts }: { accounts: AdminAccount[] }) {
  const stats = [
    { label: "Contas", value: accounts.length, icon: Users },
    {
      label: "Números por verificar",
      value: accounts.filter((a) => !a.phone_verified).length,
      icon: Smartphone,
    },
    { label: "Contas com selo", value: accounts.filter((a) => a.verified).length, icon: BadgeCheck },
  ];

  return (
    <div>
      <Header title="Visão geral" subtitle="Resumo rápido do estado das contas." />
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-3xl border border-border bg-card p-5">
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <p className="mt-4 text-3xl font-bold tabular-nums">{stat.value}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-semibold">Contas recentes</h2>
        {accounts.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Ainda não há contas registadas.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {accounts.slice(0, 4).map((account) => (
              <li key={account.id} className="flex items-center gap-3 py-2.5">
                <AccountAvatar
                  letter={initialOf(account.name || account.username)}
                  src={account.avatar_url}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{account.name}</p>
                  <p className="truncate text-xs text-muted-foreground">@{account.username}</p>
                </div>
                <span className="text-xs text-muted-foreground">{timeAgo(account.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Contas ------------------------------ */

function AccountsArea({ accounts }: { accounts: AdminAccount[] }) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const filtered = accounts.filter((a) =>
    `${a.name} @${a.username} ${a.phone ?? ""}`.toLowerCase().includes(term),
  );

  return (
    <div>
      <Header
        title="Contas"
        subtitle={`${accounts.length} conta${accounts.length === 1 ? "" : "s"} registada${accounts.length === 1 ? "" : "s"}.`}
      />

      <label className="mt-4 flex h-11 max-w-sm items-center gap-3 rounded-full bg-secondary px-4">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pesquisar por nome, utilizador ou telefone"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="mt-4 space-y-2">
        {filtered.map((account) => (
          <div
            key={account.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <AccountAvatar
                letter={initialOf(account.name || account.username)}
                src={account.avatar_url}
              />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-sm font-bold">
                  {account.name}
                  {account.verified && <BadgeCheck className="size-4 shrink-0 text-primary" />}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @{account.username} · {account.phone ?? "sem telefone"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <StatusPill
                ok={account.phone_verified}
                okLabel="Número verificado"
                noLabel="Número por verificar"
              />
              <StatusPill ok={account.verified} okLabel="Com selo" noLabel="Sem selo" />
              {account.is_admin && <StatusPill ok okLabel="Administrador" noLabel="" />}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma conta encontrada.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Verificação de número ------------------------------ */

function PhoneVerificationArea({
  accounts,
  onChanged,
}: {
  accounts: AdminAccount[];
  onChanged: () => void;
}) {
  const pending = accounts.filter((a) => !a.phone_verified);
  const done = accounts.filter((a) => a.phone_verified);

  return (
    <div>
      <Header
        title="Verificação de número"
        subtitle="O código não expira — só deixa de valer depois de ser usado uma vez. Entrega-o à pessoa (ex.: por Instagram) usando o número mostrado aqui."
      />

      <h2 className="mt-6 text-sm font-bold text-muted-foreground">Por entregar · {pending.length}</h2>
      <div className="mt-2 space-y-2">
        {pending.map((account) => (
          <CodeRow key={account.id} account={account} onChanged={onChanged} />
        ))}
        {pending.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Todos os números já foram verificados.
          </p>
        )}
      </div>

      {done.length > 0 && (
        <>
          <h2 className="mt-6 text-sm font-bold text-muted-foreground">
            Já verificados · {done.length}
          </h2>
          <div className="mt-2 space-y-2">
            {done.map((account) => (
              <CodeRow key={account.id} account={account} onChanged={onChanged} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CodeRow({ account, onChanged }: { account: AdminAccount; onChanged: () => void }) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = async () => {
    if (!account.verification_code) return;
    try {
      await navigator.clipboard.writeText(account.verification_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sem acesso à área de transferência: o código continua visível no ecrã.
    }
  };

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo correu mal.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <AccountAvatar letter={initialOf(account.name || account.username)} src={account.avatar_url} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{account.name}</p>
          <p className="truncate text-xs text-muted-foreground">{account.phone ?? "sem telefone"}</p>
          {error && <p className="mt-0.5 text-xs font-medium text-destructive">{error}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <button
          type="button"
          onClick={copy}
          disabled={!account.verification_code}
          className="flex h-9 items-center gap-1.5 rounded-full bg-secondary px-3 text-sm font-semibold tabular-nums transition-colors hover:bg-accent disabled:opacity-50"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {account.verification_code ?? "——————"}
        </button>
        <button
          type="button"
          onClick={() => run(() => adminRegenerateCode(account.id))}
          disabled={busy}
          aria-label="Gerar novo código"
          title="Gerar novo código"
          className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
        >
          <RefreshCcw className={cn("size-4", busy && "animate-spin")} />
        </button>
        <button
          type="button"
          onClick={() => run(() => adminSetPhoneVerified(account.id, !account.phone_verified))}
          disabled={busy}
          className={cn(
            "h-9 rounded-full px-4 text-sm font-semibold transition-colors disabled:opacity-50",
            account.phone_verified
              ? "bg-secondary text-foreground hover:bg-accent"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {account.phone_verified ? "Marcar por verificar" : "Marcar como verificado"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Verificação de conta (selo) ------------------------------ */

function BadgeArea({ accounts, onChanged }: { accounts: AdminAccount[]; onChanged: () => void }) {
  return (
    <div>
      <Header
        title="Verificação de conta"
        subtitle="Dá o selo azul a contas confirmadas. Independente da verificação de número."
      />

      <div className="mt-5 space-y-2">
        {accounts.map((account) => (
          <BadgeRow key={account.id} account={account} onChanged={onChanged} />
        ))}
        {accounts.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Ainda não há contas registadas.
          </p>
        )}
      </div>
    </div>
  );
}

function BadgeRow({ account, onChanged }: { account: AdminAccount; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    setBusy(true);
    setError(null);
    try {
      await adminSetVerified(account.id, !account.verified);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo correu mal.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <AccountAvatar letter={initialOf(account.name || account.username)} src={account.avatar_url} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-sm font-bold">
            {account.name}
            {account.verified && <BadgeCheck className="size-4 shrink-0 text-primary" />}
          </p>
          <p className="truncate text-xs text-muted-foreground">@{account.username}</p>
          {error && <p className="mt-0.5 text-xs font-medium text-destructive">{error}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={cn(
          "h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors disabled:opacity-50",
          account.verified
            ? "bg-secondary text-foreground hover:bg-accent"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        {account.verified ? "Remover selo" : "Dar selo"}
      </button>
    </div>
  );
}

/* ------------------------------ Peças pequenas ------------------------------ */

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function AccountAvatar({ letter, src }: { letter: string; src?: string | null }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={44}
        height={44}
        className="size-11 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold">
      {letter}
    </span>
  );
}

function StatusPill({ ok, okLabel, noLabel }: { ok: boolean; okLabel: string; noLabel: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-semibold",
        ok ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
      )}
    >
      {ok ? okLabel : noLabel}
    </span>
  );
}

function CenteredState({
  icon: Icon,
  title,
  text,
  action,
  spin = false,
  inline = false,
}: {
  icon: typeof ShieldCheck;
  title: string;
  text?: string;
  action?: ReactNode;
  spin?: boolean;
  inline?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center px-6 text-center",
        inline ? "min-h-[40vh]" : "min-h-dvh",
      )}
    >
      <div>
        <Icon className={cn("mx-auto size-8 text-muted-foreground", spin && "animate-spin")} />
        <h1 className="mt-4 font-display text-xl font-semibold">{title}</h1>
        {text && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{text}</p>}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

function initialOf(value: string): string {
  return (value.trim()[0] ?? "?").toUpperCase();
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  return `há ${days} dias`;
}
