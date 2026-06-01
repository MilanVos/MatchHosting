import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Users, ArrowRight, Search } from "lucide-react";
import { LEVEL_LABELS, LEVEL_COLORS, CATEGORY_ICONS } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { value: "", label: "Alle" },
  { value: "networking", label: "Netwerken" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "webdev", label: "Webdevelopment" },
  { value: "cloud", label: "Cloud & DevOps" },
  { value: "sysadmin", label: "Systeembeheer" },
  { value: "programming", label: "Programmeren" },
];

interface Props {
  searchParams: Promise<{ category?: string; level?: string }>;
}

export default async function CoursesPage({ searchParams }: Props) {
  const { category, level } = await searchParams;

  const courses = await prisma.course.findMany({
    where: {
      published: true,
      ...(category ? { category } : {}),
      ...(level ? { level: level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" } : {}),
    },
    include: {
      _count: { select: { lessons: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Alle cursussen</h1>
        <p className="text-gray-400">
          {courses.length} cursus{courses.length !== 1 ? "sen" : ""} beschikbaar
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value ? `/courses?category=${cat.value}` : "/courses"}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              category === cat.value || (!category && !cat.value)
                ? "gradient-bg text-white"
                : "border border-[#2d2d3e] text-gray-400 hover:border-indigo-500/50 hover:text-white"
            }`}
          >
            {cat.value && (
              <span className="mr-1">{CATEGORY_ICONS[cat.value]}</span>
            )}
            {cat.label}
          </Link>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-24">
          <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">
            Geen cursussen gevonden
          </h3>
          <p className="text-gray-500 mb-6">
            Er zijn nog geen cursussen in deze categorie.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 gradient-bg rounded-lg px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Alle cursussen bekijken
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group rounded-2xl border border-[#1e1e2e] bg-[#13131a] overflow-hidden card-glow transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-36 gradient-bg relative flex items-center justify-center">
                <span className="text-5xl opacity-50">
                  {CATEGORY_ICONS[course.category] || "📖"}
                </span>
                <div className="absolute top-3 right-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${LEVEL_COLORS[course.level]}`}>
                    {LEVEL_LABELS[course.level]}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {course._count.lessons} les{course._count.lessons !== 1 ? "sen" : ""}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {course._count.enrollments} student{course._count.enrollments !== 1 ? "en" : ""}
                  </div>
                  <div className="flex items-center gap-1 text-indigo-400 font-medium">
                    Bekijken
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
