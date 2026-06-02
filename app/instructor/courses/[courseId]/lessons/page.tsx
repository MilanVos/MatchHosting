"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ChevronLeft, Save, X, Pencil } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  slug: string;
  order: number;
  videoUrl: string | null;
};

type LessonForm = {
  title: string;
  content: string;
  videoUrl: string;
};

const emptyForm: LessonForm = { title: "", content: "", videoUrl: "" };

export default function LessonsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LessonForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && session?.user?.role !== "INSTRUCTOR" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    fetch(`/api/admin/courses/${courseId}/lessons`)
      .then((r) => r.json())
      .then(setLessons);

    fetch(`/api/admin/courses`)
      .then((r) => r.json())
      .then((courses: { id: string; title: string }[]) => {
        const course = courses.find((c) => c.id === courseId);
        if (course) setCourseName(course.title);
      });
  }, [courseId]);

  const handleSave = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);

    if (editingId) {
      const res = await fetch(`/api/admin/courses/${courseId}/lessons/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setLessons((prev) => prev.map((l) => l.id === editingId ? { ...l, ...updated } : l));
        cancelForm();
      }
    } else {
      const res = await fetch(`/api/admin/courses/${courseId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const lesson = await res.json();
        setLessons((prev) => [...prev, lesson]);
        cancelForm();
      }
    }

    setSaving(false);
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setForm({ title: lesson.title, content: "", videoUrl: lesson.videoUrl ?? "" });
    setShowForm(true);

    fetch(`/api/courses/${lesson.id}/content`)
      .catch(() => null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze les wilt verwijderen?")) return;
    const res = await fetch(`/api/admin/courses/${courseId}/lessons/${id}`, { method: "DELETE" });
    if (res.ok) setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const startNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/instructor" className="text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-gray-500 text-sm">{courseName}</p>
          <h1 className="text-2xl font-bold text-white">Lessen beheren</h1>
        </div>
        <div className="ml-auto">
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 gradient-bg rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Nieuwe les
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-[#2d2d3e] bg-[#13131a] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">
              {editingId ? "Les bewerken" : "Nieuwe les"}
            </h2>
            <button onClick={cancelForm} className="text-gray-500 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <input
            placeholder="Lestitel..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-xl bg-[#1e1e2e] border border-[#2d2d3e] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />

          <input
            placeholder="Video URL (optioneel, bijv. YouTube embed link)"
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            className="w-full rounded-xl bg-[#1e1e2e] border border-[#2d2d3e] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />

          <div>
            <p className="text-gray-500 text-xs mb-1.5">
              Lesinhoud — ondersteunt Markdown (# Kop, **vet**, ```code```, etc.)
            </p>
            <textarea
              placeholder="# Les 1: Introductie&#10;&#10;Schrijf hier de lesinhoud in Markdown..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={16}
              className="w-full rounded-xl bg-[#1e1e2e] border border-[#2d2d3e] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-y font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !form.title || !form.content}
              className="inline-flex items-center gap-2 gradient-bg rounded-xl px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
            <button onClick={cancelForm} className="text-gray-400 hover:text-white text-sm transition-colors">
              Annuleren
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 text-sm font-mono w-6 text-center">{lesson.order}</span>
              <div>
                <p className="text-white font-medium">{lesson.title}</p>
                {lesson.videoUrl && (
                  <p className="text-gray-500 text-xs mt-0.5">📹 Video gekoppeld</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(lesson)}
                className="rounded-lg border border-[#2d2d3e] px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:border-indigo-500/40 transition-all flex items-center gap-1"
              >
                <Pencil className="h-3.5 w-3.5" /> Bewerken
              </button>
              <button
                onClick={() => handleDelete(lesson.id)}
                className="rounded-lg border border-[#2d2d3e] px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:border-red-500/40 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {lessons.length === 0 && !showForm && (
          <div className="text-center text-gray-500 py-16">
            Nog geen lessen. Klik op &quot;Nieuwe les&quot; om te beginnen.
          </div>
        )}
      </div>
    </div>
  );
}
