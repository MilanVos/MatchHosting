import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { slug } = await params;

    const course = await prisma.course.findUnique({
      where: { slug, published: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Cursus niet gevonden" }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: session.user.id, courseId: course.id },
      },
      update: {},
      create: { userId: session.user.id, courseId: course.id },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Er is iets misgegaan" }, { status: 500 });
  }
}
