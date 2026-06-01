import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const quiz = await prisma.quiz.findUnique({
    where: { lessonId },
    include: { questions: true },
  });

  if (!quiz) return NextResponse.json(null);

  const lastAttempt = await prisma.quizAttempt.findFirst({
    where: { userId: session.user.id, quizId: quiz.id },
    orderBy: { completedAt: "desc" },
  });

  return NextResponse.json({ quiz, lastAttempt });
}
