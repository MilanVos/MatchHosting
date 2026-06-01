import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const lessonId = req.nextUrl.searchParams.get("lessonId");
  if (!lessonId) return NextResponse.json({ error: "lessonId verplicht" }, { status: 400 });

  const note = await prisma.note.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
  });

  return NextResponse.json(note);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { lessonId, content } = await req.json();

  const note = await prisma.note.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { content },
    create: { userId: session.user.id, lessonId, content },
  });

  return NextResponse.json(note);
}
