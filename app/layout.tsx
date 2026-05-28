import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Receipts Network",
  description: "Save internet receipts before they disappear.",
  openGraph: {
    title: "Receipts Network",
    description: "Save internet receipts before they disappear.",
    type: "website",
    siteName: "Receipts Network",
  },
  twitter: {
    card: "summary_large_image",
    title: "Receipts Network",
    description: "Save internet receipts before they disappear.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-[#0f0d0b] text-stone-50">
        {children}
      </body>
    </html>
  );
}
