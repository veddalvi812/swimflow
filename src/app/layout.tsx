import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "SwimFlow — Swimlane Diagram Generator & Editor",
  description:
    "Generate and edit swimlane diagrams from prompts. Free, open to everyone.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, jetbrainsMono.variable, "font-sans")}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
