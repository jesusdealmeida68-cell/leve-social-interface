import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./primitives";

const modes = [
  { key: "entrar", label: "Entrar" },
  { key: "criar", label: "Criar conta" },
] as const;

type Mode = (typeof modes)[number]["key"];

/** Ecrã de acesso: entrar ou criar conta. Apenas visual, sem autenticação real. */
export function Auth() {
  const [mode, setMode] = useState<Mode>("entrar");
  const isCreate = mode === "criar";

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo />
          <p className="text-sm text-muted-foreground">Conecte-se. Assista. Curta.</p>
        </div>

        <div
          role="tablist"
          aria-label="Acesso"
          className="mb-6 inline-flex w-full gap-1 rounded-full bg-secondary p-1"
        >
          {modes.map((item) => {
            const selected = item.key === mode;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setMode(item.key)}
                className={cn(
                  "h-10 flex-1 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <form
          onSubmit={(event) => event.preventDefault()}
          className="space-y-3 rounded-3xl border border-border bg-card p-5"
        >
          <Field label="Número de telefone" type="tel" placeholder="+244 900 000 000" />
          <Field label="Senha" type="password" placeholder="••••••••" />
          {isCreate && <Field label="Confirmar senha" type="password" placeholder="••••••••" />}

          <Button type="submit" className="mt-2 h-11 w-full rounded-full text-[15px]">
            {isCreate ? "Criar conta" : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="font-semibold text-foreground hover:underline">
            Continuar sem conta
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        required
        className="h-11 w-full rounded-2xl bg-secondary px-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
