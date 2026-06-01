"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

export default function EnrollButton({ courseSlug }: { courseSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleEnroll() {
    setLoading(true);
    const res = await fetch(`/api/courses/${courseSlug}/enroll`, {
      method: "POST",
    });

    if (res.ok) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full gradient-bg rounded-xl py-3.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
    >
      {loading ? (
        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
      ) : (
        <>
          <Zap className="h-4 w-4" />
          Gratis inschrijven
        </>
      )}
    </button>
  );
}
