import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Feed } from "./leve/feed";
import { Messages } from "./leve/messages";
import { Composer, PostDetail, type ComposerMode } from "./leve/overlays";
import { Profile } from "./leve/profile";
import { MobileHeader, NotificationPanel, Sidebar } from "./leve/shell";
import type { Post, Section } from "./leve/data";

/** Estrutura comum do LEVE: navegação, área de conteúdo e as camadas (criar, detalhe). */
export function LeveApp({ section }: { section: Section }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [composer, setComposer] = useState<ComposerMode>(null);
  const [openPost, setOpenPost] = useState<Post | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setNotificationsOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Sidebar section={section} onCreate={() => setComposer("post")} />
      <MobileHeader
        section={section}
        onCreate={() => setComposer("post")}
        onNotifications={() => setNotificationsOpen((value) => !value)}
        notificationsOpen={notificationsOpen}
      />

      <main className="lg:ml-[248px]">
        {section === "feed" && (
          <Feed
            onPost={setOpenPost}
            notificationsOpen={notificationsOpen}
            onNotifications={() => setNotificationsOpen((value) => !value)}
          />
        )}
        {section === "messages" && <Messages />}
        {section === "profile" && <Profile onPost={setOpenPost} />}
      </main>

      <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <Composer mode={composer} onClose={() => setComposer(null)} />
      <PostDetail post={openPost} onClose={() => setOpenPost(null)} />
    </div>
  );
}
