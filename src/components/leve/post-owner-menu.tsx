import { useNavigate } from "@tanstack/react-router";
import { Check, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { deletePost, updatePost, type Post } from "@/lib/leve";
import { IconButton } from "./primitives";

/**
 * Menu "editar / eliminar" para a autora ou o autor de uma publicação.
 * Ao guardar ou eliminar, atualiza logo o feed e as publicações do perfil.
 */
export function PostOwnerMenu({ post }: { post: Post }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["feed"] });
    queryClient.invalidateQueries({ queryKey: ["posts-by-user"] });
  };

  const save = useMutation({
    mutationFn: (caption: string) => updatePost(post.id, caption),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
      refresh();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    },
  });

  const remove = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      refresh();
      navigate({ to: "/" });
    },
  });

  const submitEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const caption = new FormData(event.currentTarget).get("caption");
    save.mutate(typeof caption === "string" ? caption.trim() : "");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="Opções da publicação">
            <MoreHorizontal />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5">
          <DropdownMenuItem className="gap-3 rounded-xl py-2.5" onSelect={() => setEditing(true)}>
            <Pencil className="size-4" /> Editar publicação
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-3 rounded-xl py-2.5 text-destructive focus:text-destructive"
            onSelect={() => setDeleting(true)}
          >
            <Trash2 className="size-4" /> Eliminar publicação
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmação visual breve depois de guardar a edição. */}
      {saved && (
        <div
          role="status"
          className="fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-[60] flex justify-center px-4"
        >
          <p className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-lg animate-in fade-in-0 slide-in-from-top-2">
            <Check className="size-4" />
            Publicação atualizada
          </p>
        </div>
      )}

      <Dialog open={editing} onOpenChange={(open) => !save.isPending && setEditing(open)}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-md rounded-3xl">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-xl">Editar publicação</DialogTitle>
            <DialogDescription>Altera a legenda desta publicação.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEdit} className="grid gap-4">
            <Textarea
              name="caption"
              defaultValue={post.caption}
              placeholder="Escreve uma legenda..."
              autoFocus
              className="min-h-28 resize-none rounded-2xl border-transparent bg-secondary px-4 py-3 shadow-none"
            />
            <Button type="submit" disabled={save.isPending} className="h-12 rounded-2xl font-bold">
              {save.isPending ? "A guardar..." : "Guardar alterações"}
            </Button>
            {save.isError && (
              <p className="text-sm text-destructive">Não foi possível guardar. Tenta novamente.</p>
            )}
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting} onOpenChange={(open) => !remove.isPending && setDeleting(open)}>
        <AlertDialogContent className="max-w-sm rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar publicação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A publicação, os gostos e os comentários vão
              desaparecer para sempre.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending}
              onClick={(event) => {
                event.preventDefault();
                remove.mutate();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {remove.isPending ? "A eliminar..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
          {remove.isError && (
            <p className="text-center text-sm text-destructive">
              Não foi possível eliminar. Tenta novamente.
            </p>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
