import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? undefined;

  const posts = await prisma.post.findMany({
    where: category ? { category } : undefined,
    include: {
      user: { select: { id: true, name: true, avatar: true, level: true, role: true } },
      _count: { select: { replies: true, likes: true } },
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { title, content, category } = await req.json();
  if (!title || !content) return NextResponse.json({ error: "Titel en inhoud verplicht" }, { status: 400 });

  const post = await prisma.post.create({
    data: { userId: session.user.id, title, content, category: category ?? "algemeen" },
    include: { user: { select: { id: true, name: true, avatar: true, level: true, role: true } } },
  });

  return NextResponse.json(post);
}
