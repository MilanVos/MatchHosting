import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  const data = await req.json();

  const course = await prisma.course.update({
    where: { id },
    data,
  });

  return NextResponse.json(course);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;

  await prisma.course.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
