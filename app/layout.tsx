import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Curenium EHR ~ Seamless Healthcare Management",
  description: "Curenium EHR is a comprehensive Electronic Health Records system offering seamless communication, collaboration, appointment scheduling, audits, and control for efficient patient management.",
  keywords: ["EHR", "Electronic Health Records", "Healthcare", "Patient Management", "Medical Records", "Communication", "Collaboration", "Appointments", "Audits", "Control", "Seamlessness"],
  authors: [{ name: "Curenium" }],
  openGraph: {
    title: "Curenium EHR ~ Seamless Healthcare Management",
    description: "Curenium EHR offers seamless communication, collaboration, appointments, and more for modern healthcare management.",
    url: "https://curenium.com",
    siteName: "Curenium EHR",
    images: [
      {
        url: "/curenium-logo-d.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Curenium EHR - Seamless Healthcare Management",
    description: "Curenium EHR offers seamless communication, collaboration, appointments, and more for modern healthcare management.",
    images: ["/curenium-logo-d.png"],
  },
  icons: {
    icon: '/curenium-logo-d.png',
  },
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}