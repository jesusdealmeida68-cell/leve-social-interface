import {
  BadgeCheck,
  Check,
  Copy,
  LayoutDashboard,
  RefreshCcw,
  Search,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./primitives";

/**
 * Página de administração — SÓ VISUAL por agora. Os dados abaixo são de exemplo;
 * quando a migração for aplicada (ver 0002_account_verification_and_admin.sql),
 * troca MOCK_ACCOUNTS por chamadas reais (adminListAccounts, adminSetVerified, etc.).
 */
type MockAccount = {
  id: string;
  name: string;
  username: string;
  phone: string;
  avatarLetter: string;
  createdAt: string;
  phoneVerified: boolean;
  badge: boolean;
  code: string;
};

const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: "1",
    name: "Luna Ferreira",
    username: "lunaoficial",
    phone: "+244 923 456 789",
    avatarLetter: "L",
    createdAt: "Há 2 horas",
    phoneVerified: false,
    badge: false,
    code: "482913",
  },
  {
    id: "2",
    name: "Rafa Domingos",
    username: "rafadomingos",
    phone: "+244 912 345 678",
    avatarLetter: "R",
    createdAt: "Há 6 horas",
    phoneVerified: true,
    badge: false,
    code: "051287",
  },
  {
    id: "3",
    name: "Bela Neto",
    username: "belaneto",
    phone: "+244 934 112 233",
    avatarLetter: "B",
    createdAt: "Ontem",
    phoneVerified: true,
    badge: true,
    code: "739021",
  },
  {
    id: "4",
    name: "Maya Fortunato",
    username: "mayaf",
    phone: "+244 945 667 890",
    avatarLetter: "M",
    createdAt: "Há 2 dias",
    phoneVerified: false,
    badge: false,
    code: "204558",
  },
];

const areas = [
  { key: "geral", label: "Visão geral", icon: LayoutDashboard },
  { key: "contas", label: "Contas", icon: Users },
  { key: "numero", label: "Verificação de número", icon: Smartphone },
  { key: "conta", label: "Verificação de conta", icon: ShieldCheck },
] as const;

type AreaKey = (typeof areas)[number]["key"];

export function Admin() {
  const [area, setArea] = useState<AreaKey>("geral");
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);

  const setPhoneVerified = (id: string, next: boolean) =>
    setAccounts((list) => list.map((a) => (a.id === id ? { ...a, phoneVerified: next } : a)));
  const setBadge = (id: string, next: boolean) =>
    setAccounts((list) => list.map((a) => (a.id === id ? { ...a, badge: next } : a)));
  const regenerateCode = (id: string) =>
    setAccounts((list) =>
      list.map((a) =>
        a.id === id
          ? {
              ...a,
              code: String(Math.floor(100000 + Math.random() * 900000)),
              phoneVerified: false,
            }
          : a,
      ),
    );

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

        {area === "geral" && <Overview accounts={accounts} />}
        {area === "contas" && <AccountsArea accounts={accounts} />}
        {area === "numero" && (
          <PhoneVerificationArea
            accounts={accounts}
            onVerify={setPhoneVerified}
            onRegenerate={regenerateCode}
          />
        )}
        {area === "conta" && <BadgeArea accounts={accounts} onToggle={setBadge} />}
      </main>
    </div>
  );
}

/* ------------------------------ Visão geral ------------------------------ */

function Overview({ accounts }: { accounts: MockAccount[] }) {
  const stats = [
    { label: "Contas", value: accounts.length, icon: Users },
    {
      label: "Números por verificar",
      value: accounts.filter((a) => !a.phoneVerified).length,
      icon: Smartphone,
    },
    { label: "Contas com selo", value: accounts.filter((a) => a.badge).length, icon: BadgeCheck },
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
        <ul className="mt-3 divide-y divide-border">
          {accounts.slice(0, 4).map((account) => (
            <li key={account.id} className="flex items-center gap-3 py-2.5">
              <AccountAvatar letter={account.avatarLetter} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{account.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{account.username}</p>
              </div>
              <span className="text-xs text-muted-foreground">{account.createdAt}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------ Contas ------------------------------ */

function AccountsArea({ accounts }: { accounts: MockAccount[] }) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const filtered = accounts.filter((a) =>
    `${a.name} @${a.username} ${a.phone}`.toLowerCase().includes(term),
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
              <AccountAvatar letter={account.avatarLetter} />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-sm font-bold">
                  {account.name}
                  {account.badge && <BadgeCheck className="size-4 shrink-0 text-primary" />}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @{account.username} · {account.phone}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusPill
                ok={account.phoneVerified}
                okLabel="Número verificado"
                noLabel="Número por verificar"
              />
              <StatusPill ok={account.badge} okLabel="Com selo" noLabel="Sem selo" />
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
  onVerify,
  onRegenerate,
}: {
  accounts: MockAccount[];
  onVerify: (id: string, next: boolean) => void;
  onRegenerate: (id: string) => void;
}) {
  const pending = accounts.filter((a) => !a.phoneVerified);
  const done = accounts.filter((a) => a.phoneVerified);

  return (
    <div>
      <Header
        title="Verificação de número"
        subtitle="O código não expira — só deixa de valer depois de ser usado uma vez. Entrega-o à pessoa (ex.: por Instagram) usando o número mostrado aqui."
      />

      <h2 className="mt-6 text-sm font-bold text-muted-foreground">
        Por entregar · {pending.length}
      </h2>
      <div className="mt-2 space-y-2">
        {pending.map((account) => (
          <CodeRow
            key={account.id}
            account={account}
            onVerify={onVerify}
            onRegenerate={onRegenerate}
          />
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
              <CodeRow
                key={account.id}
                account={account}
                onVerify={onVerify}
                onRegenerate={onRegenerate}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CodeRow({
  account,
  onVerify,
  onRegenerate,
}: {
  account: MockAccount;
  onVerify: (id: string, next: boolean) => void;
  onRegenerate: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(account.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sem acesso à área de transferência: o código continua visível no ecrã.
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <AccountAvatar letter={account.avatarLetter} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{account.name}</p>
          <p className="truncate text-xs text-muted-foreground">{account.phone}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <button
          type="button"
          onClick={copy}
          className="flex h-9 items-center gap-1.5 rounded-full bg-secondary px-3 text-sm font-semibold tabular-nums transition-colors hover:bg-accent"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {account.code}
        </button>
        <button
          type="button"
          onClick={() => onRegenerate(account.id)}
          aria-label="Gerar novo código"
          title="Gerar novo código"
          className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <RefreshCcw className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onVerify(account.id, !account.phoneVerified)}
          className={cn(
            "h-9 rounded-full px-4 text-sm font-semibold transition-colors",
            account.phoneVerified
              ? "bg-secondary text-foreground hover:bg-accent"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {account.phoneVerified ? "Marcar por verificar" : "Marcar como verificado"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Verificação de conta (selo) ------------------------------ */

function BadgeArea({
  accounts,
  onToggle,
}: {
  accounts: MockAccount[];
  onToggle: (id: string, next: boolean) => void;
}) {
  return (
    <div>
      <Header
        title="Verificação de conta"
        subtitle="Dá o selo azul a contas confirmadas. Independente da verificação de número."
      />

      <div className="mt-5 space-y-2">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <AccountAvatar letter={account.avatarLetter} />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-sm font-bold">
                  {account.name}
                  {account.badge && <BadgeCheck className="size-4 shrink-0 text-primary" />}
                </p>
                <p className="truncate text-xs text-muted-foreground">@{account.username}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggle(account.id, !account.badge)}
              className={cn(
                "h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors",
                account.badge
                  ? "bg-secondary text-foreground hover:bg-accent"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {account.badge ? "Remover selo" : "Dar selo"}
            </button>
          </div>
        ))}
      </div>
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

function AccountAvatar({ letter }: { letter: string }) {
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
