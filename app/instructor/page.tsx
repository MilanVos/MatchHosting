"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, BookOpen, Users, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

type Course = {
  id: string; title: string; slug: string; category: string; level: string;
  published: boolean; _count?: { lessons: number; enrollments: number };
};

export default function InstructorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "networking", level: "BEGINNER" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && session?.user?.role !== "INSTRUCTOR" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    fetch("/api/admin/courses").then((r) => r.json()).then(setCourses);
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.description) return;
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug: form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }),
    });
    if (res.ok) {
      const course = await res.json();
      setCourses((prev) => [course, ...prev]);
      setShowNew(false);
      setForm({ title: "", description: "", category: "networking", level: "BEGINNER" });
    }
  };

  const togglePublish = async (course: Course) => {
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !course.published }),
    });
    if (res.ok) {
      setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, published: !c.published } : c));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze cursus wilt verwijderen?")) return;
    const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    if (res.ok) setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Docenten Dashboard</h1>
          <p className="text-gray-400 mt-1">Beheer jouw cursussen en lessen</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="inline-flex items-center gap-2 gradient-bg rounded-xl px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Nieuwe cursus
        </button>
      </div>

      {showNew && (
        <div className="mb-6 rounded-2xl border border-[#2d2d3e] bg-[#13131a] p-6 space-y-4">
          <h2 className="text-white font-semibold">Cursus aanmaken</h2>
          <input
            placeholder="Cursustitel..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-xl bg-[#1e1e2e] border border-[#2d2d3e] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          <textarea
            placeholder="Beschrijving..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-xl bg-[#1e1e2e] border border-[#2d2d3e] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
          <div className="flex gap-3">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-xl bg-[#1e1e2e] border border-[#2d2d3e] px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
              {["networking", "cybersecurity", "webdev", "cloud", "sysadmin", "programming"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="rounded-xl bg-[#1e1e2e] border border-[#2d2d3e] px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Gevorderd</option>
              <option value="ADVANCED">Expert</option>
            </select>
            <button onClick={handleCreate} className="gradient-bg rounded-xl px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
              Aanmaken
            </button>
            <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-white text-sm transition-colors">
              Annuleren
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {courses.map((course) => (
          <div key={course.id} className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    course.published ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  }`}>
                    {course.published ? "Gepubliceerd" : "Concept"}
                  </span>
                  <span className="text-gray-500 text-xs">{course.category} • {course.level}</span>
                </div>
                <h3 className="text-white font-semibold">{course.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course._count?.lessons ?? 0} lessen</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course._count?.enrollments ?? 0} studenten</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/admin/courses/${course.id}/lessons/new`}
                  className="rounded-lg border border-[#2d2d3e] px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:border-indigo-500/40 transition-all flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Les
                </Link>
                <button
                  onClick={() => togglePublish(course)}
                  className="rounded-lg border border-[#2d2d3e] px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:border-indigo-500/40 transition-all"
                >
                  {course.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <Link
                  href={`/courses/${course.slug}`}
                  className="rounded-lg border border-[#2d2d3e] px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:border-indigo-500/40 transition-all"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="rounded-lg border border-[#2d2d3e] px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:border-red-500/40 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="text-center text-gray-500 py-16">Nog geen cursussen. Maak je eerste cursus aan!</div>
        )}
      </div>
    </div>
  );
}
