import { Grid3x3, SendHorizonal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getProfileByUsername, getProfileStats, listPostsByUser } from "@/lib/leve";
import { Avatar, formatCount, PostThumb } from "./primitives";

export function Profile({ handle }: { handle?: string | undefined } = {}) {
  const { user, profile: myProfile } = useAuth();
  const isMe = !handle || handle === myProfile?.username;

  const { data: otherProfile, isLoading: loadingOther } = useQuery({
    queryKey: ["profile-by-username", handle],
    queryFn: () => getProfileByUsername(handle!),
    enabled: !isMe && Boolean(handle),
  });

  const person = isMe ? myProfile : otherProfile;

  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ["posts-by-user", person?.id ?? null, user?.id ?? null],
    queryFn: () => listPostsByUser(person!.id, user?.id ?? null),
    enabled: Boolean(person),
  });

  const { data: stats } = useQuery({
    queryKey: ["profile-stats", person?.id ?? null],
    queryFn: () => getProfileStats(person!.id),
    enabled: Boolean(person),
  });

  if (!person) {
    return (
      <div className="grid min-h-64 place-items-center px-4 text-center">
        <p className="text-sm text-muted-foreground">
          {loadingOther ? "A carregar perfil..." : "Este perfil não existe."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] pb-8">
      <div className="relative h-40 overflow-hidden bg-secondary sm:h-56 sm:rounded-b-[2rem]">
        {person.cover_url && (
          <img
            src={person.cover_url}
            alt=""
            className="size-full object-cover"
            width={1200}
            height={1504}
          />
        )}
        <div className="absolute inset-0 bg-cover-overlay" aria-hidden="true" />
      </div>

      <section className="relative px-4 sm:px-8" aria-label="Sobre o perfil">
        <div className="-mt-12 flex items-end justify-between gap-3 sm:-mt-14">
          <span className="rounded-full border-4 border-background">
            <Avatar person={person} size="lg" />
          </span>
          <div className="flex items-center gap-2 pb-1">
            {isMe ? (
              <Button>Editar perfil</Button>
            ) : (
              <Button asChild>
                <Link to="/mensagens" search={{ to: person.username }}>
                  <SendHorizonal className="size-4" />
                  Mensagem
                </Link>
              </Button>
            )}
          </div>
        </div>

        <h1 className="mt-4 font-display text-2xl font-semibold">{person.name}</h1>
        <p className="text-sm text-muted-foreground">@{person.username}</p>
        {person.bio && (
          <p className="mt-4 max-w-lg text-[15px] leading-6 text-foreground/85">{person.bio}</p>
        )}

        <dl className="mt-5 flex gap-6 whitespace-nowrap text-sm">
          <div className="flex items-baseline gap-1.5">
            <dt className="order-2 text-muted-foreground">seguidores</dt>
            <dd className="font-bold">{formatCount(stats?.followers ?? 0)}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="order-2 text-muted-foreground">a seguir</dt>
            <dd className="font-bold">{formatCount(stats?.following ?? 0)}</dd>
          </div>
        </dl>

        <div className="mt-6 flex border-b border-border">
          <span className="-mb-px flex h-12 items-center gap-2 border-b-2 border-primary px-4 text-sm font-semibold">
            <Grid3x3 className="size-4" />
            Publicações
          </span>
        </div>
      </section>

      {loadingPosts ? (
        <div className="grid grid-cols-2 gap-3 px-4 sm:px-8">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="aspect-[4/5] animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 px-4 sm:px-8">
          {posts.map((post) => (
            <PostThumb key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="mx-4 mt-6 grid min-h-40 place-items-center rounded-3xl border border-dashed border-border text-center sm:mx-8">
          <p className="px-6 text-sm text-muted-foreground">
            {person.name.split(" ")[0]} ainda não tem publicações.
          </p>
        </div>
      )}
    </div>
  );
}
