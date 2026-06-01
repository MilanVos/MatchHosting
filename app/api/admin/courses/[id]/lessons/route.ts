import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id: courseId } = await params;
  const { title, content, videoUrl } = await req.json();

  if (!title || !content) {
    return NextResponse.json(
      { error: "Titel en inhoud zijn verplicht" },
      { status: 400 }
    );
  }

  const lastLesson = await prisma.lesson.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  });

  const order = (lastLesson?.order ?? 0) + 1;
  const slug = slugify(title);

  const lesson = await prisma.lesson.create({
    data: { title, slug, content, videoUrl, order, courseId },
  });

  return NextResponse.json(lesson, { status: 201 });
}
