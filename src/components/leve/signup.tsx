import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AtSign,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getProfileByUsername } from "@/lib/leve";
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
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const changeUsername = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9_.]/g, "");
    setUsername(clean);

    if (checkTimer.current) clearTimeout(checkTimer.current);
    if (clean.length < 3) {
      setUsernameStatus(clean.length > 0 ? "invalid" : "idle");
      return;
    }
    setUsernameStatus("checking");
    checkTimer.current = setTimeout(async () => {
      try {
        const existing = await getProfileByUsername(clean);
        setUsernameStatus(existing ? "taken" : "available");
      } catch {
        setUsernameStatus("idle");
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (checkTimer.current) clearTimeout(checkTimer.current);
    };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (usernameStatus === "taken") {
      setError("Esse nome de utilizador já está a ser usado. Escolhe outro.");
      return;
    }
    if (usernameStatus === "invalid" || username.length < 3) {
      setError("O nome de utilizador precisa de pelo menos 3 letras (a-z, 0-9, _ e .).");
      return;
    }
    if (usernameStatus === "checking") {
      setError("Aguarda um instante enquanto confirmamos o nome de utilizador.");
      return;
    }
    if (password !== confirm) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const existing = await getProfileByUsername(username);
      if (existing) {
        setUsernameStatus("taken");
        setError("Esse nome de utilizador já está a ser usado. Escolhe outro.");
        return;
      }
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
            <div>
              <UsernameField value={username} onChange={changeUsername} status={usernameStatus} />
              {usernameStatus === "taken" && (
                <p className="mt-1.5 px-1 text-xs font-medium text-destructive">
                  Esse nome de utilizador já está a ser usado.
                </p>
              )}
              {usernameStatus === "available" && (
                <p className="mt-1.5 px-1 text-xs font-medium text-primary">
                  Nome de utilizador disponível.
                </p>
              )}
              {usernameStatus === "invalid" && (
                <p className="mt-1.5 px-1 text-xs text-muted-foreground">
                  Mínimo de 3 letras (a-z, 0-9, _ e .).
                </p>
              )}
            </div>
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

function UsernameField({
  value,
  onChange,
  status,
}: {
  value: string;
  onChange: (value: string) => void;
  status: "idle" | "checking" | "available" | "taken" | "invalid";
}) {
  return (
    <label className="flex h-[58px] items-center gap-3 rounded-2xl bg-secondary px-4 transition-colors focus-within:ring-2 focus-within:ring-ring">
      <AtSign className="size-[18px] shrink-0 text-muted-foreground" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-semibold text-muted-foreground">Nome de utilizador</span>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="ex: utilizador123"
          required
          minLength={3}
          autoCapitalize="none"
          autoCorrect="off"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      </span>
      <span className="shrink-0" aria-live="polite">
        {status === "checking" && (
          <Loader2
            className="size-[18px] animate-spin text-muted-foreground"
            aria-label="A verificar"
          />
        )}
        {status === "available" && (
          <Check className="size-[18px] text-primary" aria-label="Disponível" />
        )}
        {(status === "taken" || status === "invalid") && (
          <X className="size-[18px] text-destructive" aria-label="Indisponível" />
        )}
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
