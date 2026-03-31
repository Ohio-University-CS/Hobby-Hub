import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner"
import DashboardNavigation from "@/components/dashboard-navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hobby Hub",
  description: "A welcoming web for hobbyists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <DashboardNavigation/>

        <main className="pt-20">
          {children}
        </main>
        <Toaster 
          position="top-center"
          offset={60}
          richColors 
          theme="system"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: "w-full rounded-lg shadow-lg flex items-start gap-3 px-4 py-3 gap-3",
              title: "font-semibold text-sm",
              description: "text-sm text-neutral-500 mt-0.5"
            }
          }}
        />
      </body>
    </html>
  );
}