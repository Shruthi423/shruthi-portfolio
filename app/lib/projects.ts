import type { Project } from "@/app/components/work/ProjectCard";

// Single source of truth for the project list. Imported by the one-pager home's
// work grid (the site no longer has a standalone /work route). Order is
// intentional (not date-sorted) — WorkGrid preserves it.
export const projects: Project[] = [
  // ---- In progress ---- title-only tiles: no discipline/year/description/tags.
  // Amuse Bouche's card art is the live AmuseBoucheThumbnail (the `image` here
  // is only the still WorkList floats on hover). DeepClean's card art is the
  // live DeepCleanThumbnail (the spider-and-terminal loop embedded from
  // public/deepclean/motion-thumbnail.html), so it needs no `image` either.
  {
    name: "Amuse Bouche",
    title: "Amuse Bouche",
    headline: "Amuse Bouche",
    status: "building",
    description: "A visual canvas for building AI workflows and orchestrating evals.",
    image: "/amuse-bouche/cover.jpg",
    // No public link yet — the repo stays private until it's further along.
    hoverLabel: "Currently building",
  },
  // OpenTabs' card art is the live OpenTabsThumbnail (the door-and-wordmark
  // loop ported from opentabs-motion-thumbnail.html), so it needs no `image`.
  {
    name: "OpenTabs",
    title: "OpenTabs",
    headline: "OpenTabs",
    status: "building",
    description: "Personal job listing curation.",
    hoverLabel: "View",
    liveHref: "https://shruthi423.github.io/OpenTabs/",
    repoHref: "https://github.com/Shruthi423/OpenTabs",
  },
  {
    name: "DeepClean",
    title: "DeepClean for Claude Code & Codex",
    headline: "DeepClean for Claude Code & Codex",
    status: "building",
    description: "A one line command for context management, with a human in the loop.",
    hoverLabel: "Try it",
    repoHref: "https://github.com/Shruthi423/Deepclean",
  },
  // ---- Live case studies (clickable) ---- ordered: Domu, 9and9, Zuge, Kodif, then the rest
  // Domu's card art is the live DomuThumbnail (the calls-into-stacks loop from
  // public/domu/motion-thumbnail.html), so it needs no `image`. It's also the
  // one clickable card carrying a GitHub link, which ProjectCard renders in the
  // label slot beside the title, the same as DeepClean and OpenTabs.
  {
    name: "Domu",
    title: "Domu: Hannah's Operations Platform",
    headline: "Domu: Hannah's Operations Platform",
    status: "built",
    discipline: "Product Design",
    year: "2026", // confirm
    description:
      "Designing how ops leads see the work Domu's voice agent does, passes on, and gets wrong.",
    tags: [
      "AI Voice Agents",
      "Ops Dashboard",
      "Division of Labour",
      "Product Design",
      "Prototype",
    ],
    repoHref: "https://github.com/Shruthi423/Domu",
    href: "/domu",
  },
  {
    // Srisailam / Andhra Pradesh temple ticketing, built at company 9and9.
    // Route stays /temple; the card + breadcrumb read "9and9".
    name: "9and9",
    title: "9and9: Book with AI",
    headline: "9and9: Book with AI",
    status: "built",
    discipline: ["Product Management", "Product Design"],
    type: "Full-time",
    year: "2021-2023",
    description: "Booking for 174 historic sites, with an AI guide that speaks 11 Indian languages.",
    tags: [
      "500K Users",
      "$2.1M Revenue",
      "Product Management",
      "Product Design",
      "Trust & Safety",
      "Ticketing",
    ],
    image: "/temple/cover.png",
    href: "/temple",
  },
  {
    name: "Zuge Electric",
    title: "EV Dashboard with a Copilot",
    headline: "EV Dashboard with a Copilot",
    status: "built",
    discipline: ["Automotive HMI", "Voice AI"],
    type: "Full-time",
    year: "2023-2024",
    description: "An EV dashboard for delivery riders, rebuilt with a multilingual voice co-pilot.",
    tags: [
      "2M+ Riders",
      "-73% Phone Use",
      "87% Satisfaction",
      "HMI Design",
      "EV Mobility",
      "Product Management",
      "Product Design",
    ],
    image: "/zuge/cover.png",
    href: "/zuge",
  },
  {
    name: "SpotHive",
    archived: true,
    title: "SpotHive: Workspace Booking",
    headline: "SpotHive: Workspace Booking",
    status: "built",
    discipline: "Product Design",
    type: "Full-time",
    year: "2023-2024",
    description: "Find and book an office seat with a live availability map.",
    tags: ["0-to-1", "One-Month Ship", "Live Seat Map", "Design System", "30+ Screens"],
    image: "/spothive/cover.png",
    href: "/spothive",
  },
  {
    name: "Kodif",
    title: "Kodif: E-commerce AI",
    headline: "Kodif: E-commerce AI",
    status: "built",
    discipline: "UX/UI Design",
    type: "Internship",
    year: "2025",
    description: "Website, onboarding, and growth design for an AI customer support platform.",
    tags: ["-30% Friction", "3× Referrals", "AI-Powered", "E-commerce", "UX/UI"],
    image: "/kodif/cover.png",
    href: "/kodif",
  },
  {
    name: "Onki",
    title: "Onki: AI Sommelier",
    headline: "Onki: AI Sommelier",
    status: "built",
    discipline: "UX/UI Design",
    type: "Internship",
    year: "2025",
    description: "A voice and touch kiosk that helps shoppers find their next bottle.",
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
    title: "Handmade Homestead",
    headline: "Handmade Homestead",
    status: "built",
    discipline: "Brand & Social",
    year: "2025", // PLACEHOLDER year — confirm
    description: "A visual identity and social presence for a homesteading brand.",
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
    title: "Feeld: Emotional Awareness",
    headline: "Feeld: Emotional Awareness",
    status: "built",
    discipline: "Speculative UX",
    type: "Designathon",
    year: "2026",
    description: "A speculative wearable that makes emotional signals visible.",
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
    archived: true,
    // TODO headline — needs a real "How I ..." line from Shruthi.
    // Until then WorkList falls back to showing the name.
    status: "soon",
    discipline: "UX/UI Design", // confirm
    year: "2026", // confirm
    image: "/pcs-global/cover.png",
    hoverLabel: "Updating Now",
    // description + tags omitted until real copy is ready
  },
  {
    name: "Indigo Records",
    archived: true,
    // TODO headline — needs a real "How I ..." line from Shruthi.
    // Until then WorkList falls back to showing the name.
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
    archived: true,
    title: "Gesture-controlled Games",
    headline: "Gesture-controlled Games",
    status: "building",
    discipline: "Interaction Design",
    year: "2026",
    description: "Play through hand movements with touch-free game interactions.",
    tags: ["Gesture UX", "Game Design", "Interaction", "Play", "Prototype"],
    image: "/gesture-based-games/cover.png",
    hoverLabel: "Updating Now",
  },
  // Talking Maize & Blue — an interactive U-M orientation experience (Answer →
  // Predict → Reveal, plus policy videos, SWAY student connection, and a warm
  // welcome). Shruthi was product & visual designer: interaction, accessibility,
  // an illustration system, responsive layouts, usability testing. Built Apr–Jun
  // 2026, launched Jul 2026. Real project lives at ~/Desktop/tmb2-main (React/
  // Vite + AWS Amplify; repo github.com/umsi/tmb2, private). Card stays a
  // non-clickable "building" tile until the case-study page ships.
  {
    name: "Talking Maize & Blue",
    archived: true,
    title: "Talking Maize & Blue",
    headline: "Talking Maize & Blue",
    status: "building",
    discipline: "Product & Visual Design",
    year: "2026",
    description: "An interactive U-M orientation exploring different perspectives on campus issues.",
    tags: ["Product Design", "Visual Design", "Accessibility", "Illustration", "U-M Orientation"],
    image: "/talking-maize-and-blue/cover.png",
    hoverLabel: "Currently Building!",
  },
];

// Flip archived to false (or remove it) when a project is ready to return.
export const activeProjects = projects.filter((project) => !project.archived);
