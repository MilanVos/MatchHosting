import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Award, ArrowLeft } from "lucide-react";
import PrintButton from "@/components/PrintButton";

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      course: { select: { title: true, category: true, level: true } },
    },
  });

  if (!certificate) notFound();

  const levelLabel = { BEGINNER: "Beginner", INTERMEDIATE: "Gevorderd", ADVANCED: "Expert" };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#0a0a0f]">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Terug naar dashboard
          </Link>
        </div>

        <div
          id="certificate"
          className="relative rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-br from-[#13131a] via-[#1a1a2e] to-[#13131a] p-12 text-center shadow-2xl shadow-indigo-500/10"
        >
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/30">
                <Award className="h-10 w-10 text-indigo-400" />
              </div>
            </div>

            <div className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-2">
              Mathhosting TechForge
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Certificaat van Voltooiing</h1>
            <div className="w-24 h-1 gradient-bg mx-auto rounded-full mb-8" />

            <p className="text-gray-400 text-lg mb-2">Dit certificaat wordt uitgereikt aan</p>
            <p className="text-4xl font-bold gradient-text mb-6">{certificate.user.name}</p>

            <p className="text-gray-400 mb-2">voor het succesvol voltooien van</p>
            <p className="text-2xl font-bold text-white mb-2">{certificate.course.title}</p>
            <p className="text-indigo-400 text-sm mb-8">
              {certificate.course.category} • {levelLabel[certificate.course.level]}
            </p>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 border-t border-[#2d2d3e] pt-8">
              <div>
                <div className="text-white font-medium">Datum</div>
                <div>{new Date(certificate.issuedAt).toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" })}</div>
              </div>
              <div className="w-px h-8 bg-[#2d2d3e]" />
              <div>
                <div className="text-white font-medium">Certificaatnummer</div>
                <div className="font-mono text-xs">{certificate.certificateNumber.slice(0, 12).toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <PrintButton />
        </div>
      </div>
    </div>
  );
}
