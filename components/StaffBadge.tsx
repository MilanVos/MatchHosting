import { Shield, Star } from "lucide-react";

type Role = "ADMIN" | "INSTRUCTOR" | "STUDENT";

export default function StaffBadge({ role }: { role: Role }) {
  if (role === "ADMIN") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-xs font-semibold text-red-400">
        <Shield className="h-3 w-3" />
        Admin
      </span>
    );
  }

  if (role === "INSTRUCTOR") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-xs font-semibold text-indigo-400">
        <Star className="h-3 w-3" />
        Docent
      </span>
    );
  }

  return null;
}
