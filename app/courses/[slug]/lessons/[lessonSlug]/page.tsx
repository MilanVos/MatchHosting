import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, List } from "lucide-react";
import ProgressButton from "./ProgressButton";
import MarkdownRenderer from "./MarkdownRenderer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { slug, lessonSlug } = await params;
  const session = await auth();

  if (!session?.user?.id) redirect("/auth/login");

  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: {
      lessons: { orderBy: { order: "asc" } },
    },
  });

  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId: course.id },
    },
  });

  if (!enrollment) redirect(`/courses/${slug}`);

  const lesson = course.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) notFound();

  const lessonProgress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: { userId: session.user.id, lessonId: lesson.id },
    },
  });

  const allProgress = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id, lesson: { courseId: course.id } },
  });

  const completedIds = new Set(
    allProgress.filter((p) => p.completed).map((p) => p.lessonId)
  );

  const currentIndex = course.lessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < course.lessons.length - 1
      ? course.lessons[currentIndex + 1]
      : null;

  const isCompleted = lessonProgress?.completed ?? false;

  return (
    <div className="min-h-screen">
      <div className="border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur sticky top-16 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <Link
            href={`/courses/${slug}`}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{course.title}</span>
            <span className="sm:hidden">Terug</span>
          </Link>

          <div className="flex items-center gap-2 text-sm text-gray-400 min-w-0">
            <span className="hidden sm:inline truncate">
              Les {currentIndex + 1} van {course.lessons.length}:{" "}
            </span>
            <span className="text-white font-medium truncate">{lesson.title}</span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-500">
            <span>{completedIds.size}/{course.lessons.length}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-32 rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <List className="h-4 w-4 text-indigo-400" />
              Lessen
            </h3>
            <div className="space-y-1">
              {course.lessons.map((l, i) => {
                const done = completedIds.has(l.id);
                const active = l.slug === lessonSlug;
                return (
                  <Link
                    key={l.id}
                    href={`/courses/${slug}/lessons/${l.slug}`}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all ${
                      active
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                        : "text-gray-400 hover:bg-[#1e1e2e] hover:text-white"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs ${
                        done
                          ? "bg-green-500 text-white"
                          : active
                          ? "bg-indigo-500 text-white"
                          : "bg-[#2d2d3e] text-gray-500"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                    </div>
                    <span className="truncate">{l.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6 sm:p-8 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              {lesson.title}
            </h1>

            {lesson.videoUrl && (
              <div className="mb-6 rounded-xl overflow-hidden border border-[#1e1e2e] aspect-video">
                <iframe
                  src={lesson.videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            <div className="prose-dark">
              <MarkdownRenderer content={lesson.content} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              {prevLesson && (
                <Link
                  href={`/courses/${slug}/lessons/${prevLesson.slug}`}
                  className="flex items-center gap-2 rounded-xl border border-[#1e1e2e] bg-[#13131a] px-5 py-3 text-sm text-gray-400 hover:border-indigo-500/30 hover:text-white transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <div>
                    <div className="text-xs text-gray-600">Vorige les</div>
                    <div className="truncate max-w-[180px]">{prevLesson.title}</div>
                  </div>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              <ProgressButton
                lessonId={lesson.id}
                isCompleted={isCompleted}
                nextLessonHref={
                  nextLesson
                    ? `/courses/${slug}/lessons/${nextLesson.slug}`
                    : `/courses/${slug}`
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
