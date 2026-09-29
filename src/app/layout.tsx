import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "DROIDMATRIX // Cloud ARM64 Android Fleet & Anti-Detect Proxy Orchestrator",
  description:
    "Enterprise Cloud Android Device Farm managing thousands of distinct mobile phones with dedicated SOCKS5/4G residential proxies and real-profile Gmail, Facebook, and YouTube accounts.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090C10] text-[#F0F6FC] font-sans antialiased selection:bg-[#3DDC84]/30 selection:text-[#3DDC84] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
