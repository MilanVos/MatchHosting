import { prisma } from "@/lib/prisma";

export const XP_REWARDS = {
  LESSON_COMPLETE: 10,
  QUIZ_PASS: 25,
  COURSE_COMPLETE: 100,
  FIRST_LESSON: 5,
  STREAK_BONUS: 15,
} as const;

export function xpToLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

const BADGE_CONDITIONS = [
  { name: "Eerste Stap", condition: "first_lesson", description: "Voltooi je eerste les", icon: "🎯", xpReward: 10 },
  { name: "Nieuweling", condition: "lessons_5", description: "Voltooi 5 lessen", icon: "📚", xpReward: 25 },
  { name: "Leerling", condition: "lessons_10", description: "Voltooi 10 lessen", icon: "🎓", xpReward: 50 },
  { name: "Gevorderd", condition: "lessons_25", description: "Voltooi 25 lessen", icon: "⚡", xpReward: 100 },
  { name: "Expert", condition: "lessons_50", description: "Voltooi 50 lessen", icon: "🏆", xpReward: 200 },
  { name: "Cursusmeester", condition: "course_complete_1", description: "Voltooi je eerste cursus", icon: "🎖️", xpReward: 150 },
  { name: "Quiz Ace", condition: "quiz_perfect", description: "Haal 100% op een quiz", icon: "💯", xpReward: 50 },
  { name: "Op Stoom", condition: "streak_3", description: "3 dagen op rij actief", icon: "🔥", xpReward: 30 },
  { name: "Doorzetter", condition: "streak_7", description: "7 dagen op rij actief", icon: "💪", xpReward: 75 },
];

export async function seedBadges() {
  for (const badge of BADGE_CONDITIONS) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }
}

export async function awardXP(userId: string, amount: number) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: amount },
      lastActiveAt: new Date(),
    },
  });

  const newLevel = xpToLevel(user.xp);
  if (newLevel !== user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
  }

  return user;
}

export async function checkAndAwardBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      badges: { include: { badge: true } },
      progress: { where: { completed: true } },
      certificates: true,
      quizAttempts: true,
    },
  });

  if (!user) return [];

  const earnedBadgeNames = user.badges.map((ub) => ub.badge.name);
  const completedLessons = user.progress.length;
  const completedCourses = user.certificates.length;
  const perfectQuizzes = user.quizAttempts.filter((a) => a.score === a.maxScore && a.maxScore > 0).length;
  const streak = user.streak;

  const toAward: string[] = [];

  if (completedLessons >= 1 && !earnedBadgeNames.includes("Eerste Stap")) toAward.push("Eerste Stap");
  if (completedLessons >= 5 && !earnedBadgeNames.includes("Nieuweling")) toAward.push("Nieuweling");
  if (completedLessons >= 10 && !earnedBadgeNames.includes("Leerling")) toAward.push("Leerling");
  if (completedLessons >= 25 && !earnedBadgeNames.includes("Gevorderd")) toAward.push("Gevorderd");
  if (completedLessons >= 50 && !earnedBadgeNames.includes("Expert")) toAward.push("Expert");
  if (completedCourses >= 1 && !earnedBadgeNames.includes("Cursusmeester")) toAward.push("Cursusmeester");
  if (perfectQuizzes >= 1 && !earnedBadgeNames.includes("Quiz Ace")) toAward.push("Quiz Ace");
  if (streak >= 3 && !earnedBadgeNames.includes("Op Stoom")) toAward.push("Op Stoom");
  if (streak >= 7 && !earnedBadgeNames.includes("Doorzetter")) toAward.push("Doorzetter");

  const newBadges = [];
  for (const badgeName of toAward) {
    const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
    if (badge) {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
      await awardXP(userId, badge.xpReward);
      newBadges.push(badge);
    }
  }

  return newBadges;
}

export async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const now = new Date();
  const lastActive = user.lastActiveAt;

  if (!lastActive) {
    await prisma.user.update({ where: { id: userId }, data: { streak: 1, lastActiveAt: now } });
    return;
  }

  const diffMs = now.getTime() - lastActive.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    await prisma.user.update({
      where: { id: userId },
      data: { streak: { increment: 1 }, lastActiveAt: now },
    });
  } else if (diffDays > 1) {
    await prisma.user.update({
      where: { id: userId },
      data: { streak: 1, lastActiveAt: now },
    });
  }
}
