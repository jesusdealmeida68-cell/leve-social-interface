import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Feed } from "./leve/feed";
import { Messages } from "./leve/messages";
import { Composer, PostDetail, StoryViewer, type ComposerMode } from "./leve/overlays";
import { Profile } from "./leve/profile";
import { BottomDock, MobileHeader, NotificationPanel, Sidebar } from "./leve/shell";
import { Stories } from "./leve/stories";
import type { Post, Section } from "./leve/data";

/** Estrutura comum do LEVE: navegação, área de conteúdo e as camadas (histórias, criar, detalhe). */
export function LeveApp({ section }: { section: Section }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
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
        onCreate={() => setComposer("post")}
        onNotifications={() => setNotificationsOpen((value) => !value)}
        notificationsOpen={notificationsOpen}
      />

      <main className="pb-28 lg:ml-[248px] lg:pb-0">
        {section === "feed" && (
          <Feed
            onStory={setStoryIndex}
            onPost={setOpenPost}
            onCreate={() => setComposer("story")}
            notificationsOpen={notificationsOpen}
            onNotifications={() => setNotificationsOpen((value) => !value)}
          />
        )}
        {section === "messages" && <Messages />}
        {section === "stories" && (
          <Stories onStory={setStoryIndex} onCreate={() => setComposer("story")} />
        )}
        {section === "profile" && <Profile onPost={setOpenPost} />}
      </main>

      <BottomDock section={section} />

      <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <StoryViewer
        index={storyIndex}
        onClose={() => setStoryIndex(null)}
        onChange={setStoryIndex}
      />
      <Composer mode={composer} onClose={() => setComposer(null)} />
      <PostDetail post={openPost} onClose={() => setOpenPost(null)} />
    </div>
  );
}
