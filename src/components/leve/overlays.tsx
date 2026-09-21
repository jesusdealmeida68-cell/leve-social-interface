import { Heart, ImagePlus, MessageCircle, Plus, Send, Video as VideoIcon, X } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import {
  addComment,
  createPost,
  listComments,
  MAX_POST_MEDIA,
  timeAgo,
  toggleLike,
  uploadMedia,
  type Post,
} from "@/lib/leve";
import { ActionButton, Avatar, PersonLink, formatCount } from "./primitives";

/* ------------------------------ Criar ------------------------------ */

export type ComposerMode = "post" | null;

export function Composer({ mode, onClose }: { mode: ComposerMode; onClose: () => void }) {
  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-lg gap-0 overflow-y-auto rounded-3xl p-0">
        {/* O conteúdo só existe enquanto o diálogo está aberto, por isso o estado reinicia sozinho. */}
        {mode && <ComposerBody onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

type Picked = { id: string; file: File; url: string; kind: "image" | "video" };

function ComposerBody({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [picked, setPicked] = useState<Picked[]>([]);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(0);

  /* liberta as pré-visualizações ao fechar */
  const pickedRef = useRef(picked);
  pickedRef.current = picked;
  useEffect(() => () => pickedRef.current.forEach((item) => URL.revokeObjectURL(item.url)), []);

  const publish = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Precisas de entrar para publicar.");
      setSent(0);
      const media = await Promise.all(
        picked.map(async ({ file }) => {
          const uploaded = await uploadMedia(file, user.id);
          setSent((count) => count + 1);
          return uploaded;
        }),
      );
      await createPost({ userId: user.id, caption, media });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["posts-by-user"] });
      onClose();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Algo correu mal."),
  });

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setError(null);
    const valid = Array.from(files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/"),
    );
    if (valid.length < files.length) setError("Só podes juntar fotos e vídeos.");
    const room = MAX_POST_MEDIA - picked.length;
    if (valid.length > room) setError(`Uma publicação pode ter até ${MAX_POST_MEDIA} ficheiros.`);
    const added: Picked[] = valid.slice(0, Math.max(room, 0)).map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      kind: file.type.startsWith("video/") ? "video" : "image",
    }));
    setPicked((current) => [...current, ...added]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (id: string) => {
    setPicked((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((item) => item.id !== id);
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (picked.length === 0 && !caption.trim()) {
      setError("Adiciona fotos, vídeos ou escreve algo.");
      return;
    }
    publish.mutate();
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Entra para publicar</DialogTitle>
          <DialogDescription>Precisas de uma conta para criar publicações.</DialogDescription>
        </DialogHeader>
        <Button asChild className="mt-4">
          <Link to="/entrar" onClick={onClose}>
            Entrar
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="p-5">
      <DialogHeader className="text-left">
        <DialogTitle className="font-display text-xl">Nova publicação</DialogTitle>
        <DialogDescription>
          Junta várias fotos e vídeos na mesma publicação, com legenda opcional.
        </DialogDescription>
      </DialogHeader>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(event) => addFiles(event.target.files)}
      />

      <div className="mt-4">
        {picked.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid aspect-[4/3] w-full place-items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/60 text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <ImagePlus className="size-6" />
            </span>
            <span className="text-sm font-semibold">Adicionar fotos e vídeos</span>
            <span className="text-xs">Até {MAX_POST_MEDIA} ficheiros, misturados se quiseres</span>
          </button>
        ) : (
          <>
            <ul className="grid grid-cols-3 gap-2">
              {picked.map((item, position) => (
                <li
                  key={item.id}
                  className="relative aspect-square overflow-hidden rounded-xl bg-secondary"
                >
                  {item.kind === "video" ? (
                    <video src={item.url} muted playsInline className="size-full object-cover" />
                  ) : (
                    <img src={item.url} alt="" className="size-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    disabled={publish.isPending}
                    aria-label={`Remover ficheiro ${position + 1}`}
                    className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white transition-transform hover:bg-black/75 active:scale-90 disabled:opacity-50"
                  >
                    <X className="size-4" />
                  </button>
                  {item.kind === "video" && (
                    <span className="absolute bottom-1.5 left-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white">
                      <VideoIcon className="size-3.5" />
                    </span>
                  )}
                  {position === 0 && picked.length > 1 && (
                    <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                      Capa
                    </span>
                  )}
                </li>
              ))}
              {picked.length < MAX_POST_MEDIA && (
                <li>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={publish.isPending}
                    aria-label="Adicionar mais fotos ou vídeos"
                    className="grid aspect-square w-full place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <Plus className="size-6" />
                  </button>
                </li>
              )}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              {picked.length} de {MAX_POST_MEDIA} ficheiros
            </p>
          </>
        )}
      </div>

      <textarea
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
        aria-label="Legenda"
        placeholder="Escreve uma legenda (opcional)..."
        className="mt-4 min-h-20 w-full resize-none rounded-2xl bg-secondary p-4 text-[15px] leading-6 outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />

      {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Visível para todos</p>
        <Button type="submit" disabled={publish.isPending}>
          {publish.isPending
            ? picked.length > 1
              ? `A enviar ${sent}/${picked.length}...`
              : "A publicar..."
            : "Publicar"}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------ Publicação ------------------------------ */

/** Curtir/comentar + lista de comentários + campo para escrever. Usado na página de assistir vídeo. */
export function CommentsSection({ post }: { post: Post }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: comments } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => listComments(post.id),
  });

  const like = useMutation({
    mutationFn: (next: boolean) => toggleLike(post.id, user!.id, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
      queryClient.invalidateQueries({ queryKey: ["posts-by-user"] });
    },
  });

  const send = useMutation({
    mutationFn: (text: string) => addComment(post.id, user!.id, text),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
    },
  });

  const requireAuth = () => {
    if (!user) navigate({ to: "/entrar" });
    return Boolean(user);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = comment.trim();
    if (!text || !requireAuth()) return;
    send.mutate(text);
  };

  return (
    <>
      <div className="mt-4 flex items-center gap-1 pl-1">
        <ActionButton
          label="Curtir"
          pressed={post.likedByMe}
          active={post.likedByMe}
          tone="like"
          count={formatCount(post.likes)}
          onClick={() => requireAuth() && like.mutate(!post.likedByMe)}
        >
          <Heart
            className="size-[22px]"
            strokeWidth={1.8}
            fill={post.likedByMe ? "currentColor" : "none"}
          />
        </ActionButton>
        <ActionButton label="Comentários" count={formatCount(post.comments)}>
          <MessageCircle className="size-[22px]" strokeWidth={1.8} />
        </ActionButton>
      </div>

      <ul className="mt-4 space-y-4 border-t border-border pt-4">
        {comments && comments.length > 0 ? (
          comments.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <PersonLink person={item.author}>
                <Avatar person={item.author} size="sm" />
              </PersonLink>
              <p className="min-w-0 break-words text-sm leading-5">
                <PersonLink person={item.author} className="inline hover:underline">
                  <strong className="mr-1.5 font-bold">@{item.author.username}</strong>
                </PersonLink>
                {item.text}
                <span className="ml-2 text-xs text-muted-foreground">
                  {timeAgo(item.created_at)}
                </span>
              </p>
            </li>
          ))
        ) : (
          <li className="py-2 text-center text-sm text-muted-foreground">
            Ainda sem comentários. Sê a primeira pessoa a comentar.
          </li>
        )}
      </ul>

      <form
        onSubmit={submit}
        className="mt-5 flex items-center gap-1 rounded-full bg-secondary p-1.5 transition-shadow focus-within:ring-2 focus-within:ring-ring md:mt-auto"
      >
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          aria-label="Escrever comentário"
          placeholder="Escrever comentário..."
          className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Enviar comentário"
          disabled={!comment.trim() || send.isPending}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-[opacity,transform] hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:bg-accent disabled:text-muted-foreground"
        >
          <Send className="size-[18px]" />
        </button>
      </form>
    </>
  );
}
