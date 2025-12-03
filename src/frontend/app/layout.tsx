import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Auto Job Resume",
  description: "AI-powered job application automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50">
        <div className="min-h-screen flex flex-col">
          <Navbar />

          {/* Main Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {children}
          </main>

          <footer className="bg-white border-t border-slate-200 mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-slate-500">
                &copy; {new Date().getFullYear()} Auto Job Resume. Local-first AI automation.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
