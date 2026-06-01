import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: { select: { id: true, name: true, avatar: true, level: true, role: true } },
      replies: {
        include: { user: { select: { id: true, name: true, avatar: true, level: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { likes: true } },
    },
  });

  if (!post) return NextResponse.json({ error: "Post niet gevonden" }, { status: 404 });
  return NextResponse.json(post);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { content } = await req.json();
  if (!content) return NextResponse.json({ error: "Inhoud verplicht" }, { status: 400 });

  const reply = await prisma.reply.create({
    data: { userId: session.user.id, postId, content },
    include: { user: { select: { id: true, name: true, avatar: true, level: true, role: true } } },
  });

  return NextResponse.json(reply);
}
