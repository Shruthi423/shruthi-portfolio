import { ProjectCard, type Project } from "@/app/components/work/ProjectCard";

/** A fixed two-column editorial grid, preserving the curated project order. */
export function WorkGrid({
  projects,
  heading,
}: {
  projects: Project[];
  heading?: string;
}) {
  return (
    <section className="mx-auto w-full max-w-[1140px] px-6 pb-24 pt-4 sm:pt-8">
      {heading && (
        // Homemade Apple, the same face as the `Label` eyebrow the case studies
        // use, with the uppercase and the 0.08em tracking dropped. Both were
        // doing a job for a sans label and both fight a joined handwriting
        // face — caps it barely has, and tracking that pulls its joins apart.
        //
        // Set at --text-h3 rather than --text-eyebrow: this is the one section
        // heading on the home, not a card eyebrow, and at eyebrow size it read
        // as a caption under the hero instead of the title of the work.
        <h2 className="mb-16 text-center font-apple text-h3 font-normal text-muted">
          {heading}
        </h2>
      )}
      <div className="grid grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </section>
  );
}
