import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Toaster } from "react-hot-toast";
import IdleLogoutGuard from "@/components/auth/IdleLogoutGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rasacode Admin Portal",
  description: "Advanced Real Estate Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50`}
      >
        <ReactQueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <IdleLogoutGuard />
              {children}
              <Toaster
                position="top-right"
                reverseOrder={false}
                containerStyle={{
                  top: 20,
                  right: 20,
                  zIndex: 99999,
                }}
              />
            </AuthProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
