import { DM_Mono } from "next/font/google";
import PhotoStory from "@/app/components/pages/PhotoStory";

// DM Mono — dates, role/meta labels, contact links.
const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const MONO = { fontFamily: "var(--font-dm-mono)" } as const;

// "Hi there" / Experience / Education — mono section labels in a lighter tone.
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        ...MONO,
        color: "var(--color-muted)",
        fontSize: "clamp(0.85rem, 1.4vw, 1.05rem)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </h2>
  );
}

type Row = [company: string, role: string, dates: string];

const EXPERIENCE: Row[] = [
  ["University of Michigan", "Graphic & Visual Designer", "Currently working"],
  ["Perplexity", "Campus Partner", "2025"],
  ["KODIF", "UX·UI Designer", "2025"],
  ["Onki", "UX·UI Designer", "2025"],
  ["SHARP", "Design Consultant", "2024"],
  ["9and9 DigiSoft", "Associate Product Manager", "2023–2024"],
  ["NextLeap", "Product Manager Fellowship", "2023"],
  ["Chennai Toastmasters", "Vice President of Public Relations", "2022–2023"],
];

const EDUCATION: Row[] = [
  ["University of Michigan", "HCI, Design & Research", "2026"],
  ["Anna University", "Computer Science", "2022"],
];

function Table({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="mt-10">
      <SectionTitle>{title}</SectionTitle>
      <div className="mt-5">
        {rows.map(([company, role, dates], i) => (
          <div
            key={`${company}-${role}-${i}`}
            className="flex items-baseline justify-between gap-4 border-b border-border py-[14px]"
          >
            <p className="text-[13.5px] md:text-[16px]">
              <span style={{ color: "var(--text)", fontWeight: 500 }}>{company}</span>
              <span style={{ color: "var(--color-muted)" }}>{" / "}</span>
              <span style={{ color: "var(--color-muted)" }}>{role}</span>
            </p>
            <span
              style={{ ...MONO, color: "var(--color-muted)" }}
              className="shrink-0 whitespace-nowrap text-[10.5px] uppercase md:text-[12px]"
            >
              {dates}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function About() {
  return (
    <div
      className={`${dmMono.variable}`}
      style={{
        backgroundColor: "var(--bg)",
        fontFamily: "var(--font-figtree)",
      }}
    >
      {/* Full-bleed two-panel: text left, filmstrip right (touches the edge). */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr]">
        {/* LEFT — text content, vertically centered in the section on desktop */}
        <div className="px-6 pb-24 pt-10 sm:px-10 lg:max-w-[42rem] lg:self-center lg:py-24 lg:pl-14 lg:pr-12">
            {/* Intro — small "Hi there" label over the full-stack statement heading. */}
            <SectionTitle>Hi there</SectionTitle>
            <p
              className="mt-4 text-[13.5px] leading-[1.75] md:text-[16px]"
              style={{ color: "var(--text)" }}
            >
              A full-stack Product Designer and Engineer with a CS and Product
              Management background. I work across the full arc, from research
              to shipped product.
            </p>

            <Table title="Experience" rows={EXPERIENCE} />
            <Table title="Education" rows={EDUCATION} />
          </div>

        {/* RIGHT — pinned filmstrip, full-bleed to the right edge */}
        <PhotoStory />
      </div>
    </div>
  );
}
