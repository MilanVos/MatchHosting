import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: { course: { select: { title: true, category: true, level: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json(certificates);
}
