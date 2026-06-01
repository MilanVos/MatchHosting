"use client";

import { Download } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 gradient-bg rounded-xl px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
    >
      <Download className="h-4 w-4" />
      Downloaden / Afdrukken
    </button>
  );
}
