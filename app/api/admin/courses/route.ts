import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const courses = await prisma.course.findMany({
    include: {
      _count: { select: { lessons: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    const { title, description, category, level, thumbnail } = await req.json();

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Titel, beschrijving en categorie zijn verplicht" },
        { status: 400 }
      );
    }

    const slug = slugify(title);

    const course = await prisma.course.create({
      data: { title, slug, description, category, level: level ?? "BEGINNER", thumbnail },
    });

    return NextResponse.json(course, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Er is iets misgegaan" }, { status: 500 });
  }
}
