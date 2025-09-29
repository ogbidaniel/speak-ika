export default function ContributePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-text)]">
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--color-muted)]">Join The Effort</p>
          <h1 className="text-4xl font-semibold text-[color:var(--color-text)]">Help Shape The Ika AI Models</h1>
          <p className="text-sm text-[color:var(--color-muted)]">
            We are collecting a list of early collaborators who want to support the next wave of Ika speech and translation
            technology. Share your contact email below and we will reach out with the next steps.
          </p>
        </header>

        <div className="w-full rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 text-left shadow-[var(--shadow-card)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-[color:var(--color-text)]">Express Your Interest</h2>
          <p className="mt-3 text-sm text-[color:var(--color-muted)]">
            Drop a quick note with your email address and how you would like to contribute—data collection, model training,
            evaluation, or something else. We will confirm receipt and follow up soon.
          </p>
          {/* Placeholder form for future backend integration. */}
          <form className="mt-6 flex flex-col gap-3">
            <label className="text-sm font-medium text-[color:var(--color-muted)]" htmlFor="email">
              Contact email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-3 text-[color:var(--color-text)] outline-none transition focus:border-[color:var(--color-accent)]"
              disabled
            />
            <textarea
              id="message"
              name="message"
              rows={3}
              placeholder="Let us know how you would like to help..."
              className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-3 text-[color:var(--color-text)] outline-none transition focus:border-[color:var(--color-accent)]"
              disabled
            />
            <button
              type="button"
              className="rounded-2xl bg-[color:var(--color-accent)] px-4 py-3 text-sm font-semibold text-white opacity-70"
              disabled
            >
              Submission opening soon
            </button>
          </form>
        </div>

        <p className="text-xs text-[color:var(--color-muted)]">
          Prefer email? Write to
          <a className="mx-1 text-[color:var(--color-accent)] underline hover:opacity-80" href="mailto:hello@speak-ika.org">
            hello@speak-ika.org
          </a>
          and mention you want to contribute to the Ika AI models.
        </p>
      </section>
    </main>
  );
}
