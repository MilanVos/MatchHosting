import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
      include: {
        _count: { select: { lessons: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(courses);
  } catch {
    return NextResponse.json(
      { error: "Er is iets misgegaan" },
      { status: 500 }
    );
  }
}
