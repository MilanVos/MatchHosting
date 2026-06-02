"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit2, Trash2, Eye, EyeOff, BookOpen } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  published: boolean;
}

interface Props {
  mode: "create" | "edit";
  course?: Course;
}

const CATEGORIES = [
  { value: "networking", label: "Netwerken" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "webdev", label: "Webdevelopment" },
  { value: "cloud", label: "Cloud & DevOps" },
  { value: "sysadmin", label: "Systeembeheer" },
  { value: "programming", label: "Programmeren" },
];

const LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Gevorderd" },
  { value: "ADVANCED", label: "Expert" },
];

export default function CourseAdminActions({ mode, course }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: course?.title ?? "",
    description: course?.description ?? "",
    category: course?.category ?? "networking",
    level: course?.level ?? "BEGINNER",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const url =
      mode === "create"
        ? "/api/admin/courses"
        : `/api/admin/courses/${course!.id}`;

    const method = mode === "create" ? "POST" : "PATCH";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    setShowModal(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je deze cursus wilt verwijderen?")) return;
    await fetch(`/api/admin/courses/${course!.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function togglePublish() {
    await fetch(`/api/admin/courses/${course!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !course!.published }),
    });
    router.refresh();
  }

  if (mode === "create") {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 gradient-bg rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Cursus toevoegen
        </button>

        {showModal && (
          <Modal
            title="Cursus toevoegen"
            onClose={() => setShowModal(false)}
          >
            <CourseForm
              form={form}
              setForm={setForm}
              onSubmit={handleSubmit}
              loading={loading}
              submitLabel="Aanmaken"
            />
          </Modal>
        )}
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/instructor/courses/${course!.id}/lessons`}
        className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-400/10 transition-colors"
        title="Lessen beheren"
      >
        <BookOpen className="h-4 w-4" />
      </Link>
      <button
        onClick={togglePublish}
        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#2d2d3e] transition-colors"
        title={course!.published ? "Depubliceren" : "Publiceren"}
      >
        {course!.published ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
      <button
        onClick={() => setShowModal(true)}
        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#2d2d3e] transition-colors"
        title="Bewerken"
      >
        <Edit2 className="h-4 w-4" />
      </button>
      <button
        onClick={handleDelete}
        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        title="Verwijderen"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {showModal && (
        <Modal title="Cursus bewerken" onClose={() => setShowModal(false)}>
          <CourseForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Opslaan"
          />
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function CourseForm({
  form,
  setForm,
  onSubmit,
  loading,
  submitLabel,
}: {
  form: { title: string; description: string; category: string; level: string };
  setForm: (f: typeof form) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  submitLabel: string;
}) {
  const inputClass =
    "w-full rounded-lg border border-[#2d2d3e] bg-[#0f0f16] px-4 py-3 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors text-sm";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Titel</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputClass}
          placeholder="Cursustitel"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Beschrijving</label>
        <textarea
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`${inputClass} h-24 resize-none`}
          placeholder="Beschrijving van de cursus"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Categorie</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-[#13131a]">
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Niveau</label>
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            className={inputClass}
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value} className="bg-[#13131a]">
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full gradient-bg rounded-lg py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity mt-2"
      >
        {loading ? "Bezig..." : submitLabel}
      </button>
    </form>
  );
}
