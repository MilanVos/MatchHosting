import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId: session.user.id, postId } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.postLike.create({ data: { userId: session.user.id, postId } });
  return NextResponse.json({ liked: true });
}
