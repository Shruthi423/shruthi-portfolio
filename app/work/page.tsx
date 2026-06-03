import type { Project } from "../components/ProjectCard";
import { WorkGrid } from "../components/WorkGrid";

const projects: Project[] = [
  // ---- Live case studies (clickable) ----
  {
    name: "Kodif",
    discipline: "UX/UI Design",
    type: "Internship",
    year: "2024",
    description: "AI-powered e-commerce, with the friction designed out.",
    tags: ["-30% Friction", "3× Referrals", "AI-Powered", "E-commerce", "UX/UI"],
    color1: "#FFCDF4", // matches the new cover's pink border → seamless edges
    color2: "#1D6C5C",
    image: "/kodif/cover.png",
    href: "/kodif",
  },
  {
    name: "Zuge Electric",
    discipline: "HMI Design",
    type: "Full-time",
    year: "2024",
    description: "A delivery-first EV dashboard for 2M+ gig riders.",
    tags: [
      "2M+ Riders",
      "-73% Phone Use",
      "87% Satisfaction",
      "HMI Design",
      "EV Mobility",
    ],
    color1: "#E2FFCB", // matches the new cover's mint border → seamless edges
    color2: "#2E6FA3",
    image: "/zuge/cover.png",
    hoverLabel: "Updating now",
    href: "/zuge",
  },
  {
    name: "Temple",
    discipline: "Product Management",
    type: "Full-time",
    year: "2024",
    description: "Ticketing redesigned for digital literacy & trust.",
    tags: [
      "500K Users",
      "$2.1M Revenue",
      "Product Strategy",
      "Trust & Safety",
      "Ticketing",
    ],
    color1: "#FFF0A4", // matches the new cover's pale yellow border → seamless edges
    color2: "#C45C3A",
    image: "/temple/cover.png",
    href: "/temple",
  },
  {
    name: "Onki",
    discipline: "UX/UI Design",
    type: "Internship",
    year: "2024",
    description: "A conversational AI expert for smarter in-store shopping.",
    tags: [
      "Conversational AI",
      "In-Store Retail",
      "Chat UX",
      "Voice & Text",
      "In Progress",
    ],
    color1: "#FFCAC9", // matches the new cover's coral pink border → seamless edges
    color2: "#A67C20",
    image: "/onki/cover.png",
    hoverLabel: "Updating now",
    href: "/onki",
  },
  {
    name: "Handmade Homestead",
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
    color1: "#1F3A2E", // matches the new cover's deep forest green → seamless edges
    color2: "#C45C3A",
    image: "/handmade-homestead/cover.png",
    href: "/handmade-homestead",
  },
  {
    name: "Feeld",
    discipline: "Speculative UX",
    type: "Designathon",
    year: "2026",
    description: "A wearable that lets you read the room, and yourself.",
    tags: ["Speculative UX", "Concept", "Wearable contact lens", "Figma Make", "48-Hr Build"],
    color1: "#C6E7FF", // matches the new cover's pale blue border → seamless edges
    color2: "#CF4B3B",
    image: "/feeld/cover.png",
    // Five explicit warm-tone pill entries (one per tag). Cream tones were
    // dropped earlier for white-on-light contrast on "Concept" and "Figma
    // Make"; the warm reds/ambers still hold up against the new pale blue
    // bg, so the override stays.
    pillColors: ["#CF4B3B", "#6B5D3F", "#E89B3A", "#8F6921", "#CF4B3B"],
    href: "/feeld",
  },
  {
    name: "UMSI Expo Badges",
    discipline: "Brand & Identity",
    year: "2026",
    description: "Conference badges for the University of Michigan SI expo.",
    tags: ["Brand & Identity", "Print Design", "Event", "U-M", "Badges"],
    color1: "#FFFFC0", // matches the new cover's pale yellow border → seamless edges
    color2: "#4B4F58",
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
  //   discipline: "UX/UI Design",
  //   year: "2026",
  //   description: "A daily opinion poll for 53,000+ U-M students.",
  //   tags: ["53K Students", "Vote · Predict · Reveal", "Mobile First", "Motion Design", "Vibe Coded"],
  //   color1: "#DAEA9A",
  //   color2: "#00274C",
  //   image: "/campus-take/cover.png",
  //   href: "/campus-take",
  // },

  // ---- Coming soon ---- (no `href` → ProjectCard shows "Coming soon" on hover)
  {
    name: "PCS Global",
    discipline: "UX/UI Design", // PLACEHOLDER — confirm
    year: "2026", // PLACEHOLDER — confirm
    description: "PCS Global — one-liner from you.", // PLACEHOLDER
    tags: ["TBD", "TBD", "TBD", "TBD", "TBD"], // PLACEHOLDER
    color1: "#C9FFF2", // matches the new cover's mint border → seamless edges
    color2: "#1F5E52", // placeholder darker teal complement — confirm
    image: "/pcs-global/cover.png",
    hoverLabel: "Updating Now",
  },
  {
    name: "Indigo Records",
    discipline: "Graphic Design",
    year: "2025", // PLACEHOLDER year — confirm
    description: "Visual identity and assets for an indie record label.", // PLACEHOLDER
    tags: ["Album Art", "Brand System", "Typography", "Posters", "Print"],
    color1: "#D8DDFF", // matches the new cover's lavender border → seamless edges
    color2: "#3D4189",
    image: "/indigo-records/cover.png",
    hoverLabel: "Updating Now",
  },
  {
    name: "Theta",
    discipline: "AI Exploration",
    year: "2024",
    description: "An AI exploration — one-liner from you.", // PLACEHOLDER
    tags: ["AI Exploration", "Generative AI", "Prototype", "R&D", "Concept"],
    color1: "#CBCAFF", // matches the new cover's pale periwinkle border → seamless edges
    color2: "#8A7D5A",
    image: "/theta/cover.png",
    hoverLabel: "Coming soon",
  },
  {
    name: "Umood",
    discipline: "Logo & Identity",
    year: "2025",
    description: "A wellness companion wordmark for U-M students.",
    tags: ["Wordmark", "Brand & Identity", "Typography", "U-M Wellness", "Logo"],
    color1: "#FF9A9A", // matches the new cover's coral pink border → seamless edges
    color2: "#00274C", // U-M Navy, the wordmark's primary
    image: "/umood/cover.png",
    hoverLabel: "Coming soon",
  },
  {
    name: "Ghost",
    discipline: "AI / Browser Extension",
    year: "2026",
    description: "A Chrome extension that helps you write better prompts.",
    tags: ["AI Tooling", "Browser Extension", "Prompt UX", "Chrome", "AI"],
    color1: "#262122", // matches the new cover's near-black background → seamless edges
    color2: "#FCE49A", // warm yellow accent
    image: "/ghost/cover.png",
    hoverLabel: "Building Now",
  },
  {
    name: "Gesture-based Games",
    discipline: "Interaction Design",
    year: "2026",
    description: "Games you play with your hands in the air.",
    tags: ["Gesture UX", "Game Design", "Interaction", "Play", "Prototype"],
    color1: "#DFFF80", // matches the new cover's lime border → seamless edges
    color2: "#2A7882",
    image: "/gesture-based-games/cover.png",
    hoverLabel: "Updating Now",
  },
  {
    name: "Talking Maize and Blue",
    discipline: "Brand & Identity", // PLACEHOLDER — confirm
    year: "2026", // PLACEHOLDER — confirm
    description: "Brand & identity for Talking Maize and Blue.", // PLACEHOLDER
    tags: ["Brand & Identity", "U-M", "TBD"], // PLACEHOLDER
    color1: "#E6FFD1", // matches the new cover's mint border → seamless edges
    color2: "#00274C", // U-M Blue
    image: "/talking-maize-and-blue/cover.png",
    hoverLabel: "Building Now",
  },
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
