import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AtSign,
  Calendar,
  ChevronLeft,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/leve-editorial-3.jpg";
import { Logo } from "./primitives";

const currentYear = new Date().getFullYear();
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const years = Array.from({ length: 63 }, (_, i) => currentYear - 18 - i);

const badges = [
  { icon: ShieldCheck, title: "Privacidade", subtitle: "é a nossa prioridade" },
  { icon: Sparkles, title: "Conteúdo", subtitle: "seguro e verificado" },
  { icon: Zap, title: "Acesso rápido", subtitle: "e sem complicação" },
];

/** Página de criação de conta: painel editorial + formulário completo. */
export function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

          <form onSubmit={(event) => event.preventDefault()} className="mt-7 space-y-3">
            <Field
              icon={Mail}
              label="O teu e-mail"
              type="email"
              placeholder="exemplo@teuemail.com"
            />
            <Field
              icon={AtSign}
              label="Nome de utilizador"
              type="text"
              placeholder="ex: utilizador123"
            />

            <PasswordField
              icon={Lock}
              label="Palavra-passe"
              placeholder="Mínimo de 6 caracteres"
              visible={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
            <PasswordField
              icon={Lock}
              label="Confirmar palavra-passe"
              placeholder="Repete a palavra-passe"
              visible={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
            />

            <div>
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Calendar className="size-3.5" />
                Data de nascimento
              </span>
              <div className="grid grid-cols-3 gap-2">
                <SelectBox label="Dia" defaultValue="">
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </SelectBox>
                <SelectBox label="Mês" defaultValue="">
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </SelectBox>
                <SelectBox label="Ano" defaultValue="">
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </SelectBox>
              </div>
            </div>

            <div>
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <User className="size-3.5" />
                Género (opcional)
              </span>
              <SelectBox label="Selecione" defaultValue="" full>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="outro">Outro</option>
                <option value="prefiro-nao-dizer">Prefiro não dizer</option>
              </SelectBox>
            </div>

            <div>
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Globe className="size-3.5" />
                País
              </span>
              <SelectBox label="País" defaultValue="Angola" full>
                <option value="Angola">Angola</option>
                <option value="Portugal">Portugal</option>
                <option value="Brasil">Brasil</option>
                <option value="Moçambique">Moçambique</option>
                <option value="Cabo Verde">Cabo Verde</option>
                <option value="Guiné-Bissau">Guiné-Bissau</option>
                <option value="São Tomé e Príncipe">São Tomé e Príncipe</option>
                <option value="Outro">Outro</option>
              </SelectBox>
            </div>

            <Button type="submit" className="mt-4 h-12 w-full rounded-full text-[15px]">
              Criar conta
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou cadastra-te com
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11 rounded-full">
              <GoogleIcon className="size-4" />
              Google
            </Button>
            <Button variant="outline" className="h-11 rounded-full">
              <AppleIcon className="size-4" />
              Apple
            </Button>
          </div>

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
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <label className="flex h-[58px] items-center gap-3 rounded-2xl bg-secondary px-4 transition-colors focus-within:ring-2 focus-within:ring-ring">
      <Icon className="size-[18px] shrink-0 text-muted-foreground" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
        <input
          type={type}
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
  onToggle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex h-[58px] items-center gap-3 rounded-2xl bg-secondary px-4 transition-colors focus-within:ring-2 focus-within:ring-ring">
      <Icon className="size-[18px] shrink-0 text-muted-foreground" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
        <input
          type={visible ? "text" : "password"}
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

function SelectBox({
  label,
  defaultValue,
  full = false,
  children,
}: {
  label: string;
  defaultValue: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex h-[46px] items-center rounded-2xl bg-secondary px-3.5",
        full && "h-[46px]",
      )}
    >
      <select
        defaultValue={defaultValue}
        aria-label={label}
        required
        className="w-full appearance-none bg-transparent text-sm text-foreground outline-none [&>option]:bg-popover"
      >
        <option value="" disabled hidden>
          {label}
        </option>
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3.5 size-3.5 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A11.998 11.998 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.27A11.998 11.998 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.62l4 3.1c.95-2.85 3.6-4.95 6.73-4.95Z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.36 1.43c0 1.14-.42 2.2-1.24 3.05-.97 1.03-2.16 1.61-3.36 1.51a3.48 3.48 0 0 1-.03-.44c0-1.09.48-2.16 1.24-2.94C13.8.83 15.1.2 16.2.14c.1.4.16.83.16 1.29ZM20.6 17.18c-.57 1.28-.84 1.85-1.58 2.98-1.03 1.57-2.49 3.53-4.29 3.55-1.6.02-2.01-1.04-4.18-1.03-2.16.01-2.62 1.05-4.22 1.03-1.8-.02-3.18-1.78-4.21-3.35C-.03 16.24-.38 11.2 1.4 8.55c1.26-1.87 3.26-2.97 5.13-2.97 1.9 0 3.1 1.05 4.67 1.05 1.52 0 2.44-1.05 4.67-1.05 1.67 0 3.44.91 4.7 2.48-4.14 2.27-3.46 8.18.03 9.12Z" />
    </svg>
  );
}
