import { Heart, ImagePlus, MessageCircle, Plus, Send, Video as VideoIcon, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { me, postComments, type Post } from "./data";
import { ActionButton, Avatar, formatCount } from "./primitives";

/* ------------------------------ Criar ------------------------------ */

export type ComposerMode = "post" | null;

const MAX_MEDIA = 10;

type MediaItem = { id: string; url: string; kind: "image" | "video" };

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

function ComposerBody({ onClose }: { onClose: () => void }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Liberta a memória das pré-visualizações quando o diálogo fecha.
  useEffect(() => {
    return () => {
      for (const item of media) URL.revokeObjectURL(item.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: MediaItem[] = Array.from(files)
      .filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"))
      .slice(0, Math.max(0, MAX_MEDIA - media.length))
      .map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        url: URL.createObjectURL(file),
        kind: file.type.startsWith("video/") ? "video" : "image",
      }));
    setMedia((items) => [...items, ...next]);
  };

  const removeItem = (id: string) => {
    setMedia((items) => {
      const target = items.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return items.filter((item) => item.id !== id);
    });
  };

  const publish = (event: FormEvent) => {
    event.preventDefault();
    if (media.length === 0) return;
    onClose();
  };

  return (
    <form onSubmit={publish} className="p-5">
      <DialogHeader className="text-left">
        <DialogTitle className="font-display text-xl">Nova publicação</DialogTitle>
        <DialogDescription>Junta fotos e vídeos numa só publicação.</DialogDescription>
      </DialogHeader>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="mt-4">
        {media.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid aspect-[4/3] w-full place-items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/60 text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <ImagePlus className="size-6" />
            </span>
            <span className="text-sm font-semibold">Adicionar fotos e vídeos</span>
            <span className="text-xs">Podes escolher quantas quiseres, juntas</span>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {media.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-xl bg-secondary"
              >
                {item.kind === "video" ? (
                  <video src={item.url} muted playsInline className="size-full object-cover" />
                ) : (
                  <img src={item.url} alt="" className="size-full object-cover" />
                )}
                {item.kind === "video" && (
                  <span className="absolute bottom-1.5 left-1.5 grid size-5 place-items-center rounded-full bg-black/60 text-white">
                    <VideoIcon className="size-3" />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remover"
                  className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white transition-transform hover:bg-black/75 active:scale-90"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}

            {media.length < MAX_MEDIA && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                aria-label="Adicionar mais"
                className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="size-6" />
              </button>
            )}
          </div>
        )}
      </div>

      <textarea
        aria-label="Legenda"
        placeholder="Escreve uma legenda (opcional)..."
        className="mt-4 min-h-20 w-full resize-none rounded-2xl bg-secondary p-4 text-[15px] leading-6 outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Visível para todos</p>
        <Button type="submit" disabled={media.length === 0}>
          Publicar
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------ Publicação ------------------------------ */

/** Curtir/comentar + lista de comentários + campo para escrever. Usado no detalhe da publicação e na página de assistir vídeo. */
export function CommentsSection({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [extra, setExtra] = useState<string[]>([]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = comment.trim();
    if (!text) return;
    setExtra((items) => [...items, text]);
    setComment("");
  };

  return (
    <>
      <div className="mt-4 flex items-center gap-1 pl-1">
        <ActionButton
          label="Curtir"
          pressed={liked}
          active={liked}
          tone="like"
          count={formatCount(post.likes + (liked ? 1 : 0))}
          onClick={() => setLiked(!liked)}
        >
          <Heart className="size-[22px]" strokeWidth={1.8} fill={liked ? "currentColor" : "none"} />
        </ActionButton>
        <ActionButton label="Comentários" count={formatCount(post.comments + extra.length)}>
          <MessageCircle className="size-[22px]" strokeWidth={1.8} />
        </ActionButton>
      </div>

      <ul className="mt-4 space-y-4 border-t border-border pt-4">
        {postComments.map((item) => (
          <li key={item.person.handle} className="flex items-start gap-3">
            <Avatar person={item.person} size="sm" />
            <p className="min-w-0 text-sm leading-5">
              <strong className="mr-1.5 font-bold">{item.person.handle}</strong>
              {item.text}
            </p>
          </li>
        ))}
        {extra.map((text, index) => (
          <li key={`${index}-${text}`} className="flex items-start gap-3">
            <Avatar person={me} size="sm" />
            <p className="min-w-0 break-words text-sm leading-5">
              <strong className="mr-1.5 font-bold">{me.handle}</strong>
              {text}
            </p>
          </li>
        ))}
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
          disabled={!comment.trim()}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-[opacity,transform] hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:bg-accent disabled:text-muted-foreground"
        >
          <Send className="size-[18px]" />
        </button>
      </form>
    </>
  );
}
