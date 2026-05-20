import { Scramble } from "./components/Scramble";
import { ProjectCard, type Project } from "./components/ProjectCard";

const projects: Project[] = [
  {
    name: "Temple",
    discipline: "Product Management",
    type: "Full-time",
    year: "2024",
    color1: "#F7D0BC",
    color2: "#C45C3A",
    href: "/temple",
  },
  {
    name: "Zuge",
    discipline: "HMI Design",
    type: "Full-time",
    year: "2024",
    color1: "#AFD9FF",
    color2: "#2E6FA3",
    href: "/zuge",
  },
  {
    name: "Kodif",
    discipline: "UX/UI Design",
    type: "Internship",
    year: "2024",
    color1: "#4A9B6F",
    color2: "#1D6C5C",
    href: "/kodif",
  },
  {
    name: "Onki",
    discipline: "UX/UI Design",
    type: "Internship",
    year: "2024",
    color1: "#FCB34F",
    color2: "#A67C20",
    href: "/onki",
  },
  {
    name: "Theta",
    discipline: "AI Exploration",
    year: "2024",
    color1: "#E1D5B5",
    color2: "#8A7D5A",
    href: "/theta",
  },
  {
    name: "Next project",
    discipline: "Coming soon",
    year: "",
    color1: "#ECEAE4",
    color2: "#888780",
  },
];

function Hero() {
  return (
    <section
      className="flex h-screen flex-col items-center justify-center px-10 text-center"
    >
      <h1
        className="font-display text-h1 text-text"
        style={{ fontWeight: 700, letterSpacing: "-0.03em" }}
      >
        <Scramble text="SHRUTHI" />
      </h1>
      <p
        className="mt-8 font-heading text-paragraph-2 text-muted"
        style={{ maxWidth: 920 }}
      >
        A <span style={{ color: "#3a7d3a" }}>multidisciplinary designer</span>{" "}
        with a love for identity systems, visual storytelling, and AI-native
        prototyping.
      </p>
    </section>
  );
}

function ProjectGrid() {
  return (
    <section className="px-10 pb-10" style={{ paddingTop: 10 }}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.name} project={p} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProjectGrid />
    </>
  );
}
