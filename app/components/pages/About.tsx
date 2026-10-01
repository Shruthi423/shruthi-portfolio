import PhotoStory from "@/app/components/pages/PhotoStory";
import { INK_HUES } from "@/app/lib/footprints";

const LABEL = { fontFamily: "var(--font-mono)" } as const;

/* Row hover + the eyebrow's colour rule. Pure CSS so the page stays a server
 * component: each section scopes --eyebrow to its own palette hue and every
 * coloured part below reads that one variable. */
const STYLES = `
.ab-eyebrow {
  color: var(--eyebrow);
}
.ab-row {
  position: relative;
  transition: border-color 0.35s var(--ease-medium);
}
.ab-row::before {
  content: "";
  position: absolute;
  left: -0.9rem;
  top: 50%;
  width: 3px;
  height: 0;
  background: var(--eyebrow);
  transform: translateY(-50%);
  transition: height 0.35s var(--ease-medium);
}
.ab-row:hover::before { height: 62%; }
.ab-row:hover { border-color: color-mix(in srgb, var(--eyebrow) 45%, transparent); }
.ab-row .ab-company { transition: color 0.35s var(--ease-medium); }
.ab-row:hover .ab-company { color: var(--eyebrow); }
.ab-row .ab-dates { transition: color 0.35s var(--ease-medium); }
.ab-row:hover .ab-dates { color: color-mix(in srgb, var(--eyebrow) 80%, var(--color-muted)); }
`;

// Mono section label, tinted by whichever palette hue its section carries.
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="ab-eyebrow"
      style={{
        // Homemade Apple, not the mono LABEL. The face has one weight and wide,
        // loose capitals, so the mono eyebrow's uppercase + 0.16em tracking
        // come off with it, and the size steps up because it renders small.
        fontFamily: "var(--font-apple)",
        fontSize: "clamp(1.3rem, 2vw, 1.6rem)",
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
  ["SHARP", "Design Consultant", "2023–2024"],
  ["9and9 DigiSoft", "Associate Product Manager", "2021–2023"],
  ["NextLeap", "Product Manager Fellowship", "2023"],
  ["Chennai Toastmasters", "Vice President of Public Relations", "2022–2023"],
];

const EDUCATION: Row[] = [
  ["University of Michigan", "HCI, Design & Research", "2026"],
  ["Anna University", "Computer Science", "2022"],
];

function Table({ title, rows, hue }: { title: string; rows: Row[]; hue: string }) {
  return (
    <section className="mt-14" style={{ "--eyebrow": hue } as React.CSSProperties}>
      <SectionTitle>{title}</SectionTitle>
      <div className="mt-6">
        {rows.map(([company, role, dates], i) => (
          <div
            key={`${company}-${role}-${i}`}
            className="ab-row flex items-baseline justify-between gap-4 border-b border-border py-[15px]"
          >
            <p className="text-[13.5px] md:text-[16px]">
              <span className="ab-company" style={{ color: "var(--text)", fontWeight: 500 }}>
                {company}
              </span>
              <span style={{ color: "var(--color-muted)" }}>{" / "}</span>
              <span style={{ color: "var(--color-muted)" }}>{role}</span>
            </p>
            <span
              style={{ ...LABEL, color: "var(--color-muted)" }}
              className="ab-dates shrink-0 whitespace-nowrap text-[10.5px] uppercase tracking-[0.08em] md:text-[12px]"
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
      style={{
        backgroundColor: "var(--bg)",
        fontFamily: "var(--font-body)",
      }}
    >
      <style>{STYLES}</style>

      {/* Full-bleed two-panel: text left, filmstrip right (touches the edge). */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr]">
        {/* LEFT — text content, vertically centered in the section on desktop */}
        {/* pt clears the fixed nav, which is two rows tall below md and one
            from md up. At lg the column centres itself in a full-height panel
            and the nav floats over the gutter beside it, so it goes back to
            plain symmetrical padding. */}
        <div className="px-5 pb-20 pt-32 sm:px-10 sm:pb-24 md:pt-28 lg:max-w-[42rem] lg:self-center lg:py-24 lg:pl-14 lg:pr-12">
          {/* Intro — the statement runs in the display serif so the column opens
              with a voice instead of another paragraph. */}
          <section style={{ "--eyebrow": INK_HUES.orange } as React.CSSProperties}>
            <SectionTitle>Hi there</SectionTitle>
            <p
              className="mt-6 text-[clamp(1.35rem,2.6vw,2rem)] leading-[1.35]"
              style={{ fontFamily: "var(--font-display)", color: "var(--heading)" }}
            >
              I&rsquo;m Shruthi, an AI-native product builder, engineer and
              designer.
            </p>
            <p
              className="mt-4 text-[13.5px] leading-[1.75] md:text-[16px]"
              style={{ color: "var(--color-muted)" }}
            >
              My background is in CS, HCI and Product Management. I&rsquo;ve
              designed everything from B2B SaaS products to automotive UI.
            </p>
          </section>

          <Table title="Experience" rows={EXPERIENCE} hue={INK_HUES.forest} />
          <Table title="Education" rows={EDUCATION} hue={INK_HUES.plum} />
        </div>

        {/* RIGHT — pinned filmstrip, full-bleed to the right edge */}
        <PhotoStory />
      </div>
    </div>
  );
}
