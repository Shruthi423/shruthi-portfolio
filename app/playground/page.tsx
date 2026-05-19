export const metadata = {
  title: "Playground — Shruthi",
};

export default function PlaygroundPage() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-10 text-center">
      <h1
        className="font-display text-h2 text-text"
        style={{ fontWeight: 400, letterSpacing: "-0.02em" }}
      >
        Playground
      </h1>
      <p className="mt-6 max-w-xl font-heading text-paragraph-2 text-muted">
        Off-the-record experiments coming soon — placeholder so the route
        resolves cleanly during development.
      </p>
    </section>
  );
}
