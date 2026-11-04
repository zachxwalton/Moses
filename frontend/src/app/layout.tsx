import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SplitProvider } from "@/context/SplitContext";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moses",
  description: "Receipt scanning and splitting",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SplitProvider>
          {children}
        </SplitProvider>
      </body>
    </html>
  );
}