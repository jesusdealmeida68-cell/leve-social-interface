import { supabase } from "@/integrations/supabase/client";

/* ------------------------------ Tipos ------------------------------ */

export type Profile = {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
};

export type Post = {
  id: string;
  user_id: string;
  caption: string;
  tags: string[];
  media_url: string | null;
  media_type: string;
  created_at: string;
  views: number;
  author: Profile;
  likes: number;
  comments: number;
  likedByMe: boolean;
};

/** Um ficheiro de uma publicação: foto ou vídeo. */
export type MediaItem = { url: string; type: "image" | "video" };

/** Máximo de fotos/vídeos numa só publicação. */
export const MAX_POST_MEDIA = 10;

export type Comment = {
  id: string;
  text: string;
  created_at: string;
  author: Profile;
};

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  text: string | null;
  media_url: string | null;
  media_type: string | null;
  read_at: string | null;
  created_at: string;
};

export type Conversation = {
  person: Profile;
  last: Message;
  unread: number;
};

export type Notification = {
  id: string;
  type: string;
  body: string | null;
  read: boolean;
  created_at: string;
  post_id: string | null;
  actor: Profile | null;
};

const PROFILE_FIELDS = "id, username, name, bio, avatar_url, cover_url";
const YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/* ------------------------------ Utilidades ------------------------------ */

export function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

export function clockTime(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

export function extractTags(caption: string): string[] {
  return Array.from(
    new Set((caption.match(/#[\p{L}\p{N}_]+/gu) ?? []).map((tag) => tag.slice(1).toLowerCase())),
  );
}

function fromRows<T extends { id: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((row) => [row.id, row]));
}

/** Perfil de reserva quando o autor já não existe. */
function unknownProfile(id: string): Profile {
  return {
    id,
    username: "desconhecido",
    name: "Conta removida",
    bio: null,
    avatar_url: null,
    cover_url: null,
  };
}

/* ------------------------------ Ficheiros ------------------------------ */

/** Envia uma foto ou vídeo e devolve um endereço assinado de longa duração. */
export async function uploadMedia(
  file: File,
  userId: string,
): Promise<{ url: string; type: "image" | "video" }> {
  const kind = file.type.startsWith("video/") ? "video" : "image";
  const extension = file.name.split(".").pop() ?? (kind === "video" ? "mp4" : "jpg");
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    ...(file.type ? { contentType: file.type } : {}),
  });
  if (error) throw error;

  const { data, error: signError } = await supabase.storage
    .from("media")
    .createSignedUrl(path, YEAR_IN_SECONDS);
  if (signError || !data) throw signError ?? new Error("Não foi possível preparar o ficheiro.");

  return { url: data.signedUrl, type: kind };
}

/* ------------------------------ Perfis ------------------------------ */

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(
  userId: string,
  values: {
    name?: string;
    bio?: string;
    avatar_url?: string;
    cover_url?: string;
    username?: string;
  },
): Promise<void> {
  const { error } = await supabase.from("profiles").update(values).eq("id", userId);
  if (error) throw error;
}

export async function getProfileStats(userId: string) {
  const [followers, following, postCount] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  return {
    followers: followers.count ?? 0,
    following: following.count ?? 0,
    posts: postCount.count ?? 0,
  };
}

export async function isFollowing(viewerId: string, targetId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", viewerId)
    .eq("following_id", targetId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function toggleFollow(viewerId: string, targetId: string, next: boolean) {
  if (next) {
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: viewerId, following_id: targetId });
    if (error && error.code !== "23505") throw error;
  } else {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", viewerId)
      .eq("following_id", targetId);
    if (error) throw error;
  }
}

/** Pessoas para sugerir: as mais recentes que o utilizador ainda não segue. */
export async function listSuggestions(viewerId: string | null): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw error;

  let followed: string[] = [];
  if (viewerId) {
    const { data: rows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", viewerId);
    followed = (rows ?? []).map((row) => row.following_id);
  }
  return (data ?? [])
    .filter((item) => item.id !== viewerId && !followed.includes(item.id))
    .slice(0, 5);
}

export async function searchProfiles(term: string): Promise<Profile[]> {
  const value = term.trim();
  if (!value) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .or(`username.ilike.%${value}%,name.ilike.%${value}%`)
    .limit(10);
  if (error) throw error;
  return data ?? [];
}

/* ------------------------------ Publicações ------------------------------ */

type PostRow = {
  id: string;
  user_id: string;
  caption: string;
  tags: string[];
  media_url: string | null;
  media_type: string;
  created_at: string;
  views: number;
};

async function decorate(rows: PostRow[], viewerId: string | null): Promise<Post[]> {
  if (rows.length === 0) return [];
  const authorIds = Array.from(new Set(rows.map((row) => row.user_id)));
  const postIds = rows.map((row) => row.id);

  const [{ data: authors }, { data: likeRows }, { data: commentRows }] = await Promise.all([
    supabase.from("profiles").select(PROFILE_FIELDS).in("id", authorIds),
    supabase.from("likes").select("post_id, user_id").in("post_id", postIds),
    supabase.from("comments").select("post_id").in("post_id", postIds),
  ]);

  const authorMap = fromRows(authors ?? []);
  return rows.map((row) => {
    const likes = (likeRows ?? []).filter((like) => like.post_id === row.id);
    return {
      ...row,
      author: authorMap.get(row.user_id) ?? unknownProfile(row.user_id),
      likes: likes.length,
      likedByMe: viewerId ? likes.some((like) => like.user_id === viewerId) : false,
      comments: (commentRows ?? []).filter((comment) => comment.post_id === row.id).length,
    };
  });
}

export async function listFeed(viewerId: string | null, search = ""): Promise<Post[]> {
  let query = supabase
    .from("posts")
    .select("id, user_id, caption, tags, media_url, media_type, created_at, views")
    .order("created_at", { ascending: false })
    .limit(50);

  const term = search.trim().replace(/^#/, "");
  if (term) {
    const authors = await searchProfiles(term);
    const authorFilter = authors.length
      ? `,user_id.in.(${authors.map((a) => a.id).join(",")})`
      : "";
    query = query.or(`caption.ilike.%${term}%,tags.cs.{${term.toLowerCase()}}${authorFilter}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return decorate(data ?? [], viewerId);
}

export async function listPostsByUser(userId: string, viewerId: string | null): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, user_id, caption, tags, media_url, media_type, created_at, views")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return decorate(data ?? [], viewerId);
}

export async function getPost(postId: string, viewerId: string | null): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, user_id, caption, tags, media_url, media_type, created_at, views")
    .eq("id", postId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [post] = await decorate([data], viewerId);
  return post ?? null;
}

const ANON_VIEWER_KEY = "leve-viewer-id";

/**
 * Quem está a ver: o id da conta com sessão iniciada, ou um id aleatório
 * guardado neste aparelho (para contar visualizações mesmo sem sessão).
 */
export function getViewerKey(userId: string | null): string {
  if (userId) return userId;
  try {
    const stored = window.localStorage.getItem(ANON_VIEWER_KEY);
    if (stored) return stored;
    const created = crypto.randomUUID();
    window.localStorage.setItem(ANON_VIEWER_KEY, created);
    return created;
  } catch {
    // Sem armazenamento (ex.: separador privado): esta visita não fica marcada,
    // por isso pode voltar a contar antes das 12 horas.
    return crypto.randomUUID();
  }
}

/**
 * Conta uma visualização ao abrir a publicação, no máximo uma vez a cada 12
 * horas por pessoa/aparelho. Devolve o total atualizado (ou o atual, se esta
 * visita não contou porque já tinha visto há menos de 12 horas).
 */
export async function registerPostView(postId: string, viewerKey: string): Promise<number | null> {
  const { data, error } = await supabase.rpc("register_post_view", {
    p_post_id: postId,
    p_viewer_key: viewerKey,
  });
  if (error) throw error;
  return data;
}

/** Uma conta tal como o administrador a vê, com telefone e código de verificação. */
export type AdminAccount = {
  id: string;
  username: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  phone_verified: boolean;
  verified: boolean;
  is_admin: boolean;
  verification_code: string | null;
  created_at: string;
};

/** Diz se a pessoa autenticada é administradora. Sem sessão, devolve false. */
export async function amIAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("am_i_admin");
  if (error) throw error;
  return data ?? false;
}

/** Lista todas as contas com os dados de administração. Vazio se não fores admin. */
export async function adminListAccounts(): Promise<AdminAccount[]> {
  const { data, error } = await supabase.rpc("admin_list_accounts");
  if (error) throw error;
  return data ?? [];
}

export async function adminSetPhoneVerified(targetId: string, next: boolean): Promise<void> {
  const { error } = await supabase.rpc("admin_set_phone_verified", { target_id: targetId, next });
  if (error) throw error;
}

export async function adminSetVerified(targetId: string, next: boolean): Promise<void> {
  const { error } = await supabase.rpc("admin_set_verified", { target_id: targetId, next });
  if (error) throw error;
}

export async function adminSetAdmin(targetId: string, next: boolean): Promise<void> {
  const { error } = await supabase.rpc("admin_set_admin", { target_id: targetId, next });
  if (error) throw error;
}

/** Gera um novo código de verificação para a conta (fica por verificar até o usar). */
export async function adminRegenerateCode(targetId: string): Promise<string> {
  const { data, error } = await supabase.rpc("admin_regenerate_code", { target_id: targetId });
  if (error) throw error;
  return data;
}

/** A própria pessoa confirma o número com o código de 6 dígitos que o admin lhe entregou.
 * Devolve true se o código estava certo (e passa a estar verificado); false se estava errado.
 * Um código só deixa de funcionar depois de ser usado com sucesso — sem limite de tempo. */
export async function verifyMyAccount(code: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("verify_my_account", { code });
  if (error) throw error;
  return data ?? false;
}

/** Se o número da própria conta já está verificado (para mostrar/esconder o aviso). */
export async function myPhoneVerified(): Promise<boolean> {
  const { data, error } = await supabase.rpc("my_phone_verified");
  if (error) throw error;
  return data ?? false;
}

/**
 * Lê os ficheiros de uma publicação. As publicações antigas (e as de um só ficheiro) guardam
 * apenas o endereço em `media_url`; as que têm vários ficheiros guardam ali uma lista em JSON.
 */
export function postMedia(post: Pick<Post, "media_url" | "media_type">): MediaItem[] {
  const raw = post.media_url;
  if (!raw) return [];
  if (raw.startsWith("[")) {
    try {
      const list: unknown = JSON.parse(raw);
      if (Array.isArray(list)) {
        return list.filter(
          (item): item is MediaItem =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as MediaItem).url === "string" &&
            ((item as MediaItem).type === "image" || (item as MediaItem).type === "video"),
        );
      }
    } catch {
      /* não é uma lista: trata como endereço simples */
    }
  }
  return [{ url: raw, type: post.media_type === "video" ? "video" : "image" }];
}

/** Inverso de `postMedia`: um ficheiro fica como endereço simples, vários ficam como lista. */
function encodeMedia(items: MediaItem[]): { url: string | null; type: "image" | "video" } {
  const [first] = items;
  if (!first) return { url: null, type: "image" };
  if (items.length === 1) return { url: first.url, type: first.type };
  return { url: JSON.stringify(items), type: first.type };
}

export async function createPost(input: { userId: string; caption: string; media: MediaItem[] }) {
  const stored = encodeMedia(input.media.slice(0, MAX_POST_MEDIA));
  const { error } = await supabase.from("posts").insert({
    user_id: input.userId,
    caption: input.caption,
    tags: extractTags(input.caption),
    media_url: stored.url,
    media_type: stored.type,
  });
  if (error) throw error;
}

export async function updatePost(postId: string, caption: string) {
  const { error } = await supabase
    .from("posts")
    .update({ caption, tags: extractTags(caption) })
    .eq("id", postId);
  if (error) throw error;
}

export async function deletePost(postId: string) {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function toggleLike(postId: string, userId: string, next: boolean) {
  if (next) {
    const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    if (error && error.code !== "23505") throw error;
  } else {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw error;
  }
}

export async function listComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("id, text, created_at, user_id")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const { data: authors } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .in("id", Array.from(new Set(rows.map((row) => row.user_id))));
  const authorMap = fromRows(authors ?? []);

  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    created_at: row.created_at,
    author: authorMap.get(row.user_id) ?? unknownProfile(row.user_id),
  }));
}

export async function addComment(postId: string, userId: string, text: string) {
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: userId,
    text,
  });
  if (error) throw error;
}

/* ------------------------------ Mensagens ------------------------------ */

export async function listConversations(myId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${myId},recipient_id.eq.${myId}`)
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw error;

  const rows = (data ?? []) as Message[];
  const byPerson = new Map<string, { last: Message; unread: number }>();
  for (const row of rows) {
    const otherId = row.sender_id === myId ? row.recipient_id : row.sender_id;
    const entry = byPerson.get(otherId) ?? { last: row, unread: 0 };
    if (row.recipient_id === myId && !row.read_at) entry.unread += 1;
    byPerson.set(otherId, entry);
  }
  if (byPerson.size === 0) return [];

  const { data: people } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .in("id", Array.from(byPerson.keys()));
  const peopleMap = fromRows(people ?? []);

  return Array.from(byPerson.entries())
    .map(([personId, entry]) => ({
      person: peopleMap.get(personId) ?? unknownProfile(personId),
      last: entry.last,
      unread: entry.unread,
    }))
    .sort((a, b) => b.last.created_at.localeCompare(a.last.created_at));
}

export async function listThread(myId: string, otherId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${myId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${myId})`,
    )
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(input: {
  senderId: string;
  recipientId: string;
  text: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
}) {
  const { error } = await supabase.from("messages").insert({
    sender_id: input.senderId,
    recipient_id: input.recipientId,
    text: input.text,
    media_url: input.mediaUrl ?? null,
    media_type: input.mediaType ?? null,
  });
  if (error) throw error;
}

export async function markThreadRead(myId: string, otherId: string) {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", myId)
    .eq("sender_id", otherId)
    .is("read_at", null);
  if (error) throw error;
}

export async function countUnreadMessages(myId: string): Promise<number> {
  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", myId)
    .is("read_at", null);
  if (error) throw error;
  return count ?? 0;
}

/* ------------------------------ Notificações ------------------------------ */

export async function listNotifications(myId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, body, read, created_at, post_id, actor_id")
    .eq("user_id", myId)
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) throw error;

  const rows = data ?? [];
  const actorIds = Array.from(
    new Set(rows.map((row) => row.actor_id).filter((id): id is string => Boolean(id))),
  );
  const { data: actors } = actorIds.length
    ? await supabase.from("profiles").select(PROFILE_FIELDS).in("id", actorIds)
    : { data: [] as Profile[] };
  const actorMap = fromRows(actors ?? []);

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    body: row.body,
    read: row.read,
    created_at: row.created_at,
    post_id: row.post_id,
    actor: row.actor_id ? (actorMap.get(row.actor_id) ?? null) : null,
  }));
}

export async function markNotificationsRead(myId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", myId)
    .eq("read", false);
  if (error) throw error;
}

export async function countUnreadNotifications(myId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", myId)
    .eq("read", false);
  if (error) throw error;
  return count ?? 0;
}
