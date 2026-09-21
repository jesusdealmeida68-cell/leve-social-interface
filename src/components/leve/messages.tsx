import { ArrowLeft, MoreHorizontal, Paperclip, Search, Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { conversations, defaultConversation, type ChatMessage, type Conversation } from "./data";
import { Avatar, IconButton, PersonLink } from "./primitives";

type Threads = Record<string, ChatMessage[]>;

const initialThreads: Threads = Object.fromEntries(
  conversations.map((item) => [item.person.handle, item.thread]),
);

export function Messages({ initialHandle }: { initialHandle?: string } = {}) {
  /** Conversa aberta em ecrã inteiro no telemóvel. No desktop mostra-se sempre uma. */
  const [openHandle, setOpenHandle] = useState<string | null>(initialHandle ?? null);
  const [query, setQuery] = useState("");
  const [threads, setThreads] = useState<Threads>(initialThreads);
  const [readHandles, setReadHandles] = useState<string[]>([]);

  const active =
    conversations.find((item) => item.person.handle === openHandle) ?? defaultConversation;
  const term = query.trim().toLowerCase();
  const filtered = conversations.filter((item) =>
    `${item.person.name} ${item.person.handle}`.toLowerCase().includes(term),
  );

  const open = (handle: string) => {
    setOpenHandle(handle);
    setReadHandles((items) => (items.includes(handle) ? items : [...items, handle]));
  };

  const send = (handle: string, text: string) =>
    setThreads((current) => ({
      ...current,
      [handle]: [...(current[handle] ?? []), { from: "me", text }],
    }));

  return (
    <div className="lg:grid lg:h-dvh lg:grid-cols-[360px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
      <section
        aria-label="Conversas"
        className={cn(
          "mx-auto w-full max-w-xl flex-col lg:mx-0 lg:flex lg:min-h-0 lg:max-w-none lg:border-r lg:border-border",
          openHandle ? "hidden" : "flex",
        )}
      >
        <div className="px-4 pb-3 pt-5 lg:px-5 lg:pt-7">
          <h1 className="font-display text-2xl font-semibold">Mensagens</h1>
          <label className="mt-4 flex h-11 items-center gap-3 rounded-full bg-secondary px-4 transition-shadow focus-within:ring-2 focus-within:ring-ring">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Pesquisar conversas"
              placeholder="Pesquisar conversas"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <ul className="min-h-0 flex-1 space-y-0.5 px-2 pb-4 lg:overflow-y-auto">
          {filtered.length ? (
            filtered.map((item) => (
              <ConversationRow
                key={item.person.handle}
                item={item}
                lastMessage={threads[item.person.handle]?.at(-1)?.text ?? ""}
                unread={readHandles.includes(item.person.handle) ? 0 : item.unread}
                selected={item.person.handle === active.person.handle}
                onOpen={() => open(item.person.handle)}
              />
            ))
          ) : (
            <li className="px-4 py-10 text-center text-sm text-muted-foreground">
              Nenhuma conversa com esse nome.
            </li>
          )}
        </ul>
      </section>

      <ChatPane
        key={active.person.handle}
        conversation={active}
        thread={threads[active.person.handle] ?? []}
        visible={openHandle !== null}
        onBack={() => setOpenHandle(null)}
        onSend={(text) => send(active.person.handle, text)}
      />
    </div>
  );
}

function ConversationRow({
  item,
  lastMessage,
  unread,
  selected,
  onOpen,
}: {
  item: Conversation;
  lastMessage: string;
  unread: number;
  selected: boolean;
  onOpen: () => void;
}) {
  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-1 rounded-2xl pr-3 transition-colors hover:bg-accent/50",
          selected && "lg:bg-secondary",
        )}
      >
        <PersonLink person={item.person} className="shrink-0 p-3 pr-0">
          <Avatar person={item.person} size="md" />
        </PersonLink>
        <button
          type="button"
          onClick={onOpen}
          aria-current={selected ? "true" : undefined}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="min-w-0 flex-1 leading-tight">
            <span className="flex items-baseline gap-2">
              <span className={cn("truncate text-[15px]", unread ? "font-bold" : "font-semibold")}>
                {item.person.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">{item.person.handle}</span>
            </span>
            <span
              className={cn(
                "mt-1 block truncate text-sm",
                unread ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {lastMessage}
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-end gap-1.5 self-start pt-0.5">
            <span className="text-xs text-muted-foreground">{item.time}</span>
            {unread > 0 ? (
              <span
                className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground"
                aria-label={`${unread} mensagens por ler`}
              >
                {unread}
              </span>
            ) : (
              <span className="h-5" aria-hidden="true" />
            )}
          </span>
        </button>
      </div>
    </li>
  );
}

function ChatPane({
  conversation,
  thread,
  visible,
  onBack,
  onSend,
}: {
  conversation: Conversation;
  thread: ChatMessage[];
  visible: boolean;
  onBack: () => void;
  onSend: (text: string) => void;
}) {
  const { person } = conversation;
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [thread.length]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <section
      aria-label={`Conversa com ${person.name}`}
      className={cn(
        "flex-col bg-background lg:static lg:z-auto lg:flex lg:min-h-0",
        visible ? "fixed inset-0 z-50 flex" : "hidden",
      )}
    >
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-3 lg:px-5">
        <IconButton label="Voltar às conversas" onClick={onBack} className="lg:hidden">
          <ArrowLeft />
        </IconButton>
        <PersonLink person={person} className="flex min-w-0 flex-1 items-center gap-2 hover:opacity-80">
          <Avatar person={person} size="sm" />
          <span className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[15px] font-bold">{person.name}</p>
            <p className="truncate text-xs text-muted-foreground">{person.handle}</p>
          </span>
        </PersonLink>
        <IconButton label="Opções da conversa">
          <MoreHorizontal />
        </IconButton>
      </header>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-8">
        <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-end">
          <div className="mb-8 flex flex-col items-center text-center">
            <Avatar person={person} size="lg" />
            <p className="mt-3 font-display text-lg font-semibold">{person.name}</p>
            <p className="text-sm text-muted-foreground">{person.handle}</p>
          </div>
          <ol className="space-y-1.5">
            {thread.map((message, index) => {
              const mine = message.from === "me";
              const startsGroup = thread[index - 1]?.from !== message.from;
              return (
                <li
                  key={`${index}-${message.text}`}
                  className={cn(
                    "flex",
                    mine && "justify-end",
                    startsGroup && index > 0 && "pt-2.5",
                  )}
                >
                  <p
                    className={cn(
                      "max-w-[80%] rounded-3xl px-4 py-2.5 text-[15px] leading-6",
                      mine
                        ? "rounded-br-lg bg-primary text-primary-foreground"
                        : "rounded-bl-lg bg-secondary",
                    )}
                  >
                    {message.text}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 lg:px-8 lg:pb-5"
      >
        <div className="mx-auto flex max-w-2xl items-center gap-1 rounded-full bg-secondary p-1.5 transition-shadow focus-within:ring-2 focus-within:ring-ring">
          <IconButton label="Anexar ficheiro">
            <Paperclip />
          </IconButton>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label="Escrever mensagem"
            placeholder="Escrever mensagem..."
            className="h-10 min-w-0 flex-1 bg-transparent px-1 text-[15px] outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            aria-label="Enviar mensagem"
            disabled={!draft.trim()}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-[opacity,transform] hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:bg-accent disabled:text-muted-foreground"
          >
            <Send className="size-[18px]" />
          </button>
        </div>
      </form>
    </section>
  );
}
