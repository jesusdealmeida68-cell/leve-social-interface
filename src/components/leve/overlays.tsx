import { Heart, ImagePlus, MessageCircle, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { me, postComments, type Post } from "./data";
import { ActionButton, Avatar, IconButton, formatCount } from "./primitives";
import { VideoPlayer } from "./video-player";

/* ------------------------------ Criar ------------------------------ */

export type ComposerMode = "post" | null;

const formats = [
  { key: "photo", label: "Foto" },
  { key: "video", label: "Vídeo" },
  { key: "text", label: "Texto" },
] as const;

type Format = (typeof formats)[number]["key"];

export function Composer({ mode, onClose }: { mode: ComposerMode; onClose: () => void }) {
  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-md rounded-3xl">
        {/* O conteúdo só existe enquanto o diálogo está aberto, por isso o estado reinicia sozinho. */}
        {mode && <ComposerBody onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function ComposerBody({ onClose }: { onClose: () => void }) {
  const [format, setFormat] = useState<Format>("photo");
  const [picked, setPicked] = useState(false);
  const needsMedia = format !== "text";
  const mediaLabel = format === "video" ? "vídeo" : "foto";

  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle className="font-display text-xl">Nova publicação</DialogTitle>
        <DialogDescription>Escolhe o formato e prepara o conteúdo.</DialogDescription>
      </DialogHeader>

      <div
        role="radiogroup"
        aria-label="Formato"
        className="inline-flex w-fit gap-1 rounded-full bg-secondary p-1"
      >
        {formats.map((item) => {
          const selected = item.key === format;
          return (
            <button
              key={item.key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setFormat(item.key);
                setPicked(false);
              }}
              className={cn(
                "h-9 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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

      {needsMedia && (
        <div className="grid aspect-[16/10] place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-card">
          {picked ? (
            <div className="relative size-full">
              <img
                src={me.image}
                alt={`Pré-visualização do ${mediaLabel}`}
                className="size-full object-cover"
                width={1200}
                height={1504}
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-3 right-3"
                onClick={() => setPicked(false)}
              >
                Trocar
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setPicked(true)}>
              <ImagePlus />
              Escolher {mediaLabel}
            </Button>
          )}
        </div>
      )}

      <textarea
        aria-label="Legenda"
        placeholder="Partilha uma ideia..."
        className={cn(
          "resize-none rounded-2xl bg-secondary p-4 text-[15px] leading-6 outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring",
          needsMedia ? "min-h-20" : "min-h-32",
        )}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Visível para todos</p>
        <Button onClick={onClose}>Publicar</Button>
      </div>
    </>
  );
}

/* ------------------------------ Publicação ------------------------------ */

export function PostDetail({ post, onClose }: { post: Post | null; onClose: () => void }) {
  return (
    <Dialog open={post !== null} onOpenChange={(open) => !open && onClose()}>
      {post && <PostDetailContent post={post} />}
    </Dialog>
  );
}

function PostDetailContent({ post }: { post: Post }) {
  return (
    <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-5xl gap-0 overflow-y-auto rounded-3xl p-0 sm:rounded-3xl">
      <DialogTitle className="sr-only">Publicação de {post.author.name}</DialogTitle>
      <DialogDescription className="sr-only">{post.caption}</DialogDescription>
      <div className="grid md:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="bg-secondary">
          {post.video ? (
            <VideoPlayer
              src={post.video}
              poster={post.image}
              durationHint={post.duration}
              label={`Vídeo de ${post.author.name}`}
              className="max-h-[60dvh] w-full md:h-full md:max-h-[92dvh]"
            />
          ) : (
            <img
              src={post.image}
              alt={`Publicação de ${post.author.name}`}
              className="max-h-[60dvh] w-full object-cover md:h-full md:max-h-[92dvh]"
              width={1200}
              height={1504}
            />
          )}
        </div>

        <div className="flex min-h-0 flex-col p-5">
          <div className="flex items-center gap-3 pr-10">
            <Avatar person={post.author} size="sm" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold">{post.author.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {post.author.handle} · {post.time}
              </p>
            </div>
          </div>

          <p className="mt-5 text-[15px] leading-6">{post.caption}</p>

          <CommentsSection post={post} />
        </div>
      </div>
    </DialogContent>
  );
}

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
