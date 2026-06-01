"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Zap, BookOpen, LayoutDashboard, Shield, LogOut, LogIn, MessageSquare, Code2 } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/courses", label: "Cursussen", icon: BookOpen },
    { href: "/forum", label: "Forum", icon: MessageSquare },
    { href: "/editor", label: "Editor", icon: Code2 },
    ...(session ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
    ...(session?.user?.role === "INSTRUCTOR" ? [{ href: "/instructor", label: "Docent", icon: Shield }] : []),
    ...(session?.user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white">
              <span className="gradient-text">Mathhosting</span>{" "}
              <span className="text-gray-400 text-sm">TechForge</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {session.user.name}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Uitloggen
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Inloggen
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-lg gradient-bg px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  Gratis starten
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-[#1e1e2e] py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-2 py-2 text-gray-400 hover:text-white transition-colors w-full"
              >
                <LogOut className="h-4 w-4" />
                Uitloggen
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Inloggen
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-2 text-indigo-400 font-medium"
                >
                  Gratis starten
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
