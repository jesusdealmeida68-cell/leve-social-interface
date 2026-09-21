import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  AtSign,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import heroImage from "@/assets/leve-editorial-3.jpg";
import { Logo } from "./primitives";

const badges = [
  { icon: ShieldCheck, title: "Privacidade", subtitle: "é a nossa prioridade" },
  { icon: Sparkles, title: "Conteúdo", subtitle: "seguro e verificado" },
  { icon: Zap, title: "Acesso rápido", subtitle: "e sem complicação" },
];

/** Página de criação de conta: número de telefone é a credencial, sem Google/Apple/e-mail. */
export function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await signUp({ phone, password, username, name });
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo correu mal. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-dvh bg-background text-foreground lg:grid-cols-2">
      {/* Painel editorial */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={heroImage}
          alt="Pôr do sol na costa de Luanda"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />

        <div className="relative flex h-full flex-col justify-between p-10">
          <div className="text-primary-foreground">
            <Logo />
          </div>

          <div>
            <p className="max-w-xs text-2xl font-display font-semibold leading-tight">
              Mais do que uma rede social,
              <br />
              <span className="text-primary">é uma experiência.</span>
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6">
              {badges.map(({ icon: Icon, title, subtitle }) => (
                <div key={title} className="flex flex-col items-start gap-2">
                  <Icon className="size-5 text-primary" strokeWidth={2.25} />
                  <p className="text-xs leading-snug text-muted-foreground">
                    <span className="block font-semibold text-foreground">{title}</span>
                    {subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex flex-col px-5 py-6 sm:px-10 sm:py-10 lg:overflow-y-auto lg:px-16">
        <div className="flex items-center justify-between">
          <Link
            to="/entrar"
            aria-label="Voltar"
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <p className="text-sm text-muted-foreground">
            Já tens uma conta?{" "}
            <Link to="/entrar" className="font-semibold text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <div className="mx-auto w-full max-w-md flex-1 pt-8 lg:pt-14">
          <div className="mb-3 lg:hidden">
            <Logo />
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight">
            Cria a tua conta
            <br />
            <span className="text-primary">e começa agora</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">É rápido, fácil e gratuito.</p>

          <form onSubmit={submit} className="mt-7 space-y-3">
            <Field
              icon={User}
              label="O teu nome"
              type="text"
              placeholder="Como te chamas?"
              value={name}
              onChange={setName}
            />
            <Field
              icon={AtSign}
              label="Nome de utilizador"
              type="text"
              placeholder="ex: utilizador123"
              value={username}
              onChange={setUsername}
            />
            <Field
              icon={Phone}
              label="Número de telefone"
              type="tel"
              placeholder="9XX XXX XXX"
              value={phone}
              onChange={setPhone}
            />

            <PasswordField
              icon={Lock}
              label="Palavra-passe"
              placeholder="Mínimo de 6 caracteres"
              visible={showPassword}
              value={password}
              onChange={setPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
            <PasswordField
              icon={Lock}
              label="Confirmar palavra-passe"
              placeholder="Repete a palavra-passe"
              visible={showConfirm}
              value={confirm}
              onChange={setConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
            />

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="mt-4 h-12 w-full rounded-full text-[15px]"
            >
              {loading ? "A criar conta..." : "Criar conta"}
            </Button>
          </form>

          <p className="mt-8 pb-6 text-center text-xs leading-relaxed text-muted-foreground">
            Ao criar uma conta, concordas com os nossos{" "}
            <a href="#" className="font-medium text-foreground hover:underline">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="#" className="font-medium text-foreground hover:underline">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  type,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex h-[58px] items-center gap-3 rounded-2xl bg-secondary px-4 transition-colors focus-within:ring-2 focus-within:ring-ring">
      <Icon className="size-[18px] shrink-0 text-muted-foreground" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      </span>
    </label>
  );
}

function PasswordField({
  icon: Icon,
  label,
  placeholder,
  visible,
  value,
  onChange,
  onToggle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  placeholder: string;
  visible: boolean;
  value: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <label className="flex h-[58px] items-center gap-3 rounded-2xl bg-secondary px-4 transition-colors focus-within:ring-2 focus-within:ring-ring">
      <Icon className="size-[18px] shrink-0 text-muted-foreground" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          minLength={6}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      </span>
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </label>
  );
}
