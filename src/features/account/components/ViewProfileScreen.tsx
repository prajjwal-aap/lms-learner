"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { PostCard, usePosts } from "@/features/community";
import { useProfile } from "../api/account.queries";
import { formatBirthDate } from "../lib/format";
import { AccountShell, AccountStatus, accountCard } from "./AccountShell";
import { ProfileAvatar } from "./ProfileAvatar";

/** The learner's public-facing profile plus the community posts they wrote. */
export function ViewProfileScreen() {
  const { data: profile, isLoading, error } = useProfile();
  const { data: posts, isLoading: postsLoading } = usePosts();
  const myPosts = posts?.filter((p) => p.byMe) ?? [];

  if (!profile) {
    return (
      <AccountShell title="My profile">
        <AccountStatus loading={isLoading} error={error} />
      </AccountShell>
    );
  }

  const location = [profile.state, profile.country].filter(Boolean).join(", ");

  return (
    <AccountShell title="My profile">
      <section className={`${accountCard} flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left`}>
        <ProfileAvatar name={profile.name} avatarUrl={profile.avatarUrl} size="h-28 w-28 text-4xl" editable />
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{profile.name || "Learner"}</h2>
          <ul className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-sm text-gray-600 sm:justify-start">
            {location && (
              <li>
                <i className="fa-solid fa-location-dot mr-1.5 text-gray-400" />
                {location}
              </li>
            )}
            {profile.dob && (
              <li>
                <i className="fa-solid fa-cake-candles mr-1.5 text-gray-400" />
                {formatBirthDate(profile.dob)}
              </li>
            )}
            <li>
              <i className="fa-solid fa-pen-to-square mr-1.5 text-gray-400" />
              {myPosts.length} {myPosts.length === 1 ? "post" : "posts"}
            </li>
          </ul>
          <Link href={ROUTES.account.personalInfo} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <i className="fa-solid fa-pen text-xs" />
            Edit personal information
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Community posts</h2>
        {postsLoading ? (
          <div className={`${accountCard} h-32 animate-pulse bg-gray-50`} />
        ) : myPosts.length === 0 ? (
          <div className={`${accountCard} text-center`}>
            <p className="text-sm text-gray-500">You haven&apos;t posted in the community yet.</p>
            <Link href={ROUTES.community} className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline">
              Go to Community
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>
    </AccountShell>
  );
}
