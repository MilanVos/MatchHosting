import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { LEVEL_LABELS, LEVEL_COLORS, CATEGORY_ICONS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              lessons: { select: { id: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      progress: {
        where: { completed: true },
      },
    },
  });

  if (!user) redirect("/auth/login");

  const completedLessonIds = new Set(user.progress.map((p) => p.lessonId));

  const enrolledCourses = user.enrollments.map((enrollment) => {
    const totalLessons = enrollment.course.lessons.length;
    const completedLessons = enrollment.course.lessons.filter((l) =>
      completedLessonIds.has(l.id)
    ).length;
    const percentage =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      ...enrollment.course,
      totalLessons,
      completedLessons,
      percentage,
    };
  });

  const totalCompleted = user.progress.filter((p) => p.completed).length;
  const inProgressCourses = enrolledCourses.filter(
    (c) => c.percentage > 0 && c.percentage < 100
  );
  const completedCourses = enrolledCourses.filter((c) => c.percentage === 100);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welkom terug, {user.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-400 mt-1">
          Ga verder met leren of start een nieuwe cursus.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6 card-glow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400/10">
              <BookOpen className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-gray-400 text-sm">Ingeschreven</span>
          </div>
          <div className="text-3xl font-bold text-white">{enrolledCourses.length}</div>
          <div className="text-gray-500 text-sm">cursussen</div>
        </div>

        <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6 card-glow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-400/10">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-gray-400 text-sm">Lessen voltooid</span>
          </div>
          <div className="text-3xl font-bold text-white">{totalCompleted}</div>
          <div className="text-gray-500 text-sm">lessen</div>
        </div>

        <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6 card-glow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10">
              <Trophy className="h-5 w-5 text-yellow-400" />
            </div>
            <span className="text-gray-400 text-sm">Afgerond</span>
          </div>
          <div className="text-3xl font-bold text-white">{completedCourses.length}</div>
          <div className="text-gray-500 text-sm">cursussen</div>
        </div>
      </div>

      {inProgressCourses.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              Doorgaan met leren
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inProgressCourses.map((course) => (
              <div
                key={course.id}
                className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6 card-glow"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{CATEGORY_ICONS[course.category] || "📖"}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[course.level]}`}>
                        {LEVEL_LABELS[course.level]}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold">{course.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {course.completedLessons} / {course.totalLessons} lessen
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-indigo-400">
                    {course.percentage}%
                  </div>
                </div>

                <div className="h-2 rounded-full bg-[#1e1e2e] overflow-hidden mb-4">
                  <div
                    className="h-full gradient-bg rounded-full transition-all"
                    style={{ width: `${course.percentage}%` }}
                  />
                </div>

                <Link
                  href={`/courses/${course.slug}`}
                  className="flex items-center justify-center gap-2 w-full rounded-lg border border-[#2d2d3e] py-2.5 text-sm font-medium text-gray-300 hover:border-indigo-500/50 hover:text-white transition-all"
                >
                  Doorgaan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {enrolledCourses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#2d2d3e] p-12 text-center mb-10">
          <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">
            Nog geen cursussen
          </h3>
          <p className="text-gray-500 mb-6">
            Schrijf je in voor je eerste cursus en start met leren!
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 gradient-bg rounded-lg px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Bekijk cursussen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {completedCourses.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Voltooide cursussen
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedCourses.map((course) => (
              <div
                key={course.id}
                className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{CATEGORY_ICONS[course.category] || "📖"}</span>
                  <CheckCircle2 className="h-5 w-5 text-green-400 ml-auto" />
                </div>
                <h3 className="text-white font-semibold mb-1">{course.title}</h3>
                <p className="text-gray-500 text-sm">
                  {course.totalLessons} lessen voltooid
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-400" />
            Meer cursussen ontdekken
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Breid je skills verder uit
          </p>
        </div>
        <Link
          href="/courses"
          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
        >
          Alle cursussen
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
