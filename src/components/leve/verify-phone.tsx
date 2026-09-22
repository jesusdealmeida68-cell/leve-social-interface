import { useQueryClient } from "@tanstack/react-query";
import { Clock, ShieldCheck, ShieldOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { verifyMyAccount } from "@/lib/leve";

/**
 * Aviso + modal de verificação de número, mostrado na página de notificações.
 * Liga a `verify_my_account`: o código só é aceite se for mesmo o que o admin
 * gerou/entregou para esta conta em "Administração → Verificação de número",
 * e deixa de funcionar assim que é usado com sucesso.
 */
export function VerifyPhoneBanner({ verified }: { verified: boolean }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  if (verified) return null;

  return (
    <>
      <div className="mx-1 mb-1 flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-3.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          <Clock className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">O teu número ainda não está verificado</p>
          <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">
            Conta criada — em até 48 horas vais receber um SMS com o teu código.
          </p>
          <Button
            size="sm"
            className="mt-2 h-8 rounded-full px-4 text-[13px]"
            onClick={() => setOpen(true)}
          >
            Inserir código
          </Button>
        </div>
      </div>

      <VerifyPhoneModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirmed={() => {
          setOpen(false);
          queryClient.invalidateQueries({ queryKey: ["my-phone-verified"] });
        }}
      />
    </>
  );
}

function VerifyPhoneModal({
  open,
  onClose,
  onConfirmed,
}: {
  open: boolean;
  onClose: () => void;
  onConfirmed: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (code.trim().length !== 6) {
      setError("O código tem 6 dígitos.");
      return;
    }
    setChecking(true);
    try {
      const correct = await verifyMyAccount(code.trim());
      if (correct) {
        onConfirmed();
      } else {
        setError("Código incorreto. Confirma o código que recebeste.");
      }
    } catch {
      setError("Não foi possível verificar agora. Tenta novamente.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
          setCode("");
          setError(null);
        }
      }}
    >
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-sm rounded-3xl text-center">
        <DialogHeader className="items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-7" />
          </span>
          <DialogTitle className="mt-2 font-display text-xl">Verificar número</DialogTitle>
          <DialogDescription>
            Introduz o código de 6 dígitos que recebeste por SMS.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 space-y-3">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoFocus
            disabled={checking}
            placeholder="000000"
            aria-label="Código de verificação"
            className="h-14 w-full rounded-2xl bg-secondary text-center text-2xl font-bold tracking-[0.5em] outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <Button type="submit" disabled={checking} className="h-11 w-full rounded-full">
            {checking ? "A confirmar..." : "Confirmar"}
          </Button>
          <button
            type="button"
            onClick={onClose}
            disabled={checking}
            className="flex w-full items-center justify-center gap-1.5 py-1 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-60"
          >
            <ShieldOff className="size-3.5" />
            Verificar mais tarde
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
