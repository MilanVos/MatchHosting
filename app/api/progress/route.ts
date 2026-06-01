import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { awardXP, checkAndAwardBadges, updateStreak, XP_REWARDS } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { lessonId, completed } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is verplicht" }, { status: 400 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: { include: { lessons: true } },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Les niet gevonden" }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: lesson.courseId } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Je bent niet ingeschreven voor deze cursus" }, { status: 403 });
    }

    const existingProgress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
    });

    const wasAlreadyCompleted = existingProgress?.completed ?? false;

    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      update: { completed },
      create: { userId: session.user.id, lessonId, completed },
    });

    let xpAwarded = 0;
    let newBadges: { name: string; icon: string }[] = [];
    let certificateIssued = false;

    if (completed && !wasAlreadyCompleted) {
      await updateStreak(session.user.id);
      await awardXP(session.user.id, XP_REWARDS.LESSON_COMPLETE);
      xpAwarded += XP_REWARDS.LESSON_COMPLETE;

      const allLessonIds = lesson.course.lessons.map((l) => l.id);
      const completedCount = await prisma.lessonProgress.count({
        where: { userId: session.user.id, lessonId: { in: allLessonIds }, completed: true },
      });

      if (completedCount === allLessonIds.length) {
        await awardXP(session.user.id, XP_REWARDS.COURSE_COMPLETE);
        xpAwarded += XP_REWARDS.COURSE_COMPLETE;

        const cert = await prisma.certificate.upsert({
          where: { userId_courseId: { userId: session.user.id, courseId: lesson.courseId } },
          update: {},
          create: { userId: session.user.id, courseId: lesson.courseId },
        });

        if (cert) certificateIssued = true;
      }

      newBadges = await checkAndAwardBadges(session.user.id);
    }

    return NextResponse.json({ progress, xpAwarded, newBadges, certificateIssued });
  } catch {
    return NextResponse.json({ error: "Er is iets misgegaan" }, { status: 500 });
  }
}
