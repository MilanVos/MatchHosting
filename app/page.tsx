export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Zap,
  Shield,
  Globe,
  Server,
  Code2,
  Cloud,
  ArrowRight,
  Users,
  BookOpen,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

const categories = [
  {
    icon: Globe,
    title: "Netwerken & Servers",
    desc: "TCP/IP, subnetting, DNS, DHCP, routing, switching",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    href: "/courses?category=networking",
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    desc: "Ethical hacking, pentesting, beveiliging, CTF",
    color: "text-red-400",
    bg: "bg-red-400/10",
    href: "/courses?category=cybersecurity",
  },
  {
    icon: Code2,
    title: "Webdevelopment",
    desc: "HTML, CSS, JavaScript, React, Next.js, databases",
    color: "text-green-400",
    bg: "bg-green-400/10",
    href: "/courses?category=webdev",
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    desc: "Docker, Kubernetes, CI/CD, AWS, Linux containers",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    href: "/courses?category=cloud",
  },
  {
    icon: Server,
    title: "Systeembeheer",
    desc: "Linux, Windows Server, Active Directory, scripting",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    href: "/courses?category=sysadmin",
  },
  {
    icon: Zap,
    title: "Programmeren",
    desc: "Python, Bash scripting, automatisering, algoritmen",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    href: "/courses?category=programming",
  },
];

const features = [
  { icon: CheckCircle2, text: "Leren op je eigen tempo" },
  { icon: CheckCircle2, text: "Geen diploma nodig" },
  { icon: CheckCircle2, text: "Praktijkgericht leren" },
  { icon: CheckCircle2, text: "Van basis tot professioneel" },
  { icon: CheckCircle2, text: "Community & support" },
  { icon: CheckCircle2, text: "Gratis te starten" },
];

export default async function HomePage() {
  const userCount = await prisma.user.count();
  const courseCount = await prisma.course.count({ where: { published: true } });

  const stats = [
    { icon: BookOpen, value: courseCount > 0 ? `${courseCount}+` : "50+", label: "Cursussen" },
    { icon: Users, value: userCount > 0 ? `${userCount}+` : "0", label: "Studenten" },
    { icon: Trophy, value: "100%", label: "Gratis te starten" },
  ];

  return (
    <div className="overflow-hidden">
      <section className="relative pt-20 pb-32 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-400 mb-8">
            <Zap className="h-3.5 w-3.5" />
            Gratis leren. Echte skills bouwen.
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight">
            Word een{" "}
            <span className="gradient-text">ICT Professional</span>{" "}
            zonder diploma
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Mathhosting TechForge is het leerplatform voor iedereen die écht
            iets wil leren in de ICT. Praktijkgericht, op eigen tempo, voor
            beginners tot gevorderden.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 gradient-bg rounded-xl px-8 py-4 text-base font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
            >
              Gratis beginnen
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/courses"
              className="flex items-center gap-2 rounded-xl border border-[#2d2d3e] px-8 py-4 text-base font-medium text-gray-300 hover:border-indigo-500/50 hover:text-white transition-all"
            >
              <BookOpen className="h-5 w-5" />
              Bekijk cursussen
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-[#1e1e2e]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Wat wil jij leren?
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Kies uit 6 categorieën en bouw de skills die jij nodig hebt voor
              een carrière in de ICT.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="group relative rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6 card-glow transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${cat.bg} mb-4`}>
                    <Icon className={`h-6 w-6 ${cat.color}`} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-indigo-300 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{cat.desc}</p>
                  <ArrowRight className="absolute bottom-6 right-6 h-4 w-4 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-[#1e1e2e] bg-[#13131a] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Waarom{" "}
                  <span className="gradient-text">Mathhosting TechForge</span>?
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Wij geloven dat talent niet afhangt van diploma&apos;s.
                  Iedereen krijgt bij ons de kans om zich te ontwikkelen, skills
                  te leren en stappen te zetten richting een toekomst in de ICT.
                </p>
                <ul className="space-y-3">
                  {features.map((f) => {
                    const Icon = f.icon;
                    return (
                      <li key={f.text} className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                        <span className="text-gray-300">{f.text}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-8">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 gradient-bg rounded-xl px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    Start nu gratis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="border-l border-[#1e1e2e] p-12 bg-[#0f0f16]">
                <div className="space-y-4">
                  {[
                    { role: "Beginners", desc: "Geen ervaring nodig. Wij beginnen bij de basis.", icon: "🌱" },
                    { role: "Studenten", desc: "Verdiep je kennis naast je studie.", icon: "📚" },
                    { role: "Omscholers", desc: "Maak de stap naar een ICT-carrière.", icon: "🚀" },
                    { role: "ICT Professionals", desc: "Blijf up-to-date met de nieuwste technieken.", icon: "💼" },
                  ].map((item) => (
                    <div
                      key={item.role}
                      className="flex items-start gap-4 rounded-xl border border-[#1e1e2e] bg-[#13131a] p-4"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="text-white font-medium">{item.role}</div>
                        <div className="text-gray-500 text-sm">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-[#1e1e2e]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Klaar om te beginnen?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Sluit je aan bij honderden studenten die al hun ICT-skills aan het
            opbouwen zijn. Gratis, praktijkgericht en op jouw tempo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 gradient-bg rounded-xl px-8 py-4 text-base font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
            >
              Maak gratis account aan
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/courses"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-base"
            >
              Bekijk cursussen eerst
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
