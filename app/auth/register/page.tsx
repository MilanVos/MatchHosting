"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Er is iets misgegaan");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
    router.refresh();
  }

  const passwordStrong = password.length >= 8;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-bg mb-4">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Maak een account aan</h1>
          <p className="text-gray-500 mt-2">Gratis beginnen met leren</p>
        </div>

        <div className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-8 card-glow">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-6">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Volledige naam
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Jan de Vries"
                  className="w-full rounded-lg border border-[#2d2d3e] bg-[#0f0f16] pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jouw@email.nl"
                  className="w-full rounded-lg border border-[#2d2d3e] bg-[#0f0f16] pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimaal 6 tekens"
                  className="w-full rounded-lg border border-[#2d2d3e] bg-[#0f0f16] pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${passwordStrong ? "text-green-400" : "text-gray-600"}`}
                  />
                  <span className={`text-xs ${passwordStrong ? "text-green-400" : "text-gray-500"}`}>
                    Minimaal 8 tekens
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 gradient-bg rounded-lg py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  Account aanmaken
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-4">
            Door te registreren ga je akkoord met onze voorwaarden
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            Al een account?{" "}
            <Link
              href="/auth/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Inloggen
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
