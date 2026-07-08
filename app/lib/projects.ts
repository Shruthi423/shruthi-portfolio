import type { Project } from "@/app/components/work/ProjectCard";

// Single source of truth for the project list. Imported by the one-pager home's
// work grid (the site no longer has a standalone /work route). Order is
// intentional (not date-sorted) — WorkGrid preserves it on every filter.
export const projects: Project[] = [
  // ---- Live case studies (clickable) ---- ordered: Kodif, Zuge, SpotHive, 9and9, then the rest
  {
    name: "Kodif",
    accent: "#ea6213",
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
    accent: "#a1f47b",
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
    name: "SpotHive",
    accent: "#817bf4",
    status: "built",
    discipline: "Product Design",
    type: "Full-time",
    year: "2023-2024",
    description: "A 0-to-1 workspace booking product with a live seat map.",
    tags: ["0-to-1", "One-Month Ship", "Live Seat Map", "Design System", "30+ Screens"],
    image: "/spothive/cover.png",
    href: "/spothive",
  },
  {
    // Srisailam / Andhra Pradesh temple ticketing, built at company 9and9.
    // Route stays /temple; the card + breadcrumb read "9and9".
    name: "9and9",
    accent: "#f4de7b",
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
    accent: "#f47b7b",
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
    accent: "#4b9b77",
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
    accent: "#7bc1f4",
    status: "built",
    discipline: "Speculative UX",
    type: "Designathon",
    year: "2026",
    description: "A wearable that lets you read the room, and yourself.",
    tags: ["Speculative UX", "Concept", "Wearable contact lens", "Figma Make", "48-Hr Build"],
    image: "/feeld/cover.png",
    href: "/feeld",
  },
  // ---- HIDDEN until finished (route /umsi-expo-badges still exists for preview). ----
  // {
  //   name: "UMSI Expo Badges",
  //   status: "built",
  //   discipline: "Brand & Identity",
  //   year: "2026",
  //   description: "Conference badges for the University of Michigan SI expo.",
  //   tags: ["Brand & Identity", "Print Design", "Event", "U-M", "Badges"],
  //   image: "/umsi-expo-badges/cover.png",
  //   hoverLabel: "Updating Now",
  //   href: "/umsi-expo-badges",
  // },
  // ---- Coming soon ---- (no `href` → ProjectCard shows "Coming soon" on hover)
  {
    name: "PCS Global",
    accent: "#7bf4d7",
    status: "soon",
    discipline: "UX/UI Design", // confirm
    year: "2026", // confirm
    image: "/pcs-global/cover.png",
    hoverLabel: "Updating Now",
    // description + tags omitted until real copy is ready
  },
  {
    name: "Indigo Records",
    accent: "#e0574f",
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
  // ---- HIDDEN until finished. ----
  // {
  //   name: "Umood",
  //   status: "soon",
  //   discipline: "Logo & Identity",
  //   year: "2025",
  //   description: "A wellness companion wordmark for U-M students.",
  //   tags: ["Wordmark", "Brand & Identity", "Typography", "U-M Wellness", "Logo"],
  //   image: "/umood/cover.png",
  //   hoverLabel: "Coming soon",
  // },
  {
    name: "Gesture-based Games",
    accent: "#d6f47b",
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
