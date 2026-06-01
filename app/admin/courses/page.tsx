import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LEVEL_LABELS, LEVEL_COLORS, CATEGORY_ICONS } from "@/lib/utils";
import CourseAdminActions from "./CourseAdminActions";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const courses = await prisma.course.findMany({
    include: { _count: { select: { lessons: true, enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Cursussen beheren</h1>
          <p className="text-gray-400 mt-1">{courses.length} cursussen totaal</p>
        </div>
        <CourseAdminActions mode="create" />
      </div>

      <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Cursus</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden sm:table-cell">Niveau</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden md:table-cell">Lessen</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden md:table-cell">Studenten</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course.id}
                className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a25] transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{CATEGORY_ICONS[course.category] || "📖"}</span>
                    <div>
                      <div className="text-white font-medium text-sm">{course.title}</div>
                      <div className="text-gray-500 text-xs">{course.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[course.level]}`}>
                    {LEVEL_LABELS[course.level]}
                  </span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-gray-400 text-sm">{course._count.lessons}</span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-gray-400 text-sm">{course._count.enrollments}</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      course.published
                        ? "bg-green-400/10 text-green-400"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {course.published ? "Gepubliceerd" : "Concept"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <CourseAdminActions mode="edit" course={course} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {courses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nog geen cursussen. Klik op &quot;Cursus toevoegen&quot; om te beginnen.
          </div>
        )}
      </div>
    </div>
  );
}
