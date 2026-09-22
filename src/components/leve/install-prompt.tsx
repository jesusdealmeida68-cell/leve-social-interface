import { Download, Share, SquarePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/** Espera um pouco antes de sugerir a instalação, para não incomodar logo à chegada. */
const SHOW_DELAY_MS = 10_000;
/** Se a pessoa fechar o aviso, só volta a aparecer passados estes dias. */
const SNOOZE_DAYS = 14;
const SNOOZE_KEY = "leve:install-adiado";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const ipadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iphone|ipad|ipod/i.test(ua) || ipadOs;
}

function wasSnoozed() {
  try {
    const stored = Number(localStorage.getItem(SNOOZE_KEY));
    return Number.isFinite(stored) && stored > 0 && Date.now() - stored < SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function snooze() {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now()));
  } catch {
    /* sem armazenamento disponível: o aviso pode voltar a aparecer, sem problema */
  }
}

/** Notificação a sugerir instalar o LEVE no ecrã principal, com botão "Instalar". */
export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasSnoozed()) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setOpen(true);
    };
    const onInstalled = () => {
      setOpen(false);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    let timer: number | undefined;
    if (isIos()) {
      setIos(true);
      timer = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  if (!open) return null;

  const dismiss = () => {
    setOpen(false);
    snooze();
  };

  const install = async () => {
    if (!promptEvent) return;
    try {
      await promptEvent.prompt();
      await promptEvent.userChoice;
    } catch {
      /* pessoa fechou o pedido do sistema */
    }
    setPromptEvent(null);
    setOpen(false);
    snooze();
  };

  return (
    <section
      role="dialog"
      aria-label="Instalar o LEVE"
      className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md rounded-3xl border border-border bg-popover/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-6"
    >
      <div className="flex items-start gap-3">
        <img
          src="/icon-192.png"
          alt=""
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-2xl"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">Instala o LEVE</h2>
          <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
            {ios && !promptEvent
              ? "Adiciona o LEVE ao ecrã principal para abrir como uma app."
              : "Abre mais depressa, em ecrã inteiro, direto do ecrã principal."}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fechar"
          className="-mr-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {promptEvent ? (
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={install}>
            <Download className="size-4" />
            Instalar
          </Button>
          <Button variant="ghost" onClick={dismiss}>
            Agora não
          </Button>
        </div>
      ) : ios ? (
        <ol className="mt-4 space-y-2 text-sm leading-5">
          <li className="flex items-center gap-2.5 rounded-xl bg-secondary/70 px-3 py-2.5">
            <Share className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              Toca em <strong>Partilhar</strong>, na barra do navegador.
            </span>
          </li>
          <li className="flex items-center gap-2.5 rounded-xl bg-secondary/70 px-3 py-2.5">
            <SquarePlus className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              Escolhe <strong>Adicionar ao ecrã principal</strong>.
            </span>
          </li>
        </ol>
      ) : null}
    </section>
  );
}
