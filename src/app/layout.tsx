import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";

const dmSerifDisplay = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "LUNA AI — Your space to think",
  description:
    "A personal AI companion for the questions you're curious about, the things you're learning, and the ideas you're figuring out.",
  keywords: [
    "LUNA AI",
    "personal AI companion",
    "multilingual AI",
    "voice conversation",
    "deep research",
    "learning companion",
  ],
  authors: [{ name: "LUNA AI" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-[#F7F5F0] text-[#252720] antialiased flex flex-col font-sans selection:bg-[#EAEDE1] selection:text-[#252720]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
