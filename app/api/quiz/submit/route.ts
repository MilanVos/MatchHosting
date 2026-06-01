import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { awardXP, checkAndAwardBadges, XP_REWARDS } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { quizId, answers } = await req.json();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz) return NextResponse.json({ error: "Quiz niet gevonden" }, { status: 404 });

  let score = 0;
  const results = quiz.questions.map((q, i) => {
    const correct = answers[i] === q.correctAnswer;
    if (correct) score++;
    return { correct, correctAnswer: q.correctAnswer, explanation: q.explanation };
  });

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      quizId,
      score,
      maxScore: quiz.questions.length,
      answers,
    },
  });

  let xpAwarded = 0;
  if (score === quiz.questions.length && quiz.questions.length > 0) {
    await awardXP(session.user.id, XP_REWARDS.QUIZ_PASS);
    xpAwarded = XP_REWARDS.QUIZ_PASS;
    await checkAndAwardBadges(session.user.id);
  } else if (score > 0) {
    const partial = Math.round((score / quiz.questions.length) * XP_REWARDS.QUIZ_PASS * 0.5);
    await awardXP(session.user.id, partial);
    xpAwarded = partial;
  }

  return NextResponse.json({ attempt, results, score, maxScore: quiz.questions.length, xpAwarded });
}
