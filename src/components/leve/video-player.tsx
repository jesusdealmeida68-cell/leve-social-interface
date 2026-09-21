import {
  Loader2,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  Settings2,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/* Preferências partilhadas por todos os vídeos                        */
/* ------------------------------------------------------------------ */

const speeds = [0.5, 1, 1.5, 2] as const;
const STORAGE_KEY = "leve:video-prefs";

type Prefs = { muted: boolean; volume: number; autoplay: boolean; loop: boolean; speed: number };
type VideoContext = Prefs & {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  update: (patch: Partial<Prefs>) => void;
};

const defaults: Prefs = { muted: true, volume: 0.8, autoplay: true, loop: true, speed: 1 };
const fallback: VideoContext = { ...defaults, activeId: null, setActiveId: () => {}, update: () => {} };
const VideoPrefsContext = createContext<VideoContext>(fallback);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function VideoPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(defaults);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Lê as preferências guardadas (o som começa sempre desligado em cada visita).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Prefs>;
        setPrefs((current) => ({
          ...current,
          volume: typeof saved.volume === "number" ? clamp(saved.volume, 0, 1) : current.volume,
          autoplay: typeof saved.autoplay === "boolean" ? saved.autoplay : current.autoplay,
          loop: typeof saved.loop === "boolean" ? saved.loop : current.loop,
          speed: typeof saved.speed === "number" && (speeds as readonly number[]).includes(saved.speed) ? saved.speed : current.speed,
        }));
      }
    } catch {
      /* sem armazenamento disponível */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      const { volume, autoplay, loop, speed } = prefs;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume, autoplay, loop, speed }));
    } catch {
      /* sem armazenamento disponível */
    }
  }, [prefs, loaded]);

  const update = useCallback((patch: Partial<Prefs>) => setPrefs((current) => ({ ...current, ...patch })), []);
  const value = useMemo<VideoContext>(() => ({ ...prefs, activeId, setActiveId, update }), [prefs, activeId, update]);

  return <VideoPrefsContext.Provider value={value}>{children}</VideoPrefsContext.Provider>;
}

/* ------------------------------------------------------------------ */
/* Peças pequenas                                                      */
/* ------------------------------------------------------------------ */

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

const speedLabel = (value: number) => `${String(value).replace(".", ",")}×`;

function ControlButton({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="grid size-9 shrink-0 place-items-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
    >
      {children}
    </button>
  );
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
    >
      <span>{label}</span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-white/20"}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Leitor                                                              */
/* ------------------------------------------------------------------ */

export type VideoPlayerProps = {
  src: string;
  poster?: string;
  /** Duração mostrada antes de o vídeo carregar, ex.: "0:11" */
  durationHint?: string | undefined;
  label: string;
  className?: string;
  fit?: "cover" | "contain";
  /** Começa a reproduzir assim que aparece (ex.: janela da publicação) */
  autoPlayOnMount?: boolean;
};

export function VideoPlayer({ src, poster, durationHint, label, className = "", fit = "cover", autoPlayOnMount = false }: VideoPlayerProps) {
  const id = useId();
  const prefs = useContext(VideoPrefsContext);
  const { update, setActiveId } = prefs;

  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const clickTimer = useRef<number | undefined>(undefined);
  const userPaused = useRef(false);
  const seekingRef = useRef(false);
  const prefsRef = useRef(prefs);

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [active, setActive] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [menu, setMenu] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [pipReady, setPipReady] = useState(false);
  const [flash, setFlash] = useState<{ side: "left" | "right"; key: number } | null>(null);

  useEffect(() => {
    prefsRef.current = prefs;
  });

  /* aplica as preferências ao elemento de vídeo */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = prefs.muted;
    video.volume = prefs.volume;
  }, [prefs.muted, prefs.volume]);
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = prefs.speed;
  }, [prefs.speed]);
  useEffect(() => {
    if (videoRef.current) videoRef.current.loop = prefs.loop;
  }, [prefs.loop]);

  /* só um vídeo de cada vez */
  useEffect(() => {
    if (prefs.activeId && prefs.activeId !== id) videoRef.current?.pause();
  }, [prefs.activeId, id]);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    userPaused.current = false;
    try {
      await video.play();
    } catch {
      // O navegador pode bloquear som automático: tenta de novo sem som.
      try {
        video.muted = true;
        update({ muted: true });
        await video.play();
      } catch {
        /* sem permissão para reproduzir */
      }
    }
  }, [update]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      void play();
    } else {
      userPaused.current = true;
      video.pause();
    }
  }, [play]);

  const wake = useCallback(() => {
    setActive(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setActive(false), 2600);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(hideTimer.current);
      window.clearTimeout(clickTimer.current);
    },
    [],
  );

  /* reproduz quando aparece no ecrã e pausa quando sai */
  useEffect(() => {
    const box = boxRef.current;
    if (!box || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!entry || !video) return;
        if (entry.intersectionRatio >= 0.6) {
          if (prefsRef.current.autoplay && !userPaused.current && video.paused) void play();
        } else if (entry.intersectionRatio < 0.4) {
          userPaused.current = false;
          if (!video.paused) video.pause();
        }
      },
      { threshold: [0, 0.4, 0.6, 1] },
    );
    observer.observe(box);
    return () => observer.disconnect();
  }, [play]);

  useEffect(() => {
    if (autoPlayOnMount) void play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* barra de progresso fluida enquanto reproduz */
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      const video = videoRef.current;
      if (video && !seekingRef.current) setTime(video.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 700);
    return () => window.clearTimeout(timer);
  }, [flash]);

  /* ecrã inteiro e imagem-sobre-imagem */
  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === boxRef.current);
    document.addEventListener("fullscreenchange", sync);
    setPipReady(Boolean(document.pictureInPictureEnabled));
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const box = boxRef.current;
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!box) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (box.requestFullscreen) await box.requestFullscreen();
      else video?.webkitEnterFullscreen?.();
    } catch {
      video?.webkitEnterFullscreen?.();
    }
  }, []);

  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {
      /* não suportado */
    }
  }, []);

  const skip = useCallback((delta: number, side: "left" | "right") => {
    const video = videoRef.current;
    if (!video) return;
    const limit = Number.isFinite(video.duration) ? video.duration : 0;
    video.currentTime = clamp(video.currentTime + delta, 0, limit);
    setTime(video.currentTime);
    setFlash({ side, key: Date.now() });
  }, []);

  /* toque simples = pausar/reproduzir; duplo toque = saltar 5 s ou ecrã inteiro */
  const onSurfaceClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    wake();
    if (menu) {
      setMenu(false);
      return;
    }
    if (clickTimer.current !== undefined) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = undefined;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      if (x < 0.4) skip(-5, "left");
      else if (x > 0.6) skip(5, "right");
      else void toggleFullscreen();
      return;
    }
    clickTimer.current = window.setTimeout(() => {
      clickTimer.current = undefined;
      toggle();
    }, 220);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const onBox = event.target === event.currentTarget;
    const key = event.key.toLowerCase();
    if (key === "escape" && menu) {
      setMenu(false);
      return;
    }
    if (onBox && (key === " " || key === "k")) {
      event.preventDefault();
      toggle();
    } else if (onBox && key === "arrowleft") {
      event.preventDefault();
      skip(-5, "left");
    } else if (onBox && key === "arrowright") {
      event.preventDefault();
      skip(5, "right");
    } else if (key === "m") {
      update({ muted: !prefs.muted });
    } else if (key === "f") {
      void toggleFullscreen();
    }
    wake();
  };

  /* barra de progresso: arrastar e teclado */
  const seekFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bar = barRef.current;
    const video = videoRef.current;
    if (!bar || !video || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    video.currentTime = ratio * duration;
    setTime(ratio * duration);
  };
  const onBarDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    seekingRef.current = true;
    setSeeking(true);
    seekFromPointer(event);
  };
  const onBarMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (seekingRef.current) seekFromPointer(event);
  };
  const onBarUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!seekingRef.current) return;
    seekingRef.current = false;
    setSeeking(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* já libertado */
    }
  };
  const onBarKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      event.stopPropagation();
      video.currentTime = clamp(video.currentTime + (event.key === "ArrowLeft" ? -5 : 5), 0, duration);
      setTime(video.currentTime);
    }
  };

  const percent = duration ? clamp((time / duration) * 100, 0, 100) : 0;
  const showBar = menu || seeking || (started ? !playing || active : active);
  const contain = fit === "contain" || fullscreen;
  const restart = ended && !prefs.loop;

  return (
    <div
      ref={boxRef}
      role="group"
      aria-label={`Leitor de vídeo: ${label}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerMove={wake}
      onMouseLeave={() => {
        if (playing && !menu) setActive(false);
      }}
      className={`group/player relative isolate select-none overflow-hidden bg-black outline-none focus-visible:ring-2 focus-visible:ring-primary/70 ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        className={`absolute inset-0 size-full ${contain ? "object-contain" : "object-cover"}`}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
          setEnded(false);
          setActiveId(id);
        }}
        onPlaying={() => {
          setWaiting(false);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setEnded(true);
          setPlaying(false);
        }}
        onWaiting={() => setWaiting(true)}
        onCanPlay={() => setWaiting(false)}
        onTimeUpdate={(event) => {
          if (!seekingRef.current) setTime(event.currentTarget.currentTime);
        }}
      />

      {/* área clicável */}
      <button
        type="button"
        tabIndex={-1}
        aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"}
        onClick={onSurfaceClick}
        className="absolute inset-0 z-[1] cursor-pointer"
      />

      {/* botão central */}
      {!playing && !waiting && (
        <span className="pointer-events-none absolute inset-0 z-[2] grid place-items-center">
          <span className="grid size-16 place-items-center rounded-full bg-black/50 text-white shadow-2xl backdrop-blur-md transition-transform group-hover/player:scale-105">
            {restart ? <RotateCcw className="size-7" /> : <Play className="ml-1 size-7 fill-current" />}
          </span>
        </span>
      )}
      {waiting && playing && (
        <span className="pointer-events-none absolute inset-0 z-[2] grid place-items-center">
          <Loader2 className="size-9 animate-spin text-white/90" />
        </span>
      )}

      {/* duração antes de começar */}
      {!started && !showBar && (
        <span className="pointer-events-none absolute bottom-3 left-3 z-[2] rounded-md bg-black/65 px-2 py-0.5 text-xs font-medium text-white">
          {duration ? formatTime(duration) : (durationHint ?? "0:00")}
        </span>
      )}

      {/* velocidade ativa */}
      {prefs.speed !== 1 && (
        <span className="pointer-events-none absolute left-3 top-3 z-[2] rounded-full bg-black/45 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
          {speedLabel(prefs.speed)}
        </span>
      )}

      {/* som: atalho sempre à mão */}
      <button
        type="button"
        aria-label={prefs.muted ? "Ativar som" : "Desativar som"}
        aria-pressed={!prefs.muted}
        onClick={() => {
          update({ muted: !prefs.muted });
          wake();
        }}
        className="absolute right-3 top-3 z-[3] grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
      >
        {prefs.muted ? <VolumeX className="size-[18px]" /> : <Volume2 className="size-[18px]" />}
      </button>

      {/* saltar 5 s */}
      {flash && (
        <span
          key={flash.key}
          className={`pointer-events-none absolute top-1/2 z-[2] -translate-y-1/2 rounded-full bg-black/55 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${flash.side === "left" ? "left-6" : "right-6"}`}
        >
          {flash.side === "left" ? "−5 s" : "+5 s"}
        </span>
      )}

      {/* definições */}
      {menu && (
        <div
          role="menu"
          aria-label="Definições do vídeo"
          className="absolute bottom-[4.75rem] right-3 z-20 w-[15rem] max-w-[calc(100%-1.5rem)] rounded-2xl border border-white/10 bg-popover/90 p-2 text-sm text-popover-foreground shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <SwitchRow label="Reprodução automática" checked={prefs.autoplay} onChange={(value) => update({ autoplay: value })} />
          <SwitchRow label="Repetir" checked={prefs.loop} onChange={(value) => update({ loop: value })} />
          <SwitchRow label="Som" checked={!prefs.muted} onChange={(value) => update({ muted: !value })} />
          <div className="px-3 pb-2 pt-3">
            <p className="text-xs text-muted-foreground">Velocidade</p>
            <div className="mt-2 grid grid-cols-4 gap-1 rounded-full bg-white/5 p-1">
              {speeds.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={prefs.speed === value}
                  onClick={() => update({ speed: value })}
                  className={`h-8 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 ${prefs.speed === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {speedLabel(value)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* barra de controlos */}
      <div
        className={`absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-3 pb-2 pt-12 transition-opacity duration-200 ${showBar ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div
          ref={barRef}
          role="slider"
          tabIndex={showBar ? 0 : -1}
          aria-label="Progresso do vídeo"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${formatTime(time)} de ${formatTime(duration)}`}
          onPointerDown={onBarDown}
          onPointerMove={onBarMove}
          onPointerUp={onBarUp}
          onPointerCancel={onBarUp}
          onKeyDown={onBarKey}
          className="group/bar relative flex h-5 cursor-pointer touch-none items-center focus-visible:outline-none"
        >
          <div className="relative h-1 w-full rounded-full bg-white/25 transition-[height] group-hover/bar:h-1.5 group-focus-visible/bar:h-1.5">
            <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${percent}%` }} />
            <div
              className={`absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-md transition-opacity group-hover/bar:opacity-100 group-focus-visible/bar:opacity-100 ${seeking ? "opacity-100" : "opacity-0"}`}
              style={{ left: `${percent}%` }}
            />
          </div>
        </div>

        <div className="mt-0.5 flex items-center gap-1">
          <ControlButton label={playing ? "Pausar" : restart ? "Ver de novo" : "Reproduzir"} onClick={toggle}>
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
          </ControlButton>
          <span className="ml-1 text-xs font-medium tabular-nums text-white/90">
            {formatTime(time)} / {duration ? formatTime(duration) : (durationHint ?? "0:00")}
          </span>

          <span className="ml-auto" />

          <label className="mr-1 hidden items-center md:flex">
            <span className="sr-only">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={prefs.muted ? 0 : prefs.volume}
              onChange={(event) => {
                const value = Number(event.target.value);
                update({ volume: value, muted: value === 0 });
              }}
              className="h-1 w-20 cursor-pointer accent-primary"
            />
          </label>
          <ControlButton label="Definições do vídeo" pressed={menu} onClick={() => setMenu((open) => !open)}>
            <Settings2 className="size-5" />
          </ControlButton>
          {pipReady && (
            <span className="hidden sm:block">
              <ControlButton label="Imagem sobre imagem" onClick={() => void togglePip()}>
                <PictureInPicture2 className="size-5" />
              </ControlButton>
            </span>
          )}
          <ControlButton label={fullscreen ? "Sair do ecrã inteiro" : "Ecrã inteiro"} onClick={() => void toggleFullscreen()}>
            {fullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
          </ControlButton>
        </div>
      </div>
    </div>
  );
}
