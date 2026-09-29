import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "DROIDMATRIX // Cloud ARM64 Android Fleet & Anti-Detect Proxy Orchestrator",
  description:
    "Enterprise Cloud Android Device Farm managing thousands of distinct mobile phones with dedicated SOCKS5/4G residential proxies and real-profile Gmail, Facebook, and YouTube accounts.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="bg-[#090C10] text-[#F0F6FC] font-sans antialiased selection:bg-[#3DDC84]/30 selection:text-[#3DDC84] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
