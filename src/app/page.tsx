import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 text-center">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-[4.5rem]">
          Speak <span className="text-[color:var(--color-accent)]">Ika</span> App
        </h1>
        <p className="max-w-2xl text-base text-[color:var(--color-muted)]">
          Experiment with early tooling for automatic Ika speech recognition and translation, then join the crew helping
          build the next generation of language technology.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
            className="flex max-w-xs flex-col gap-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)] p-5 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-lg"
            href="/try"
            >
            <h3 className="text-2xl font-semibold text-[color:var(--color-text)]">Try it out →</h3>
            <div className="text-sm text-[color:var(--color-muted)]">
              Test out the Ika speech recognition model and the Ika to English machine translation model.
            </div>
            </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)] p-5 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-lg"
            href="/contribute"
            target="_blank"
          >
            <h3 className="text-2xl font-semibold text-[color:var(--color-text)]">Contribute →</h3>
            <div className="text-sm text-[color:var(--color-muted)]">
              Join the Ika community and contribute to the development
              of AI tools for Ika people.
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
