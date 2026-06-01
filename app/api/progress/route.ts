import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return NextResponse.json({ error: "Les niet gevonden" }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: lesson.courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Je bent niet ingeschreven voor deze cursus" },
        { status: 403 }
      );
    }

    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      update: { completed },
      create: { userId: session.user.id, lessonId, completed },
    });

    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({ error: "Er is iets misgegaan" }, { status: 500 });
  }
}
