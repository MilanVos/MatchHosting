import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";

async function requireStaff() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { lessonId } = await params;
  const { title, content, videoUrl } = await req.json();

  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      ...(title && { title, slug: slugify(title) }),
      ...(content !== undefined && { content }),
      ...(videoUrl !== undefined && { videoUrl: videoUrl || null }),
    },
  });

  return NextResponse.json(lesson);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { lessonId } = await params;

  await prisma.lesson.delete({ where: { id: lessonId } });

  return NextResponse.json({ success: true });
}
