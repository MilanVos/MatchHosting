import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();

    const course = await prisma.course.findUnique({
      where: { slug, published: true },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            order: true,
            videoUrl: true,
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Cursus niet gevonden" }, { status: 404 });
    }

    let isEnrolled = false;
    let progress: Record<string, boolean> = {};

    if (session?.user?.id) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      });
      isEnrolled = !!enrollment;

      if (isEnrolled) {
        const lessonProgress = await prisma.lessonProgress.findMany({
          where: { userId: session.user.id, lesson: { courseId: course.id } },
        });
        progress = lessonProgress.reduce(
          (acc, p) => ({ ...acc, [p.lessonId]: p.completed }),
          {}
        );
      }
    }

    return NextResponse.json({ ...course, isEnrolled, progress });
  } catch {
    return NextResponse.json({ error: "Er is iets misgegaan" }, { status: 500 });
  }
}
