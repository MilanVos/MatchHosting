import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Users,
  CheckCircle2,
  Lock,
  PlayCircle,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { LEVEL_LABELS, LEVEL_COLORS, CATEGORY_ICONS } from "@/lib/utils";
import EnrollButton from "./EnrollButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: {
      lessons: { orderBy: { order: "asc" } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) notFound();

  let isEnrolled = false;
  let completedIds = new Set<string>();

  if (session?.user?.id) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId: course.id },
      },
    });
    isEnrolled = !!enrollment;

    if (isEnrolled) {
      const progress = await prisma.lessonProgress.findMany({
        where: { userId: session.user.id, lesson: { courseId: course.id } },
      });
      completedIds = new Set(
        progress.filter((p) => p.completed).map((p) => p.lessonId)
      );
    }
  }

  const totalLessons = course.lessons.length;
  const completedLessons = course.lessons.filter((l) =>
    completedIds.has(l.id)
  ).length;
  const percentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Terug naar cursussen
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">{CATEGORY_ICONS[course.category] || "📖"}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${LEVEL_COLORS[course.level]}`}>
              {LEVEL_LABELS[course.level]}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">
            {course.description}
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {totalLessons} lessen
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {course._count.enrollments} studenten
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">Lessen</h2>
            <div className="space-y-2">
              {course.lessons.map((lesson, index) => {
                const isCompleted = completedIds.has(lesson.id);
                const isAccessible = isEnrolled;

                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                      isAccessible
                        ? "border-[#1e1e2e] bg-[#13131a] hover:border-indigo-500/30 cursor-pointer"
                        : "border-[#1a1a25] bg-[#0f0f14]"
                    }`}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1e1e2e] text-sm font-medium text-gray-400">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {isAccessible ? (
                        <Link
                          href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                          className="text-white font-medium hover:text-indigo-300 transition-colors block truncate"
                        >
                          {lesson.title}
                        </Link>
                      ) : (
                        <span className="text-gray-500 font-medium block truncate">
                          {lesson.title}
                        </span>
                      )}
                    </div>

                    {isAccessible ? (
                      <Link
                        href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                        className="text-indigo-400 hover:text-indigo-300 flex-shrink-0"
                      >
                        <PlayCircle className="h-5 w-5" />
                      </Link>
                    ) : (
                      <Lock className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6 card-glow">
            <div className="h-40 rounded-xl gradient-bg flex items-center justify-center mb-6">
              <span className="text-6xl opacity-60">
                {CATEGORY_ICONS[course.category] || "📖"}
              </span>
            </div>

            {isEnrolled && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Voortgang</span>
                  <span className="text-white font-semibold">{percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#1e1e2e] overflow-hidden">
                  <div
                    className="h-full gradient-bg rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  {completedLessons} van {totalLessons} lessen voltooid
                </p>
              </div>
            )}

            {session ? (
              isEnrolled ? (
                <Link
                  href={`/courses/${course.slug}/lessons/${course.lessons[0]?.slug}`}
                  className="flex items-center justify-center gap-2 w-full gradient-bg rounded-xl py-3.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <Zap className="h-4 w-4" />
                  {completedLessons > 0 ? "Doorgaan" : "Starten"}
                </Link>
              ) : (
                <EnrollButton courseSlug={course.slug} />
              )
            ) : (
              <Link
                href="/auth/register"
                className="flex items-center justify-center gap-2 w-full gradient-bg rounded-xl py-3.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Gratis inschrijven
                <Lock className="h-4 w-4" />
              </Link>
            )}

            <div className="mt-4 space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                {totalLessons} lessen
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Voortgang bijhouden
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-400" />
                {course._count.enrollments} studenten gingen je voor
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
