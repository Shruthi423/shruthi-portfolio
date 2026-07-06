import type { Project } from "../components/ProjectCard";
import { WorkGrid } from "../components/WorkGrid";

const projects: Project[] = [
  // ---- Live case studies (clickable) ----
  {
    name: "Kodif",
    status: "built",
    discipline: "UX/UI Design",
    type: "Internship",
    year: "2025",
    description: "AI-powered e-commerce, with the friction designed out.",
    tags: ["-30% Friction", "3× Referrals", "AI-Powered", "E-commerce", "UX/UI"],
    image: "/kodif/cover.png",
    href: "/kodif",
  },
  {
    name: "Zuge Electric",
    status: "built",
    discipline: "HMI Design",
    type: "Full-time",
    year: "2023-2024",
    description: "A delivery-first EV dashboard for 2M+ gig riders.",
    tags: [
      "2M+ Riders",
      "-73% Phone Use",
      "87% Satisfaction",
      "HMI Design",
      "EV Mobility",
    ],
    image: "/zuge/cover.png",
    href: "/zuge",
  },
  {
    name: "Temple",
    status: "built",
    discipline: "Product Management",
    type: "Full-time",
    year: "2022-2023",
    description: "Ticketing redesigned for digital literacy & trust.",
    tags: [
      "500K Users",
      "$2.1M Revenue",
      "Product Strategy",
      "Trust & Safety",
      "Ticketing",
    ],
    image: "/temple/cover.png",
    href: "/temple",
  },
  {
    name: "Onki",
    status: "built",
    discipline: "UX/UI Design",
    type: "Internship",
    year: "2025",
    description: "A conversational AI expert for smarter in-store shopping.",
    tags: [
      "Conversational AI",
      "In-Store Retail",
      "Chat UX",
      "Voice & Text",
      "In Progress",
    ],
    image: "/onki/cover.png",
    href: "/onki",
  },
  {
    name: "Handmade Homestead",
    status: "built",
    discipline: "Brand & Social",
    year: "2025", // PLACEHOLDER year — confirm
    description: "A homestead brand, grown from identity to 152.6K views.",
    tags: [
      "Brand System",
      "Visual Identity",
      "Social Strategy",
      "152.6K Views",
      "Content Design",
    ],
    image: "/handmade-homestead/cover.png",
    href: "/handmade-homestead",
  },
  {
    name: "Feeld",
    status: "built",
    discipline: "Speculative UX",
    type: "Designathon",
    year: "2026",
    description: "A wearable that lets you read the room, and yourself.",
    tags: ["Speculative UX", "Concept", "Wearable contact lens", "Figma Make", "48-Hr Build"],
    image: "/feeld/cover.png",
    // Five explicit warm-tone pill entries (one per tag). Cream tones were
    // dropped earlier for white-on-light contrast on "Concept" and "Figma
    // Make"; the warm reds/ambers still hold up against the new pale blue
    // bg, so the override stays.
    href: "/feeld",
  },
  {
    name: "UMSI Expo Badges",
    status: "built",
    discipline: "Brand & Identity",
    year: "2026",
    description: "Conference badges for the University of Michigan SI expo.",
    tags: ["Brand & Identity", "Print Design", "Event", "U-M", "Badges"],
    image: "/umsi-expo-badges/cover.png",
    hoverLabel: "Updating Now",
    href: "/umsi-expo-badges",
  },
  // ---- HIDDEN: Campus Take ----
  // Temporarily removed from the grid. Component, public assets, and page
  // wrapper code stay on disk; re-enable by uncommenting this block AND
  // restoring app/campus-take/page.tsx (see git history).
  // {
  //   name: "Campus Take",
  //   status: "built",
  //   discipline: "UX/UI Design",
  //   year: "2026",
  //   description: "A daily opinion poll for 53,000+ U-M students.",
  //   tags: ["53K Students", "Vote · Predict · Reveal", "Mobile First", "Motion Design", "Vibe Coded"],
  //   image: "/campus-take/cover.png",
  //   href: "/campus-take",
  // },

  // ---- Coming soon ---- (no `href` → ProjectCard shows "Coming soon" on hover)
  // ---- HIDDEN: not fully filled in (placeholder copy). Restore once real
  // copy + tags are ready.
  // {
  //   name: "PCS Global",
  //   status: "soon",
  //   discipline: "UX/UI Design", // PLACEHOLDER — confirm
  //   year: "2026", // PLACEHOLDER — confirm
  //   description: "PCS Global — one-liner from you.", // PLACEHOLDER
  //   tags: ["TBD", "TBD", "TBD", "TBD", "TBD"], // PLACEHOLDER
  //   image: "/pcs-global/cover.png",
  //   hoverLabel: "Updating Now",
  // },
  {
    name: "Indigo Records",
    status: "soon",
    discipline: "Graphic Design",
    year: "2025", // PLACEHOLDER year — confirm
    description: "Visual identity and assets for an indie record label.", // PLACEHOLDER
    tags: ["Album Art", "Brand System", "Typography", "Posters", "Print"],
    image: "/indigo-records/cover.png",
    hoverLabel: "Updating Now",
  },
  // ---- HIDDEN: not fully filled in (placeholder copy). Restore once real
  // copy + tags are ready.
  // {
  //   name: "Theta",
  //   status: "soon",
  //   discipline: "AI Exploration",
  //   year: "2024",
  //   description: "An AI exploration — one-liner from you.", // PLACEHOLDER
  //   tags: ["AI Exploration", "Generative AI", "Prototype", "R&D", "Concept"],
  //   image: "/theta/cover.png",
  //   hoverLabel: "Coming soon",
  // },
  {
    name: "Umood",
    status: "soon",
    discipline: "Logo & Identity",
    year: "2025",
    description: "A wellness companion wordmark for U-M students.",
    tags: ["Wordmark", "Brand & Identity", "Typography", "U-M Wellness", "Logo"],
    image: "/umood/cover.png",
    hoverLabel: "Coming soon",
  },
  {
    name: "Ghost",
    status: "building",
    discipline: "AI / Browser Extension",
    year: "2026",
    description: "A Chrome extension that helps you write better prompts.",
    tags: ["AI Tooling", "Browser Extension", "Prompt UX", "Chrome", "AI"],
    image: "/ghost/cover.png",
    hoverLabel: "Building Now",
  },
  {
    name: "Gesture-based Games",
    status: "building",
    discipline: "Interaction Design",
    year: "2026",
    description: "Games you play with your hands in the air.",
    tags: ["Gesture UX", "Game Design", "Interaction", "Play", "Prototype"],
    image: "/gesture-based-games/cover.png",
    hoverLabel: "Updating Now",
  },
  // ---- HIDDEN: not fully filled in (placeholder copy). NOTE: this is actually
  // your strongest resume proof — the ~10,000-student U-M orientation site you
  // coded solo (HTML/CSS/JS/GSAP, >98% completion). Rebuild it as a full
  // PRODUCT case study, not a "Brand & Identity" card. Restore then.
  // {
  //   name: "Talking Maize and Blue",
  //   status: "building",
  //   discipline: "Brand & Identity", // PLACEHOLDER — confirm
  //   year: "2026", // PLACEHOLDER — confirm
  //   description: "Brand & identity for Talking Maize and Blue.", // PLACEHOLDER
  //   tags: ["Brand & Identity", "U-M", "TBD"], // PLACEHOLDER
  //   image: "/talking-maize-and-blue/cover.png",
  //   hoverLabel: "Building Now",
  // },
];

export default function WorkPage() {
  return (
    <>
      <header className="flex flex-col items-center px-10 pb-24 pt-40 text-center">
        <h1
          className="font-display lowercase text-heading"
          style={{
            fontWeight: 700,
            fontSize: "clamp(2.75rem, 11vw, 7.875rem)",
            lineHeight: 1,
            letterSpacing: "-0.01em",
          }}
        >
          work
        </h1>
      </header>
      <WorkGrid projects={projects} />
    </>
  );
}
