export const metadata = {
  title: "About — Shruthi",
};

export default function AboutPage() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-10 text-center">
      <h1
        className="font-display text-h2 text-text"
        style={{ fontWeight: 400, letterSpacing: "-0.02em" }}
      >
        About
      </h1>
      <p className="mt-6 max-w-xl font-heading text-paragraph-2 text-muted">
        Page in progress — placeholder so the route resolves cleanly during
        development.
      </p>
    </section>
  );
}
