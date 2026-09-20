import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  ImagePlus,
  MessageCircle,
  Send,
  Share2,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { me, postComments, storyPeople, type Post } from "./data";
import { ActionButton, Avatar, IconButton, formatCount } from "./primitives";

/* ------------------------------ Histórias ------------------------------ */

export function StoryViewer({
  index,
  onClose,
  onChange,
}: {
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
}) {
  const [reply, setReply] = useState("");
  const total = storyPeople.length;

  const goNext = () => {
    if (index === null) return;
    if (index >= total - 1) onClose();
    else onChange(index + 1);
  };
  const goPrevious = () => {
    if (index === null) return;
    onChange(Math.max(0, index - 1));
  };

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrevious();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (index === null) return null;
  const person = storyPeople[index];
  if (!person) return null;
  const mine = person.handle === me.handle;

  const submitReply = (event: FormEvent) => {
    event.preventDefault();
    setReply("");
  };

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/90 backdrop-blur-xl sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`História de ${person.name}`}
    >
      <div className="relative h-full w-full max-w-[440px] overflow-hidden bg-card sm:max-h-[860px] sm:rounded-[2rem]">
        {person.image && (
          <img
            src={person.image}
            alt={`História de ${person.name}`}
            className="size-full object-cover"
            width={1200}
            height={1504}
          />
        )}
        <div className="absolute inset-0 bg-story-view-overlay" aria-hidden="true" />

        <div className="absolute inset-x-0 top-0 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex gap-1.5" aria-hidden="true">
            {storyPeople.map((item, itemIndex) => (
              <span
                key={item.handle}
                className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30"
              >
                <span
                  className={cn(
                    "block h-full rounded-full bg-white",
                    itemIndex <= index ? "w-full" : "w-0",
                  )}
                />
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Avatar person={person} size="sm" />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-bold">{mine ? "Sua história" : person.name}</p>
              <p className="text-xs text-foreground/70">Há {index + 1} h</p>
            </div>
            <IconButton label="Fechar história" onClick={onClose} className="text-foreground">
              <X />
            </IconButton>
          </div>
        </div>

        <button
          type="button"
          aria-label="História anterior"
          onClick={goPrevious}
          className="group absolute inset-y-24 left-0 flex w-1/3 items-center pl-3 focus-visible:outline-none"
        >
          <span className="grid size-10 place-items-center rounded-full bg-black/30 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-visible:ring-2 group-focus-visible:ring-ring">
            <ChevronLeft className="size-6" />
          </span>
        </button>
        <button
          type="button"
          aria-label="Próxima história"
          onClick={goNext}
          className="group absolute inset-y-24 right-0 flex w-1/3 items-center justify-end pr-3 focus-visible:outline-none"
        >
          <span className="grid size-10 place-items-center rounded-full bg-black/30 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-visible:ring-2 group-focus-visible:ring-ring">
            <ChevronRight className="size-6" />
          </span>
        </button>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium text-foreground/80">
            <Eye className="size-4" aria-hidden="true" />
            184 visualizações
          </p>
          <form
            onSubmit={submitReply}
            className="flex items-center gap-1 rounded-full border border-white/25 bg-black/30 p-1.5 backdrop-blur focus-within:border-white/60"
          >
            <input
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              aria-label="Responder à história"
              placeholder="Responder..."
              className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/60"
            />
            <button
              type="submit"
              aria-label="Enviar resposta"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
            >
              <Send className="size-[18px]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Criar ------------------------------ */

export type ComposerMode = "post" | "story" | null;

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
        {mode && <ComposerBody mode={mode} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function ComposerBody({ mode, onClose }: { mode: "post" | "story"; onClose: () => void }) {
  const [format, setFormat] = useState<Format>("photo");
  const [picked, setPicked] = useState(false);
  const isStory = mode === "story";
  const needsMedia = format !== "text";
  const mediaLabel = format === "video" ? "vídeo" : "foto";

  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle className="font-display text-xl">
          {isStory ? "Nova história" : "Nova publicação"}
        </DialogTitle>
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
        aria-label={isStory ? "Texto da história" : "Legenda"}
        placeholder={isStory ? "Adicionar texto..." : "Partilha uma ideia..."}
        className={cn(
          "resize-none rounded-2xl bg-secondary p-4 text-[15px] leading-6 outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring",
          needsMedia ? "min-h-20" : "min-h-32",
        )}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {isStory ? "Desaparece em 24 horas" : "Visível para todos"}
        </p>
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
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
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
    <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-5xl gap-0 overflow-y-auto rounded-3xl p-0 sm:rounded-3xl">
      <DialogTitle className="sr-only">Publicação de {post.author.name}</DialogTitle>
      <DialogDescription className="sr-only">{post.caption}</DialogDescription>
      <div className="grid md:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="bg-secondary">
          <img
            src={post.image}
            alt={`Publicação de ${post.author.name}`}
            className="max-h-[60dvh] w-full object-cover md:h-full md:max-h-[92dvh]"
            width={1200}
            height={1504}
          />
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

          <div className="-mx-2 mt-4 flex items-center gap-0.5">
            <ActionButton
              label="Curtir"
              pressed={liked}
              active={liked}
              count={formatCount(post.likes + (liked ? 1 : 0))}
              onClick={() => setLiked(!liked)}
            >
              <Heart
                className="size-[22px]"
                strokeWidth={1.8}
                fill={liked ? "currentColor" : "none"}
              />
            </ActionButton>
            <ActionButton label="Comentários" count={formatCount(post.comments + extra.length)}>
              <MessageCircle className="size-[22px]" strokeWidth={1.8} />
            </ActionButton>
            <ActionButton label="Compartilhar">
              <Share2 className="size-[22px]" strokeWidth={1.8} />
            </ActionButton>
            <span className="flex-1" />
            <ActionButton
              label="Guardar"
              pressed={saved}
              active={saved}
              onClick={() => setSaved(!saved)}
            >
              <Bookmark
                className="size-[22px]"
                strokeWidth={1.8}
                fill={saved ? "currentColor" : "none"}
              />
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
        </div>
      </div>
    </DialogContent>
  );
}
