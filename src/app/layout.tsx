import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ################################################################################################

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuthJS-v5",
  description: "A project exploring authentication techniques in Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="en">
        <body className={cn(inter.className, "bg-slate-100")}>
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-500 to-blue-900" />
          {children}
          <ToastContainer />
        </body>
      </html>
    </SessionProvider>
  );
}
