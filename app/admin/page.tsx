import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Users,
  ArrowRight,
  Shield,
  TrendingUp,
  Database,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const [totalUsers, totalCourses, totalEnrollments, totalLessons] =
    await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.lesson.count(),
    ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const popularCourses = await prisma.course.findMany({
    include: { _count: { select: { enrollments: true, lessons: true } } },
    orderBy: { enrollments: { _count: "desc" } },
    take: 5,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Shield className="h-7 w-7 text-indigo-400" />
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Beheer cursussen, lessen en gebruikers</p>
        </div>
        <form action="/api/admin/seed" method="POST">
          <button
            formMethod="post"
            className="hidden"
          />
        </form>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Gebruikers", value: totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Cursussen", value: totalCourses, icon: BookOpen, color: "text-indigo-400", bg: "bg-indigo-400/10" },
          { label: "Inschrijvingen", value: totalEnrollments, icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
          { label: "Lessen", value: totalLessons, icon: Database, color: "text-cyan-400", bg: "bg-cyan-400/10" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6 card-glow"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-3`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              Populaire cursussen
            </h2>
            <Link
              href="/admin/courses"
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Alle cursussen
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {popularCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between py-2 border-b border-[#1e1e2e] last:border-0"
              >
                <div>
                  <div className="text-white text-sm font-medium truncate max-w-[220px]">
                    {course.title}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {course._count.lessons} lessen
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-indigo-400 text-sm font-semibold">
                    {course._count.enrollments}
                  </div>
                  <div className="text-gray-600 text-xs">studenten</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              Nieuwe gebruikers
            </h2>
            <Link
              href="/admin/users"
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Alle gebruikers
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-2 border-b border-[#1e1e2e] last:border-0"
              >
                <div>
                  <div className="text-white text-sm font-medium">{user.name}</div>
                  <div className="text-gray-500 text-xs">{user.email}</div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === "ADMIN"
                      ? "bg-indigo-400/10 text-indigo-400"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/courses"
          className="flex items-center gap-3 rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-5 card-glow hover:border-indigo-500/30 transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400/10 flex-shrink-0">
            <BookOpen className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <div className="text-white font-medium group-hover:text-indigo-300 transition-colors">
              Cursussen beheren
            </div>
            <div className="text-gray-500 text-sm">Toevoegen, bewerken, publiceren</div>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-indigo-400 ml-auto transition-colors" />
        </Link>

        <Link
          href="/admin/users"
          className="flex items-center gap-3 rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-5 card-glow hover:border-indigo-500/30 transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-400/10 flex-shrink-0">
            <Users className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <div className="text-white font-medium group-hover:text-indigo-300 transition-colors">
              Gebruikers beheren
            </div>
            <div className="text-gray-500 text-sm">Overzicht van alle gebruikers</div>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-indigo-400 ml-auto transition-colors" />
        </Link>

        <SeedButton />
      </div>
    </div>
  );
}

function SeedButton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-5 card-glow">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 flex-shrink-0">
        <Plus className="h-5 w-5 text-cyan-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium">Demo data laden</div>
        <div className="text-gray-500 text-sm">Cursussen & lessen toevoegen</div>
      </div>
      <SeedButtonClient />
    </div>
  );
}

import SeedButtonClient from "./SeedButtonClient";
