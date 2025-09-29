import "~/styles/globals.css";

import Link from "next/link";
import { type Metadata } from "next";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "Speak Ika",
  description: "AI that understands the Ika language",
  icons: [{ rel: "icon", url: "/speak-ika.png" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-text)]">
        <header className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] backdrop-blur">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 text-sm">
            <Link href="/" className="font-semibold tracking-wide text-[color:var(--color-accent)]">
              Speak Ika
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              {/** Keep navigation buttons consistent across pages. */}
              <Link
                className="rounded-full bg-[color:var(--color-surface-muted)] px-4 py-1.5 font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface)]"
                href="/"
              >
                Home
              </Link>
              <Link
                className="rounded-full bg-[color:var(--color-surface-muted)] px-4 py-1.5 font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface)]"
                href="/try"
              >
                Try
              </Link>
              <Link
                className="rounded-full bg-[color:var(--color-surface-muted)] px-4 py-1.5 font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface)]"
                href="/contribute"
              >
                Contribute
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 bg-[var(--color-background)]">{children}</main>
      </body>
    </html>
  );
}
