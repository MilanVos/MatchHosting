"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Heart, MessageSquare, Send } from "lucide-react";
import StaffBadge from "@/components/StaffBadge";

type Reply = { id: string; content: string; createdAt: string; user: { name: string; level: number; role: string } };
type Post = {
  id: string; title: string; content: string; category: string; createdAt: string;
  user: { name: string; level: number; role: string };
  replies: Reply[];
  _count: { likes: number };
};

export default function ForumPostPage() {
  const { postId } = useParams<{ postId: string }>();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [reply, setReply] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetch(`/api/forum/${postId}`).then((r) => r.json()).then((data) => {
      setPost(data);
      setLikeCount(data._count?.likes ?? 0);
    });
  }, [postId]);

  const handleLike = async () => {
    const res = await fetch(`/api/forum/${postId}/like`, { method: "POST" });
    if (res.ok) {
      const { liked: isLiked } = await res.json();
      setLiked(isLiked);
      setLikeCount((prev) => prev + (isLiked ? 1 : -1));
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    const res = await fetch(`/api/forum/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reply }),
    });
    if (res.ok) {
      const newReply = await res.json();
      setPost((prev) => prev ? { ...prev, replies: [...prev.replies, newReply] } : prev);
      setReply("");
    }
  };

  if (!post) return <div className="min-h-screen flex items-center justify-center text-gray-500">Laden...</div>;

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <Link href="/forum" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Terug naar forum
      </Link>

      <div className="rounded-2xl border border-[#2d2d3e] bg-[#13131a] p-8 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs text-indigo-400">
            {post.category}
          </span>
          <span className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleDateString("nl-NL")}</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#2d2d3e]">
          <span className="flex items-center gap-1.5 text-indigo-400 text-sm font-medium">
            Lvl {post.user.level} {post.user.name}
            <StaffBadge role={post.user.role as "ADMIN" | "INSTRUCTOR" | "STUDENT"} />
          </span>
          {session && (
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-red-400" : "text-gray-400 hover:text-red-400"}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              {likeCount}
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-gray-400 text-sm">
        <MessageSquare className="h-4 w-4" />
        {post.replies.length} antwoorden
      </div>

      <div className="space-y-4 mb-8">
        {post.replies.map((r) => (
          <div key={r.id} className="rounded-xl border border-[#1e1e2e] bg-[#0f0f16] p-5">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{r.content}</p>
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5 text-indigo-400">
                Lvl {r.user.level} {r.user.name}
                <StaffBadge role={r.user.role as "ADMIN" | "INSTRUCTOR" | "STUDENT"} />
              </span>
              <span>{new Date(r.createdAt).toLocaleDateString("nl-NL")}</span>
            </div>
          </div>
        ))}
      </div>

      {session ? (
        <div className="rounded-2xl border border-[#2d2d3e] bg-[#13131a] p-6">
          <h3 className="text-white font-semibold mb-4">Reageren</h3>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Schrijf je antwoord..."
            rows={4}
            className="w-full rounded-xl bg-[#1e1e2e] border border-[#2d2d3e] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none mb-3"
          />
          <button
            onClick={handleReply}
            className="inline-flex items-center gap-2 gradient-bg rounded-xl px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Send className="h-4 w-4" />
            Verstuur
          </button>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Link href="/auth/login" className="text-indigo-400 hover:underline">Log in</Link> om te reageren.
        </div>
      )}
    </div>
  );
}
