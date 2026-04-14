import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VinEye Admin",
  description: "Panel d'administration VinEye — Gestion des maladies de la vigne",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: "oklch(0.17 0.005 60)",
              border: "1px solid oklch(0.25 0.006 60)",
              color: "oklch(0.93 0.005 80)",
            },
          }}
        />
      </body>
    </html>
  );
}
