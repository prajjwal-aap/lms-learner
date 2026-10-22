"use client";

import { MessageCircleMore } from "lucide-react";
import { useState } from "react";
import { useCommunitySidebar } from "../api/community.queries";
import { ChannelSidebar, MobileChannelBar } from "./ChannelSidebar";
import { FeedSection } from "./FeedSection";
import { HeroCarousel } from "./HeroCarousel";
import { PostComposer } from "./PostComposer";
import { StartLearningWidget } from "./StartLearningWidget";
import { UpcomingLiveWidget } from "./UpcomingLiveWidget";

/** Community page: channels sidebar, feed column and "Start learning" widget. */
export function CommunityScreen() {
  const { data: sidebar } = useCommunitySidebar();
  const [activeId, setActiveId] = useState("feed");
  const [composing, setComposing] = useState(false);

  const channel = sidebar?.groups.flatMap((g) => g.channels).find((c) => c.id === activeId);
  const sidebarProps = {
    data: sidebar,
    activeId,
    onSelect: (id: string) => {
      setActiveId(id);
      setComposing(false);
    },
    onCreate: () => setComposing(true),
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1920px] bg-[#fbfbfb] text-gray-800">
      <ChannelSidebar {...sidebarProps} />

      <main className="flex min-w-0 flex-1 flex-col items-center p-4 sm:p-6">
        <div className="w-full max-w-[660px] space-y-6">
          <MobileChannelBar {...sidebarProps} />

          {composing && (
            <PostComposer
              channelId={channel?.id ?? "feed"}
              channelName={channel?.name ?? "Community Feed"}
              onClose={() => setComposing(false)}
            />
          )}

          {activeId === "messages" ? (
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Messages</h3>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-400">
                  <MessageCircleMore className="size-[18px]" />
                </div>
                <p className="max-w-sm text-xs leading-relaxed text-gray-500">
                  You have 1 unread message from Occult Gurukul. Direct messaging will be available here soon.
                </p>
              </div>
            </section>
          ) : channel ? (
            <FeedSection key={channel.id} channelId={channel.id} title={channel.name} />
          ) : (
            <>
              <HeroCarousel />
              <UpcomingLiveWidget />
              <FeedSection title="Feed" />
            </>
          )}
        </div>
      </main>

      <StartLearningWidget />
    </div>
  );
}
