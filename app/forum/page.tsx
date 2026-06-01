"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MessageSquare, Heart, Plus, Pin, Search } from "lucide-react";

const CATEGORIES = ["algemeen", "netwerken", "cybersecurity", "webdev", "cloud", "sysadmin", "programmeren", "vragen"];

type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  createdAt: string;
  user: { id: string; name: string; level: number };
  _count: { replies: number; likes: number };
};

export default function ForumPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState("alle");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("algemeen");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = category !== "alle" ? `/api/forum?category=${category}` : "/api/forum";
    fetch(url).then((r) => r.json()).then((data) => { setPosts(data); setLoading(false); });
  }, [category]);

  const filtered = posts.filter((p) =>
    search === "" || p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!newTitle || !newContent) return;
    const res = await fetch("/api/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, content: newContent, category: newCategory }),
    });
    if (res.ok) {
      const post = await res.json();
      setPosts((prev) => [post, ...prev]);
      setShowNew(false);
      setNewTitle("");
      setNewContent("");
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Community Forum</h1>
          <p className="text-gray-400 mt-1">Stel vragen, deel kennis en help anderen</p>
        </div>
        {session && (
          <button
            onClick={() => setShowNew(!showNew)}
            className="inline-flex items-center gap-2 gradient-bg rounded-xl px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Nieuw bericht
          </button>
        )}
      </div>

      {showNew && (
        <div className="mb-6 rounded-2xl border border-[#2d2d3e] bg-[#13131a] p-6 space-y-4">
          <h2 className="text-white font-semibold">Nieuw bericht plaatsen</h2>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Titel..."
            className="w-full rounded-xl bg-[#1e1e2e] border border-[#2d2d3e] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Schrijf je bericht..."
            rows={5}
            className="w-full rounded-xl bg-[#1e1e2e] border border-[#2d2d3e] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
          <div className="flex items-center gap-3">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="rounded-xl bg-[#1e1e2e] border border-[#2d2d3e] px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={handleSubmit}
              className="gradient-bg rounded-xl px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Plaatsen
            </button>
            <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-white text-sm transition-colors">
              Annuleren
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek berichten..."
            className="w-full rounded-xl bg-[#13131a] border border-[#2d2d3e] pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["alle", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                category === c ? "gradient-bg text-white" : "bg-[#13131a] border border-[#2d2d3e] text-gray-400 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-20">Laden...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-20">Geen berichten gevonden.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/forum/${post.id}`}
              className="block rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-5 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.pinned && <Pin className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />}
                    <span className="inline-block rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-xs text-indigo-400">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-lg truncate">{post.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{post.content}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="text-indigo-400 font-medium">Lvl {post.user.level} {post.user.name}</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{post._count.replies}</span>
                <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{post._count.likes}</span>
                <span className="ml-auto">{new Date(post.createdAt).toLocaleDateString("nl-NL")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
