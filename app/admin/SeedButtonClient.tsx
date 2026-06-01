"use client";

import { useState } from "react";
import { Database } from "lucide-react";

export default function SeedButtonClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSeed() {
    setLoading(true);
    const res = await fetch("/api/admin/seed", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setResult(
        `${data.createdCourses} cursussen en ${data.createdLessons} lessen toegevoegd!`
      );
    } else {
      setResult("Er is iets misgegaan");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 disabled:opacity-50 transition-colors"
        title="Demo data laden"
      >
        {loading ? (
          <div className="h-3.5 w-3.5 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
        ) : (
          <Database className="h-4 w-4" />
        )}
      </button>
      {result && (
        <span className="text-xs text-green-400 text-right">{result}</span>
      )}
    </div>
  );
}
