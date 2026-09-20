import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Eye,
  Film,
  Heart,
  Home,
  Image as ImageIcon,
  Link2,
  MessageCircle,
  MessagesSquare,
  MoreHorizontal,
  Paperclip,
  PenLine,
  Play,
  Plus,
  Search,
  Send,
  Share2,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import editorialOne from "@/assets/leve-editorial-1.jpg";
import editorialTwo from "@/assets/leve-editorial-2.jpg";
import editorialThree from "@/assets/leve-editorial-3.jpg";

type Section = "feed" | "messages" | "stories" | "profile";

const nav = [
  { key: "feed", label: "Feed", path: "/", icon: Home },
  { key: "messages", label: "Mensagens", path: "/mensagens", icon: MessagesSquare },
  { key: "stories", label: "História", path: "/historia", icon: Film },
  { key: "profile", label: "Perfil", path: "/perfil", icon: UserRound },
] as const;

const amara = { name: "Amara Costa", handle: "@amaracosta", image: editorialOne };
const joel = { name: "Joel Mota", handle: "@joelmota", image: editorialTwo };
const lina = { name: "Lina Sousa", handle: "@linasousa", image: editorialThree };
const people = [amara, joel, lina] as const;

const posts = [
  {
    id: 1,
    author: amara,
    image: editorialOne,
    caption: "Entre linhas, luz e silêncio. Uma tarde a criar sem pressa.",
    likes: 2480,
    comments: 128,
    views: 18400,
    time: "Há 18 min",
  },
  {
    id: 2,
    author: joel,
    image: editorialTwo,
    caption: "O processo também merece ser visto. Novas ideias a ganhar forma no estúdio.",
    likes: 1870,
    comments: 94,
    views: 12900,
    time: "Há 2 h",
  },
  {
    id: 3,
    author: lina,
    image: editorialThree,
    caption: "Luanda desacelera quando o Atlântico encontra o fim do dia.",
    likes: 4210,
    comments: 207,
    views: 56800,
    time: "Ontem",
  },
];

const amaraConversation = { ...amara, message: "Adorei a direção. Vamos publicar?", time: "20:42", unread: 2 };
const conversations = [
  amaraConversation,
  { ...joel, message: "Enviei os esboços novos.", time: "18:16", unread: 0 },
  { ...lina, message: "Até amanhã ✦", time: "Ontem", unread: 0 },
] as const;

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" aria-label="LEVE">
      <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground">
        L
      </span>
      {!compact && <span className="font-display text-xl font-bold tracking-[0.18em]">LEVE</span>}
    </div>
  );
}

function Avatar({ person, size = "md" }: { person: (typeof people)[number]; size?: "sm" | "md" | "lg" }) {
  const sizes = size === "lg" ? "size-24" : size === "sm" ? "size-9" : "size-11";
  return (
    <img
      src={person.image}
      alt={`Foto de ${person.name}`}
      className={`${sizes} shrink-0 rounded-full border border-border object-cover`}
      width={96}
      height={96}
    />
  );
}

function IconButton({ label, children, onClick, active = false }: { label: string; children: ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={active ? "text-primary" : "text-muted-foreground"}
    >
      {children}
    </Button>
  );
}

export function LeveApp({ section }: { section: Section }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [postOpen, setPostOpen] = useState<(typeof posts)[number] | null>(null);
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border bg-background/95 px-5 py-6 backdrop-blur lg:flex">
        <Link to="/" className="flex px-3">
          <Logo />
        </Link>
        <nav className="mt-12 flex w-full flex-col space-y-1" aria-label="Navegação principal">
          {nav.map((item) => {
            const Icon = item.icon;
            const selected = item.key === section;
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`flex h-12 items-center gap-4 rounded-md px-4 text-sm font-semibold transition-colors ${selected ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                <Icon className="size-5" strokeWidth={selected ? 2.4 : 1.8} />
                <span>{item.label}</span>
                {item.key === "messages" && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>
        <Button className="mt-8 h-12 w-full" onClick={() => setComposerOpen(true)} aria-label="Criar publicação">
          <PenLine /><span>Criar publicação</span>
        </Button>
        <div className="mt-auto flex items-center gap-3 rounded-md border border-border p-3">
          <Avatar person={amara} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Amara Costa</p>
            <p className="truncate text-xs text-muted-foreground">@amaracosta</p>
          </div>
          <MoreHorizontal className="ml-auto size-4 text-muted-foreground" />
        </div>
      </aside>

      <header className="sticky top-0 z-30 grid h-16 grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-background/90 px-4 backdrop-blur-xl lg:hidden">
        <Logo />
        <span className="text-sm font-semibold">{nav.find((item) => item.key === section)?.label}</span>
        <div className="justify-self-end">
          <IconButton label="Notificações" onClick={() => setNotice((value) => !value)}><Bell /></IconButton>
        </div>
      </header>

      <main className="pb-20 lg:ml-[248px] lg:pb-0">
        <div className={`mx-auto min-h-dvh ${section === "messages" ? "max-w-[1180px]" : "max-w-[1120px]"}`}>
          {section === "feed" && <Feed onStory={setStoryIndex} onPost={setPostOpen} notice={notice} setNotice={setNotice} />}
          {section === "messages" && <Messages />}
          {section === "stories" && <Stories onStory={setStoryIndex} onCreate={() => setComposerOpen(true)} />}
          {section === "profile" && <Profile onPost={setPostOpen} />}
        </div>
      </main>


      {notice && (
        <div className="fixed right-4 top-16 z-50 w-[min(340px,calc(100vw-2rem))] rounded-md border border-border bg-popover p-4 shadow-2xl lg:right-8 lg:top-6">
          <div className="flex items-center justify-between"><p className="font-semibold">Notificações</p><IconButton label="Fechar" onClick={() => setNotice(false)}><X /></IconButton></div>
          <p className="mt-2 text-sm text-muted-foreground">Joel começou a seguir-te e Lina gostou da tua publicação.</p>
        </div>
      )}
      <StoryViewer index={storyIndex} onClose={() => setStoryIndex(null)} onChange={setStoryIndex} />
      <Composer open={composerOpen} onOpenChange={setComposerOpen} />
      <PostDetail post={postOpen} onClose={() => setPostOpen(null)} />
    </div>
  );
}

function Feed({ onStory, onPost, notice, setNotice }: { onStory: (index: number) => void; onPost: (post: (typeof posts)[number]) => void; notice: boolean; setNotice: (value: boolean) => void }) {
  const [query, setQuery] = useState("");
  const filtered = posts.filter((post) => `${post.author.name} ${post.caption}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="grid xl:grid-cols-[minmax(0,680px)_320px]">
      <section className="min-w-0 border-x border-border xl:border-l-0">
        <div className="sticky top-16 z-20 border-b border-border bg-background/90 p-4 backdrop-blur-xl lg:top-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <label className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-secondary px-4">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Pesquisar no LEVE" />
            </label>
            <IconButton label="Notificações" active={notice} onClick={() => setNotice(!notice)}><Bell /></IconButton>
          </div>
        </div>
        <StoryStrip onStory={onStory} />
        <div>
          {filtered.length ? filtered.map((post) => <PostCard key={post.id} post={post} onOpen={() => onPost(post)} />) : <div className="grid min-h-72 place-items-center text-sm text-muted-foreground">Nenhuma publicação encontrada.</div>}
        </div>
      </section>
      <RightRail />
    </div>
  );
}

function StoryStrip({ onStory }: { onStory: (index: number) => void }) {
  return (
    <div className="border-b border-border px-4 py-5">
      <div className="scrollbar-none flex gap-4 overflow-x-auto">
        <button className="group shrink-0 text-center" onClick={() => onStory(0)}>
          <span className="relative block rounded-full border border-dashed border-muted-foreground p-0.5"><Avatar person={people[0]} /><span className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground"><Plus className="size-3" /></span></span>
          <span className="mt-2 block w-14 truncate text-[11px] text-muted-foreground">Sua história</span>
        </button>
        {people.map((person, index) => (
          <button key={person.handle} onClick={() => onStory(index)} className="shrink-0 text-center">
            <span className="block rounded-full bg-story p-[2px]"><span className="block rounded-full bg-background p-[2px]"><Avatar person={person} /></span></span>
            <span className="mt-2 block w-14 truncate text-[11px]">{person.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PostCard({ post, onOpen }: { post: (typeof posts)[number]; onOpen: () => void }) {
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <article className="border-b border-border py-5 transition-colors hover:bg-card/40">
      <div className="flex items-start gap-3 px-4">
        <Avatar person={post.author} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{post.author.name}</p>
          <p className="truncate text-xs text-muted-foreground">{post.author.handle}</p>
        </div>
        <Button variant={following ? "secondary" : "outline"} size="sm" onClick={() => setFollowing(!following)}>{following ? "A seguir" : "Seguir"}</Button>
        <IconButton label="Mais opções"><MoreHorizontal /></IconButton>
      </div>
      <button onClick={onOpen} className="mt-4 block w-full overflow-hidden bg-secondary text-left">
        <img src={post.image} alt="Publicação editorial" className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-[1.01] sm:aspect-[5/4]" loading="lazy" width={1200} height={1504} />
      </button>
      <div className="px-4 pt-3">
        <div className="flex items-center gap-1">
          <IconButton label="Curtir" active={liked} onClick={() => setLiked(!liked)}><Heart fill={liked ? "currentColor" : "none"} /></IconButton>
          <IconButton label="Comentários" onClick={onOpen}><MessageCircle /></IconButton>
          <IconButton label="Compartilhar"><Send /></IconButton>
          <span className="ml-1 text-xs text-muted-foreground">{(post.likes + (liked ? 1 : 0)).toLocaleString("pt-PT")} gostos · {post.comments} comentários</span>
          <div className="ml-auto"><IconButton label="Guardar" active={saved} onClick={() => setSaved(!saved)}><Bookmark fill={saved ? "currentColor" : "none"} /></IconButton></div>
        </div>
        <p className="mt-2 text-sm leading-6"><span className="mr-2 font-semibold">{post.author.handle}</span>{post.caption}</p>
        <p className="mt-2 text-[11px] uppercase text-muted-foreground">{post.time}</p>
      </div>
    </article>
  );
}

function RightRail() {
  const [followed, setFollowed] = useState<string[]>([]);
  return (
    <aside className="hidden px-6 py-8 xl:block">
      <div className="sticky top-8">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Descobrir pessoas</p>
        <div className="mt-5 space-y-5">
          {people.slice(1).map((person) => (
            <div key={person.handle} className="flex items-center gap-3">
              <Avatar person={person} size="sm" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{person.name}</p><p className="truncate text-xs text-muted-foreground">{person.handle}</p></div>
              <Button variant="ghost" size="sm" onClick={() => setFollowed((items) => items.includes(person.handle) ? items.filter((item) => item !== person.handle) : [...items, person.handle])}>{followed.includes(person.handle) ? "A seguir" : "Seguir"}</Button>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border pt-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><Sparkles className="size-4 text-primary" /> Em destaque</p>
          <p className="mt-4 text-sm font-medium">Criadores de Angola</p>
          <p className="mt-1 text-xs text-muted-foreground">2,8 mil publicações hoje</p>
        </div>
        <p className="mt-10 text-[11px] leading-5 text-muted-foreground">© 2026 LEVE · Privacidade · Termos · Sobre</p>
      </div>
    </aside>
  );
}

function Messages() {
  const [selected, setSelected] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const active = conversations[selected ?? 0] ?? amaraConversation;
  const filtered = conversations.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="grid min-h-[calc(100dvh-4rem)] md:grid-cols-[340px_minmax(0,1fr)] lg:min-h-dvh">
      <section className={`${selected !== null ? "hidden md:block" : "block"} border-r border-border`}>
        <div className="border-b border-border p-5"><h1 className="font-display text-2xl font-semibold">Mensagens</h1><label className="mt-4 flex items-center gap-3 rounded-md bg-secondary px-3"><Search className="size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Pesquisar conversas" /></label></div>
        <div>{filtered.map((item) => { const index = conversations.indexOf(item); return <button key={item.handle} onClick={() => setSelected(index)} className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] gap-3 border-b border-border p-4 text-left transition-colors hover:bg-card ${selected === index || (selected === null && index === 0) ? "md:bg-secondary" : ""}`}><Avatar person={item} /><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.name}</p><p className="truncate text-xs text-muted-foreground">{item.message}</p></div><div className="text-right"><p className="text-[10px] text-muted-foreground">{item.time}</p>{item.unread > 0 && <span className="mt-2 inline-grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{item.unread}</span>}</div></button>; })}</div>
      </section>
      <Conversation person={active} visible={selected !== null} onBack={() => setSelected(null)} />
    </div>
  );
}

function Conversation({ person, visible, onBack }: { person: (typeof conversations)[number]; visible: boolean; onBack: () => void }) {
  const [messages, setMessages] = useState(["Olá Amara, vi a nova série.", "Que bom! Ainda estou a ajustar os últimos detalhes.", "Adorei a direção. Vamos publicar?"]);
  const [draft, setDraft] = useState("");
  const send = (event: FormEvent) => { event.preventDefault(); if (!draft.trim()) return; setMessages((items) => [...items, draft.trim()]); setDraft(""); };
  return (
    <section className={`${visible ? "flex" : "hidden md:flex"} fixed inset-0 z-50 flex-col bg-background md:static md:z-auto`}>
      <header className="grid h-16 grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4">
        <div className="md:hidden"><IconButton label="Voltar" onClick={onBack}><ArrowLeft /></IconButton></div><Avatar person={person} size="sm" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{person.name}</p><p className="truncate text-xs text-online">Online agora</p></div><IconButton label="Opções da conversa"><MoreHorizontal /></IconButton>
      </header>
      <div className="flex flex-1 flex-col justify-end overflow-y-auto p-4 sm:p-8">
        <div className="mx-auto mb-8 text-center"><Avatar person={person} size="lg" /><p className="mt-3 font-semibold">{person.name}</p><p className="text-xs text-muted-foreground">{person.handle}</p></div>
        <div className="space-y-3">{messages.map((message, index) => <div key={`${message}-${index}`} className={`flex ${index % 2 ? "justify-start" : "justify-end"}`}><p className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-5 ${index % 2 ? "rounded-bl-sm bg-secondary" : "rounded-br-sm bg-primary text-primary-foreground"}`}>{message}</p></div>)}</div>
      </div>
      <form onSubmit={send} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-t border-border p-3 sm:p-4"><IconButton label="Anexar"><Paperclip /></IconButton><input value={draft} onChange={(event) => setDraft(event.target.value)} className="h-11 min-w-0 rounded-md bg-secondary px-4 text-sm outline-none ring-primary focus:ring-1" placeholder="Escrever mensagem..." /><Button size="icon" type="submit" aria-label="Enviar mensagem"><Send /></Button></form>
    </section>
  );
}

function Stories({ onStory, onCreate }: { onStory: (index: number) => void; onCreate: () => void }) {
  return (
    <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase text-primary">Últimas 24 horas</p><h1 className="mt-2 truncate font-display text-3xl font-semibold sm:text-4xl">Histórias</h1></div><Button onClick={onCreate}><CirclePlus /> Adicionar</Button></header>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        <button onClick={onCreate} className="group relative aspect-[3/5] overflow-hidden rounded-md border border-dashed border-muted-foreground bg-secondary"><div className="absolute inset-0 grid place-items-center"><span className="text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-primary-foreground"><Plus /></span><span className="mt-3 block text-sm font-semibold">Nova história</span></span></div></button>
        {people.map((person, index) => <button key={person.handle} onClick={() => onStory(index)} className="group relative aspect-[3/5] overflow-hidden rounded-md bg-card text-left"><img src={person.image} alt={`História de ${person.name}`} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" width={1200} height={1504} /><span className="absolute inset-0 bg-story-overlay" /><span className="absolute left-3 top-3 rounded-full bg-background/70 p-[2px]"><Avatar person={person} size="sm" /></span><span className="absolute inset-x-3 bottom-4"><span className="block text-sm font-semibold">{person.name}</span><span className="text-xs text-foreground/70">Há {index + 1} h</span></span></button>)}
      </div>
    </div>
  );
}

function Profile({ onPost }: { onPost: (post: (typeof posts)[number]) => void }) {
  return (
    <div>
      <div className="relative h-44 overflow-hidden sm:h-64"><img src={editorialThree} alt="Costa de Luanda" className="size-full object-cover" width={1200} height={1504} /><div className="absolute inset-0 bg-cover-overlay" /></div>
      <section className="relative px-4 sm:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="-mt-12 min-w-0 sm:-mt-16"><span className="inline-block rounded-full border-4 border-background"><Avatar person={amara} size="lg" /></span><h1 className="mt-3 truncate font-display text-2xl font-semibold">Amara Costa</h1><p className="text-sm text-muted-foreground">@amaracosta</p></div>
          <div className="flex gap-2 pt-3"><Button variant="outline" size="icon" aria-label="Compartilhar perfil"><Share2 /></Button><Button>Editar perfil</Button></div>
        </div>
        <p className="mt-5 max-w-xl text-sm leading-6 text-foreground/80">Direção criativa, imagem e ideias em movimento. Luanda, Angola.</p>
        <div className="mt-5 flex gap-6 text-sm"><p><strong>482</strong> <span className="text-muted-foreground">a seguir</span></p><p><strong>18,4 mil</strong> <span className="text-muted-foreground">seguidores</span></p></div>
        <div className="mt-8 flex border-b border-border"><button className="border-b-2 border-primary px-4 py-3 text-sm font-semibold">Publicações</button><button className="px-4 py-3 text-sm text-muted-foreground">Guardados</button></div>
      </section>
      <div className="grid grid-cols-3 gap-0.5 bg-background p-0.5 sm:gap-1 sm:p-1">{[...posts, ...posts].map((post, index) => <button key={`${post.id}-${index}`} onClick={() => onPost(post)} className="group relative aspect-square overflow-hidden bg-secondary"><img src={post.image} alt="Conteúdo do perfil" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" width={1200} height={1504} />{index === 1 && <span className="absolute right-2 top-2"><Play className="size-4 fill-current" /></span>}<span className="absolute inset-0 grid place-items-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100"><span className="flex items-center gap-1 text-sm font-semibold"><Heart className="size-4 fill-current" /> {post.likes}</span></span></button>)}</div>
    </div>
  );
}

function StoryViewer({ index, onClose, onChange }: { index: number | null; onClose: () => void; onChange: (index: number) => void }) {
  const [reply, setReply] = useState("");
  if (index === null) return null;
  const person = people[index % people.length] ?? amara;
  return (
    <div className="fixed inset-0 z-[70] bg-background/95 p-0 backdrop-blur-2xl sm:p-6" role="dialog" aria-modal="true" aria-label={`História de ${person.name}`}>
      <div className="relative mx-auto h-full max-w-md overflow-hidden bg-card sm:rounded-md"><img src={person.image} alt="História em destaque" className="size-full object-cover" width={1200} height={1504} /><div className="absolute inset-0 bg-story-view-overlay" />
        <div className="absolute inset-x-0 top-0 p-4"><div className="flex gap-1">{people.map((item, itemIndex) => <span key={item.handle} className="h-0.5 flex-1 overflow-hidden bg-foreground/25"><span className={`block h-full bg-foreground ${itemIndex <= index ? "w-full" : "w-0"}`} /></span>)}</div><div className="mt-4 flex items-center gap-3"><Avatar person={person} size="sm" /><div><p className="text-sm font-semibold">{person.name}</p><p className="text-xs text-foreground/70">Há {index + 1} h</p></div><div className="ml-auto"><IconButton label="Fechar história" onClick={onClose}><X /></IconButton></div></div></div>
        <button aria-label="História anterior" onClick={() => onChange((index - 1 + people.length) % people.length)} className="absolute inset-y-24 left-0 w-1/3"><ChevronLeft className="ml-3 size-7 drop-shadow" /></button><button aria-label="Próxima história" onClick={() => onChange((index + 1) % people.length)} className="absolute inset-y-24 right-0 w-1/3"><ChevronRight className="ml-auto mr-3 size-7 drop-shadow" /></button>
        <div className="absolute inset-x-0 bottom-0 p-4"><p className="mb-4 flex items-center gap-2 text-xs"><Eye className="size-4" /> 184 visualizações</p><form onSubmit={(event) => { event.preventDefault(); setReply(""); }} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><input value={reply} onChange={(event) => setReply(event.target.value)} className="h-11 min-w-0 rounded-full border border-foreground/40 bg-background/30 px-4 text-sm outline-none backdrop-blur" placeholder="Responder..." /><Button type="submit" size="icon" aria-label="Enviar resposta" className="rounded-full"><Send /></Button></form></div>
      </div>
    </div>
  );
}

function Composer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [kind, setKind] = useState("foto");
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Criar no LEVE</DialogTitle><DialogDescription>Escolha um formato e prepare a sua publicação.</DialogDescription></DialogHeader><div className="grid grid-cols-3 gap-2">{[{ id: "foto", label: "Foto", icon: ImageIcon }, { id: "vídeo", label: "Vídeo", icon: Film }, { id: "texto", label: "Texto", icon: PenLine }].map((item) => { const Icon = item.icon; return <Button key={item.id} variant={kind === item.id ? "default" : "outline"} className="h-20 flex-col" onClick={() => setKind(item.id)}><Icon />{item.label}</Button>; })}</div><textarea className="min-h-28 resize-none rounded-md border border-border bg-secondary p-3 text-sm outline-none ring-primary focus:ring-1" placeholder="Partilhe uma ideia..." /><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">Visível para todos</p><Button onClick={() => onOpenChange(false)}>Publicar</Button></div></DialogContent></Dialog>;
}

function PostDetail({ post, onClose }: { post: (typeof posts)[number] | null; onClose: () => void }) {
  return <Dialog open={Boolean(post)} onOpenChange={(open) => { if (!open) onClose(); }}>{post && <DialogContent className="max-h-[92dvh] max-w-5xl overflow-y-auto p-0"><DialogTitle className="sr-only">Publicação de {post.author.name}</DialogTitle><div className="grid md:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]"><img src={post.image} alt="Publicação ampliada" className="max-h-[78dvh] size-full object-cover" width={1200} height={1504} /><div className="p-5"><div className="flex items-center gap-3"><Avatar person={post.author} size="sm" /><div><p className="text-sm font-semibold">{post.author.name}</p><p className="text-xs text-muted-foreground">{post.author.handle}</p></div></div><p className="mt-6 text-sm leading-6">{post.caption}</p><div className="mt-8 border-y border-border py-4 text-sm text-muted-foreground">{post.likes.toLocaleString("pt-PT")} gostos · {post.comments} comentários</div><div className="mt-5 flex gap-2"><IconButton label="Curtir"><Heart /></IconButton><IconButton label="Comentar"><MessageCircle /></IconButton><IconButton label="Compartilhar"><Share2 /></IconButton></div><div className="mt-6 space-y-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Comentários</p><p className="text-sm"><strong className="mr-2">@joelmota</strong>A luz ficou incrível.</p><p className="text-sm"><strong className="mr-2">@linasousa</strong>Que série bonita!</p></div></div></div></DialogContent>}</Dialog>;
}