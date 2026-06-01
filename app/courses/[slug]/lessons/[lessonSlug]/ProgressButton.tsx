"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface Props {
  lessonId: string;
  isCompleted: boolean;
  nextLessonHref: string;
}

export default function ProgressButton({
  lessonId,
  isCompleted,
  nextLessonHref,
}: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(isCompleted);
  const [loading, setLoading] = useState(false);

  async function toggleComplete() {
    setLoading(true);
    const newValue = !completed;

    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, completed: newValue }),
    });

    setCompleted(newValue);
    setLoading(false);

    if (newValue) {
      router.push(nextLessonHref);
      router.refresh();
    } else {
      router.refresh();
    }
  }

  return (
    <button
      onClick={toggleComplete}
      disabled={loading}
      className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        completed
          ? "bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25"
          : "gradient-bg text-white hover:opacity-90 shadow-lg shadow-indigo-500/25"
      }`}
    >
      {loading ? (
        <div className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
      ) : completed ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Voltooid
        </>
      ) : (
        <>
          Markeer als voltooid
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
