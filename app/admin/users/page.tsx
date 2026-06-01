import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Users className="h-7 w-7 text-green-400" />
              Gebruikers
            </h1>
          </div>
          <p className="text-gray-400 mt-1">{users.length} geregistreerde gebruikers</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Gebruiker</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden sm:table-cell">Rol</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden md:table-cell">Inschrijvingen</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden lg:table-cell">Geregistreerd</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a25] transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-semibold flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{user.name}</div>
                      <div className="text-gray-500 text-xs">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.role === "ADMIN"
                        ? "bg-indigo-400/10 text-indigo-400"
                        : user.role === "INSTRUCTOR"
                        ? "bg-yellow-400/10 text-yellow-400"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-gray-400 text-sm">
                    {user._count.enrollments} cursus{user._count.enrollments !== 1 ? "sen" : ""}
                  </span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-gray-500 text-sm">{formatDate(user.createdAt)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nog geen gebruikers geregistreerd.
          </div>
        )}
      </div>
    </div>
  );
}
