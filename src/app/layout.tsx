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
  title: "SwimFlow — A free whiteboard where any AI draws your process",
  description:
    "Describe what you're making, let any AI draw it, then edit swimlanes, flowcharts, kanban boards, timelines, and tables on one canvas. Free.",
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
