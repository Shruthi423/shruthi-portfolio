import type { Project } from "../components/ProjectCard";
import { WorkGrid } from "../components/WorkGrid";

const projects: Project[] = [
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
    color1: "#F7D0BC",
    color2: "#C45C3A",
    href: "/temple",
  },
  {
    name: "Zuge",
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
    color1: "#AFD9FF",
    color2: "#2E6FA3",
    href: "/zuge",
  },
  {
    name: "Kodif",
    discipline: "UX/UI Design",
    type: "Internship",
    year: "2024",
    description: "AI-powered e-commerce, with the friction designed out.",
    tags: ["-30% Friction", "3× Referrals", "AI-Powered", "E-commerce", "UX/UI"],
    color1: "#4A9B6F",
    color2: "#1D6C5C",
    href: "/kodif",
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
    color1: "#FCB34F",
    color2: "#A67C20",
    href: "/onki",
  },
  {
    name: "Theta",
    discipline: "AI Exploration",
    year: "2024",
    description: "An AI exploration — one-liner from you.", // PLACEHOLDER
    tags: ["AI Exploration", "Generative AI", "Prototype", "R&D", "Concept"],
    color1: "#E1D5B5",
    color2: "#8A7D5A",
    href: "/theta",
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
    color1: "#E7E0CE",
    color2: "#7E6A45",
    image: "/handmade-homestead/hero.jpg",
    href: "/handmade-homestead",
  },
  {
    name: "Indigo Records",
    discipline: "Graphic Design",
    year: "2025", // PLACEHOLDER year — confirm
    description: "Visual identity and assets for an indie record label.", // PLACEHOLDER
    tags: ["Album Art", "Brand System", "Typography", "Posters", "Print"],
    color1: "#CCD0EE",
    color2: "#3D4189",
    href: "/indigo-records",
  },
  {
    name: "Feeld",
    discipline: "Speculative UX",
    type: "Designathon",
    year: "2026",
    description: "A wearable that lets you read the room, and yourself.",
    tags: ["Speculative UX", "Concept", "Wearable contact lens", "Figma Make", "48-Hr Build"],
    color1: "#000000", // matches the mockup's black background → seamless edges
    color2: "#CF4B3B",
    image: "/feeld/Feeld-Mockup-thumb.png", // 4:3 crop tight on the phone screen
    // Warm palette on black. Five explicit entries (one per tag). Cream was
    // failing white-on-light contrast for "Concept" and "Figma Make" — both
    // swapped to darker warm tones so all pills support white text legibly.
    //   0 Speculative UX     → red
    //   1 Concept            → taupe (was cream)
    //   2 Wearable contact lens → amber
    //   3 Figma Make         → deep amber (was cream)
    //   4 48-Hr Build        → red
    pillColors: ["#CF4B3B", "#6B5D3F", "#E89B3A", "#8F6921", "#CF4B3B"],
    href: "/feeld",
  },
  // ---- Coming soon ---- (no `href` → ProjectCard shows "Coming soon" on hover)
  {
    name: "UMSI Expo Badges",
    discipline: "Brand & Identity",
    year: "2026",
    description: "Conference badges for the University of Michigan SI expo.",
    tags: ["Brand & Identity", "Print Design", "Event", "U-M", "Badges"],
    color1: "#FFFFEA", // matches the cover image's cream background → seamless edges
    color2: "#4B4F58",
    image: "/umsi-expo-badges/cover.jpg",
  },
  {
    name: "Ghost",
    discipline: "AI / Browser Extension",
    year: "2026",
    description: "A Chrome extension that helps you write better prompts.",
    tags: ["AI Tooling", "Browser Extension", "Prompt UX", "Chrome", "AI"],
    color1: "#D9D1ED",
    color2: "#5B4DA8",
  },
  {
    name: "Michigan Wellness Wordmark",
    discipline: "Logo & Identity",
    year: "2025",
    description: "Wordmark identity for Michigan Wellness.",
    tags: ["Logo Design", "Wordmark", "Brand & Identity", "Typography"],
    color1: "#C6DDC8",
    color2: "#3E6B49",
  },
  {
    name: "Gesture-based Website",
    discipline: "Interaction Design",
    year: "2026",
    description: "A website you navigate with hand gestures.",
    tags: ["Gesture UX", "Interaction", "Web", "ML/Vision", "Prototype"],
    color1: "#F2C9DA",
    color2: "#B6446F",
  },
  {
    name: "Gesture-based Games",
    discipline: "Interaction Design",
    year: "2026",
    description: "Games you play with your hands in the air.",
    tags: ["Gesture UX", "Game Design", "Interaction", "Play", "Prototype"],
    color1: "#B5E1E5",
    color2: "#2A7882",
  },
  {
    name: "Campus Take",
    discipline: "UX/UI Design",
    year: "2026",
    description: "A takeout experience for University of Michigan dining.",
    tags: ["UX/UI Design", "Food Service", "U-M Dining", "Takeout", "Campus"],
    color1: "#D5DAA8",
    color2: "#6E7E3D",
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
