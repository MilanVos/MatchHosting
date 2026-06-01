import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Trophy, Award, Flame, Star, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { xpToLevel } from "@/lib/gamification";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      badges: { include: { badge: true }, orderBy: { earnedAt: "desc" } },
      certificates: {
        include: { course: { select: { title: true, category: true } } },
        orderBy: { issuedAt: "desc" },
      },
      enrollments: {
        include: {
          course: {
            include: {
              lessons: {
                include: { progress: { where: { userId: session.user.id } } },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/auth/login");

  const currentLevel = xpToLevel(user.xp);
  const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
  const xpForNextLevel = Math.pow(currentLevel, 2) * 100;
  const xpProgress = xpForNextLevel > xpForCurrentLevel
    ? Math.round(((user.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100)
    : 100;

  const enrollmentsWithProgress = user.enrollments.map((e) => {
    const total = e.course.lessons.length;
    const done = e.course.lessons.filter((l) => l.progress.some((p) => p.completed)).length;
    return { ...e, total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  });

  const inProgress = enrollmentsWithProgress.filter((e) => e.done < e.total);
  const completed = enrollmentsWithProgress.filter((e) => e.total > 0 && e.done === e.total);

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Welkom terug, <span className="gradient-text">{user.name}</span>!</h1>
        <p className="text-gray-400 mt-1">Jouw leervoortgang en prestaties</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20">
              <Star className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{user.xp}</div>
              <div className="text-gray-500 text-xs">XP Punten</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mb-1">Level {currentLevel} → {currentLevel + 1}</div>
          <div className="h-2 rounded-full bg-[#1e1e2e] overflow-hidden">
            <div className="h-full gradient-bg rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
          </div>
          <div className="text-xs text-gray-500 mt-1">{xpProgress}% naar level {currentLevel + 1}</div>
        </div>

        <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{user.streak}</div>
              <div className="text-gray-500 text-xs">Dagen streak</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
              <BookOpen className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{enrollmentsWithProgress.length}</div>
              <div className="text-gray-500 text-xs">Cursussen</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20">
              <Trophy className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{user.certificates.length}</div>
              <div className="text-gray-500 text-xs">Certificaten</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          {inProgress.length > 0 && (
            <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                Bezig met
              </h2>
              <div className="space-y-4">
                {inProgress.map((e) => (
                  <div key={e.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white text-sm font-medium">{e.course.title}</span>
                      <span className="text-gray-400 text-xs">{e.done}/{e.total} lessen</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#1e1e2e] overflow-hidden mb-1">
                      <div className="h-full gradient-bg rounded-full transition-all" style={{ width: `${e.pct}%` }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{e.pct}%</span>
                      <Link
                        href={`/courses/${e.course.slug}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                      >
                        Doorgaan <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Afgerond
              </h2>
              <div className="space-y-3">
                {completed.map((e) => (
                  <div key={e.id} className="flex items-center justify-between">
                    <span className="text-white text-sm">{e.course.title}</span>
                    <div className="flex items-center gap-2">
                      {user.certificates.find((c) => c.courseId === e.courseId) && (
                        <Link
                          href={`/certificates/${user.certificates.find((c) => c.courseId === e.courseId)!.id}`}
                          className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition-colors"
                        >
                          <Award className="h-3.5 w-3.5" /> Certificaat
                        </Link>
                      )}
                      <span className="text-green-400 text-xs flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Voltooid
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {enrollmentsWithProgress.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#2d2d3e] p-12 text-center">
              <BookOpen className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">Je bent nog niet ingeschreven voor een cursus.</p>
              <Link href="/courses" className="inline-flex items-center gap-2 gradient-bg rounded-xl px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
                Bekijk cursussen
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              Badges ({user.badges.length})
            </h2>
            {user.badges.length === 0 ? (
              <p className="text-gray-500 text-sm">Nog geen badges verdiend. Voltooi lessen om badges te verdienen!</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {user.badges.map((ub) => (
                  <div
                    key={ub.id}
                    title={`${ub.badge.name}: ${ub.badge.description}`}
                    className="flex flex-col items-center rounded-xl border border-[#2d2d3e] bg-[#0f0f16] p-3 text-center"
                  >
                    <span className="text-2xl mb-1">{ub.badge.icon}</span>
                    <span className="text-xs text-gray-400 leading-tight">{ub.badge.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {user.certificates.length > 0 && (
            <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Certificaten
              </h2>
              <div className="space-y-3">
                {user.certificates.map((cert) => (
                  <Link
                    key={cert.id}
                    href={`/certificates/${cert.id}`}
                    className="flex items-center justify-between rounded-xl border border-[#2d2d3e] bg-[#0f0f16] p-3 hover:border-yellow-500/40 transition-all"
                  >
                    <div>
                      <div className="text-white text-sm font-medium">{cert.course.title}</div>
                      <div className="text-gray-500 text-xs">{new Date(cert.issuedAt).toLocaleDateString("nl-NL")}</div>
                    </div>
                    <Award className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
