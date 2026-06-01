import Link from "next/link";
import { Zap, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#1e1e2e] bg-[#0a0a0f] mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white">
                <span className="gradient-text">Mathhosting</span>{" "}
                <span className="text-gray-400 text-sm">TechForge</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Leerplatform voor iedereen die ICT, techniek en digitale
              vaardigheden wil leren. Van beginner tot professional.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="text-gray-600 hover:text-gray-400 transition-colors text-xs flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                Community
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Cursussen</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/courses?category=networking" className="hover:text-gray-300 transition-colors">Netwerken</Link></li>
              <li><Link href="/courses?category=cybersecurity" className="hover:text-gray-300 transition-colors">Cybersecurity</Link></li>
              <li><Link href="/courses?category=webdev" className="hover:text-gray-300 transition-colors">Webdevelopment</Link></li>
              <li><Link href="/courses?category=cloud" className="hover:text-gray-300 transition-colors">Cloud & DevOps</Link></li>
              <li><Link href="/courses?category=sysadmin" className="hover:text-gray-300 transition-colors">Systeembeheer</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/courses" className="hover:text-gray-300 transition-colors">Alle cursussen</Link></li>
              <li><Link href="/dashboard" className="hover:text-gray-300 transition-colors">Mijn dashboard</Link></li>
              <li><Link href="/auth/register" className="hover:text-gray-300 transition-colors">Gratis registreren</Link></li>
              <li><Link href="/auth/login" className="hover:text-gray-300 transition-colors">Inloggen</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1e1e2e] mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Mathhosting TechForge. Alle rechten voorbehouden.
          </p>
          <p className="text-gray-600 text-sm">
            Gemaakt met passie voor ICT-onderwijs
          </p>
        </div>
      </div>
    </footer>
  );
}
