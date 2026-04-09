"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      await signIn.email(
        { email: trimmedEmail, password },
        {
          onSuccess: () => {
            router.push("/dashboard");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Identifiants incorrects");
          },
        }
      );
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[380px] mx-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="h-16 w-16 rounded-2xl bg-vine/10 flex items-center justify-center mb-5 glow-green-sm overflow-hidden">
          <Image src="/logo.png" alt="VinEye" width={48} height={48} className="object-contain" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-cream">
          VinEye Admin
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Connectez-vous pour acceder au panel
        </p>
      </div>

      {/* Form card */}
      <div className="glass-card rounded-2xl p-7">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.08em]"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@vineye.app"
              className="h-11 rounded-xl bg-[oklch(0.12_0.005_60)] border-[oklch(0.22_0.005_60)] text-cream placeholder:text-stone-700 focus:border-vine/40 focus:ring-vine/20 transition-colors"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.08em]"
            >
              Mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-xl bg-[oklch(0.12_0.005_60)] border-[oklch(0.22_0.005_60)] text-cream placeholder:text-stone-700 focus:border-vine/40 focus:ring-vine/20 pr-10 transition-colors"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-400 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-vine hover:bg-vine/90 text-[oklch(0.10_0.02_150)] font-semibold transition-all duration-200 hover:shadow-[0_0_20px_-5px_oklch(0.72_0.19_150_/_0.4)]"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-[11px] text-stone-700 mt-6">
        VinEye — Detection des maladies de la vigne
      </p>
    </div>
  );
}
