import { Link } from "@tanstack/react-router";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./primitives";

/** Ecrã de entrada. Apenas visual, sem autenticação real. */
export function Auth() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo />
          <p className="text-sm text-muted-foreground">Conecte-se. Assista. Curta.</p>
        </div>

        <form
          onSubmit={(event) => event.preventDefault()}
          className="space-y-3 rounded-3xl border border-border bg-card p-5"
        >
          <Field icon={Mail} label="E-mail" type="email" placeholder="exemplo@teuemail.com" />
          <Field icon={Lock} label="Palavra-passe" type="password" placeholder="••••••••" />

          <Button type="submit" className="mt-2 h-11 w-full rounded-full text-[15px]">
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ainda não tens conta?{" "}
          <Link to="/criar-conta" className="font-semibold text-primary hover:underline">
            Criar conta
          </Link>
        </p>

        <p className="mt-3 text-center text-sm text-muted-foreground">
          <Link to="/" className="font-semibold text-foreground hover:underline">
            Continuar sem conta
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  type,
  placeholder,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="flex h-11 items-center gap-2.5 rounded-2xl bg-secondary px-4 focus-within:ring-2 focus-within:ring-ring">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <input
          type={type}
          placeholder={placeholder}
          required
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </label>
  );
}
