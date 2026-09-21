import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/lib/leve";
import { VideoPlayer } from "./video-player";

/**
 * Mostra os ficheiros de uma publicação. Com um só ficheiro aparece direto; com vários
 * (fotos e vídeos misturados) aparece um carrossel que se desliza com o dedo, as setas
 * do teclado ou os botões laterais, com contador e pontos.
 */
export function PostGallery({ items, label }: { items: MediaItem[]; label: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = useCallback((next: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setIndex(Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (items.length === 0) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(Math.min(index + 1, items.length - 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(Math.max(index - 1, 0));
    }
  };

  const slide = (item: MediaItem, position: number) =>
    item.type === "video" ? (
      <VideoPlayer
        src={item.url}
        label={`${label} (${position + 1} de ${items.length})`}
        className="aspect-[4/5] w-full"
        autoPlayOnMount={position === 0}
      />
    ) : (
      <img
        src={item.url}
        alt={`${label} (${position + 1} de ${items.length})`}
        className="aspect-[4/5] w-full object-cover"
        width={1200}
        height={1504}
        loading={position === 0 ? "eager" : "lazy"}
      />
    );

  if (items.length === 1) return slide(items[0]!, 0);

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="group/gallery relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-none"
      >
        {items.map((item, position) => (
          <div
            key={`${item.url}-${position}`}
            className="w-full shrink-0 snap-center"
            role="group"
            aria-roledescription="slide"
            aria-label={`${position + 1} de ${items.length}`}
          >
            {slide(item, position)}
          </div>
        ))}
      </div>

      <span
        className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur"
        aria-hidden="true"
      >
        {index + 1}/{items.length}
      </span>

      {index > 0 && (
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Anterior"
          className="absolute left-2 top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition-opacity hover:bg-black/70 sm:grid"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      {index < items.length - 1 && (
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Seguinte"
          className="absolute right-2 top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition-opacity hover:bg-black/70 sm:grid"
        >
          <ChevronRight className="size-5" />
        </button>
      )}

      <div className="mt-2.5 flex justify-center gap-1.5" aria-hidden="true">
        {items.map((_, position) => (
          <span
            key={position}
            className={cn(
              "h-1.5 rounded-full transition-all",
              position === index ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}
