import { mockDelay } from "@/lib/mockApi";
import type { CommunitySidebar, HeroSlide, Post, PostComment } from "../types";
import { MOCK_HERO_SLIDES, MOCK_POSTS, MOCK_SIDEBAR } from "./community.mock";

// In-memory copy so likes/comments survive refetches during the session.
let posts: Post[] = structuredClone(MOCK_POSTS);

const findPost = (id: string) => {
  const post = posts.find((p) => p.id === id);
  if (!post) throw new Error("Post not found");
  return post;
};

// Mock implementation. With a backend: `apiClient.get<CommunitySidebar>("/community/sidebar")`.
export async function getSidebar(): Promise<CommunitySidebar> {
  await mockDelay();
  return MOCK_SIDEBAR;
}

// Mock implementation. With a backend: `apiClient.get<HeroSlide[]>("/community/banners")`.
export async function getHeroSlides(): Promise<HeroSlide[]> {
  await mockDelay();
  return MOCK_HERO_SLIDES;
}

// Mock implementation. With a backend: `apiClient.get<Post[]>("/community/posts")`.
export async function getPosts(): Promise<Post[]> {
  await mockDelay();
  return posts;
}

// Mock implementation. With a backend: `apiClient.post<Post>(`/community/posts/${postId}/like`)`.
export async function togglePostLike(postId: string): Promise<Post> {
  await mockDelay(80);
  const p = findPost(postId);
  const updated: Post = { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) };
  posts = posts.map((x) => (x.id === postId ? updated : x));
  return updated;
}

// Mock implementation. With a backend: `apiClient.post<Post>(`/community/posts/${postId}/comments`, { text })`.
export async function addPostComment(input: { postId: string; text: string }): Promise<Post> {
  await mockDelay(80);
  const p = findPost(input.postId);
  const comment: PostComment = { id: `c-${Date.now()}`, author: "You", text: input.text, postedAgo: "now" };
  const updated: Post = { ...p, comments: [...p.comments, comment] };
  posts = posts.map((x) => (x.id === input.postId ? updated : x));
  return updated;
}

// Mock implementation. With a backend: `apiClient.post<Post>("/community/posts", input)`.
export async function createPost(input: { text: string; channelId: string; channelName: string }): Promise<Post> {
  await mockDelay(150);
  const post: Post = {
    id: `post-${Date.now()}`,
    pinned: false,
    author: { name: "You" },
    postedAgo: "now",
    postedAt: new Date().toISOString(),
    channelId: input.channelId,
    channelName: input.channelName,
    paragraphs: input.text.split(/\n+/).map((text) => ({ text })),
    likes: 0,
    likedByMe: false,
    views: 0,
    comments: [],
    byMe: true,
  };
  posts = [post, ...posts];
  return post;
}
