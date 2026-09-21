import { ArrowLeft, ImagePlus, MoreHorizontal, Search, Send, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  clockTime,
  getProfileByUsername,
  listConversations,
  listThread,
  markThreadRead,
  sendMessage,
  uploadMedia,
  type Conversation,
  type Message,
  type Profile,
} from "@/lib/leve";
import { Avatar, IconButton, PersonLink } from "./primitives";

export function Messages({ initialHandle }: { initialHandle?: string | undefined } = {}) {
  const { user, profile: myProfile } = useAuth();
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const { data: conversations } = useQuery({
    queryKey: ["conversations", user?.id ?? null],
    queryFn: () => listConversations(user!.id),
    enabled: Boolean(user),
    refetchInterval: 5000,
  });

  const { data: pendingPerson } = useQuery({
    queryKey: ["profile-by-username", initialHandle],
    queryFn: () => getProfileByUsername(initialHandle!),
    enabled: Boolean(user) && Boolean(initialHandle),
  });

  useEffect(() => {
    if (pendingPerson) setOpenId(pendingPerson.id);
  }, [pendingPerson]);

  if (!user || !myProfile) {
    return (
      <div className="grid min-h-64 place-items-center px-4 text-center">
        <p className="text-sm text-muted-foreground">Entra para ver as tuas mensagens.</p>
      </div>
    );
  }

  const known = conversations ?? [];
  const activePerson =
    known.find((item) => item.person.id === openId)?.person ??
    (pendingPerson?.id === openId ? pendingPerson : null);

  const active: Conversation | null = activePerson
    ? (known.find((item) => item.person.id === openId) ?? {
        person: activePerson,
        last: {
          id: "",
          sender_id: "",
          recipient_id: "",
          text: null,
          media_url: null,
          media_type: null,
          read_at: null,
          created_at: new Date().toISOString(),
        },
        unread: 0,
      })
    : null;

  const term = query.trim().toLowerCase();
  const filtered = known.filter((item) =>
    `${item.person.name} @${item.person.username}`.toLowerCase().includes(term),
  );

  return (
    <div className="lg:grid lg:h-dvh lg:grid-cols-[360px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
      <section
        aria-label="Conversas"
        className={cn(
          "mx-auto w-full max-w-xl flex-col lg:mx-0 lg:flex lg:min-h-0 lg:max-w-none lg:border-r lg:border-border",
          openId ? "hidden" : "flex",
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
                key={item.person.id}
                item={item}
                selected={item.person.id === openId}
                onOpen={() => setOpenId(item.person.id)}
              />
            ))
          ) : (
            <li className="px-4 py-10 text-center text-sm text-muted-foreground">
              {known.length === 0 ? "Ainda não tens conversas." : "Nenhuma conversa com esse nome."}
            </li>
          )}
        </ul>
      </section>

      {active ? (
        <ChatPane
          key={active.person.id}
          myId={user.id}
          person={active.person}
          onBack={() => setOpenId(null)}
          onSent={() => queryClient.invalidateQueries({ queryKey: ["conversations"] })}
        />
      ) : (
        <section className="hidden items-center justify-center text-sm text-muted-foreground lg:flex">
          Escolhe uma conversa para começar.
        </section>
      )}
    </div>
  );
}

function ConversationRow({
  item,
  selected,
  onOpen,
}: {
  item: Conversation;
  selected: boolean;
  onOpen: () => void;
}) {
  const preview = item.last.media_url
    ? item.last.media_type === "video"
      ? "Enviou um vídeo"
      : "Enviou uma foto"
    : (item.last.text ?? "");

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
              <span
                className={cn("truncate text-[15px]", item.unread ? "font-bold" : "font-semibold")}
              >
                {item.person.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                @{item.person.username}
              </span>
            </span>
            <span
              className={cn(
                "mt-1 block truncate text-sm",
                item.unread ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {preview}
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-end gap-1.5 self-start pt-0.5">
            <span className="text-xs text-muted-foreground">{clockTime(item.last.created_at)}</span>
            {item.unread > 0 ? (
              <span
                className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground"
                aria-label={`${item.unread} mensagens por ler`}
              >
                {item.unread}
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
  myId,
  person,
  onBack,
  onSent,
}: {
  myId: string;
  person: Profile;
  onBack: () => void;
  onSent: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<{
    file: File;
    url: string;
    kind: "image" | "video";
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const { data: thread } = useQuery({
    queryKey: ["thread", myId, person.id],
    queryFn: () => listThread(myId, person.id),
    refetchInterval: 4000,
  });

  useEffect(() => {
    markThreadRead(myId, person.id).then(onSent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person.id]);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [thread?.length]);

  const send = useMutation({
    mutationFn: async () => {
      let mediaUrl: string | null = null;
      let mediaType: string | null = null;
      if (attachment) {
        const uploaded = await uploadMedia(attachment.file, myId);
        mediaUrl = uploaded.url;
        mediaType = uploaded.type;
      }
      await sendMessage({
        senderId: myId,
        recipientId: person.id,
        text: draft.trim() || null,
        mediaUrl,
        mediaType,
      });
    },
    onSuccess: () => {
      setDraft("");
      if (attachment) URL.revokeObjectURL(attachment.url);
      setAttachment(null);
      queryClient.invalidateQueries({ queryKey: ["thread", myId, person.id] });
      onSent();
    },
  });

  const pickFile = (file: File | null) => {
    if (attachment) URL.revokeObjectURL(attachment.url);
    if (!file) {
      setAttachment(null);
      return;
    }
    setAttachment({
      file,
      url: URL.createObjectURL(file),
      kind: file.type.startsWith("video/") ? "video" : "image",
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() && !attachment) return;
    send.mutate();
  };

  return (
    <section
      aria-label={`Conversa com ${person.name}`}
      className="flex-col bg-background lg:static lg:z-auto lg:flex lg:min-h-0 fixed inset-0 z-50 flex"
    >
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-3 lg:px-5">
        <IconButton label="Voltar às conversas" onClick={onBack} className="lg:hidden">
          <ArrowLeft />
        </IconButton>
        <PersonLink
          person={person}
          className="flex min-w-0 flex-1 items-center gap-2 hover:opacity-80"
        >
          <Avatar person={person} size="sm" />
          <span className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[15px] font-bold">{person.name}</p>
            <p className="truncate text-xs text-muted-foreground">@{person.username}</p>
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
            <p className="text-sm text-muted-foreground">@{person.username}</p>
          </div>
          <ol className="space-y-1.5">
            {(thread ?? []).map((message, index, list) => (
              <MessageBubble
                key={message.id}
                message={message}
                mine={message.sender_id === myId}
                startsGroup={list[index - 1]?.sender_id !== message.sender_id}
                index={index}
              />
            ))}
          </ol>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 lg:px-8 lg:pb-5"
      >
        {attachment && (
          <div className="mx-auto mb-2 max-w-2xl">
            <div className="relative inline-block h-20 w-20 overflow-hidden rounded-xl bg-secondary">
              {attachment.kind === "video" ? (
                <video src={attachment.url} muted playsInline className="size-full object-cover" />
              ) : (
                <img src={attachment.url} alt="" className="size-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => pickFile(null)}
                aria-label="Remover anexo"
                className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
        />
        <div className="mx-auto flex max-w-2xl items-center gap-1 rounded-full bg-secondary p-1.5 transition-shadow focus-within:ring-2 focus-within:ring-ring">
          <IconButton label="Anexar foto ou vídeo" onClick={() => fileRef.current?.click()}>
            <ImagePlus />
          </IconButton>
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label="Escrever mensagem"
            placeholder="Escrever mensagem..."
            className="h-10 min-w-0 flex-1 bg-transparent px-1 text-[15px] outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            aria-label="Enviar mensagem"
            disabled={(!draft.trim() && !attachment) || send.isPending}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-[opacity,transform] hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:bg-accent disabled:text-muted-foreground"
          >
            <Send className="size-[18px]" />
          </button>
        </div>
      </form>
    </section>
  );
}

function MessageBubble({
  message,
  mine,
  startsGroup,
  index,
}: {
  message: Message;
  mine: boolean;
  startsGroup: boolean;
  index: number;
}) {
  return (
    <li className={cn("flex", mine && "justify-end", startsGroup && index > 0 && "pt-2.5")}>
      <div
        className={cn(
          "max-w-[80%] overflow-hidden rounded-3xl text-[15px] leading-6",
          mine ? "rounded-br-lg bg-primary text-primary-foreground" : "rounded-bl-lg bg-secondary",
          message.media_url ? "p-1" : "px-4 py-2.5",
        )}
      >
        {message.media_url &&
          (message.media_type === "video" ? (
            <video src={message.media_url} controls className="max-h-72 w-full rounded-[1.25rem]" />
          ) : (
            <img
              src={message.media_url}
              alt=""
              className="max-h-72 w-full rounded-[1.25rem] object-cover"
            />
          ))}
        {message.text && (
          <p className={message.media_url ? "px-3 py-2" : undefined}>{message.text}</p>
        )}
      </div>
    </li>
  );
}
