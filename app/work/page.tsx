import { ProjectCard, type Project } from "../components/ProjectCard";

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
    discipline: "Branding & Visual Assets",
    year: "2025", // PLACEHOLDER year — confirm
    description: "A handcrafted brand identity for a modern homestead.", // PLACEHOLDER
    tags: ["Logo", "Packaging", "Brand System", "Illustration", "Print"],
    color1: "#E7E0CE",
    color2: "#7E6A45",
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
    discipline: "Figma Designathon",
    year: "2026",
    description: "A Figma Designathon concept for Feeld.", // PLACEHOLDER
    tags: ["Concept", "Figma", "Prototype", "UX", "8-Hr Build"],
    color1: "#F7CFC9",
    color2: "#CF4B3B",
    href: "/feeld",
  },
];

export default function WorkPage() {
  return (
    <>
      <header className="flex flex-col items-center px-10 pb-24 pt-40 text-center">
        <h1
          className="font-display text-h1 text-heading"
          style={{ fontWeight: 700, letterSpacing: "-0.03em" }}
        >
          Work
        </h1>
      </header>
      <section className="px-10 pb-10">
        <div className="mx-auto grid grid-cols-1 gap-x-8 gap-y-16 md:w-4/5 md:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </div>
      </section>
    </>
  );
}
