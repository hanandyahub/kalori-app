import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
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
  title: "Kalori App",
  description: "Hitung kalori makanan dari foto pakai AI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html
        lang="id"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <header className="flex items-center justify-between px-6 py-4 border-b border-border">
            <Link href="/" className="font-bold text-lg">
              🥗 Kalori App
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/riwayat" className="text-sm text-muted-foreground hover:text-foreground">
                Riwayat
              </Link>
              <Show when="signed-in">
                <UserButton />
              </Show>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-sm rounded-full bg-primary text-primary-foreground px-4 py-1.5 font-medium">
                    Login
                  </button>
                </SignInButton>
              </Show>
            </nav>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
