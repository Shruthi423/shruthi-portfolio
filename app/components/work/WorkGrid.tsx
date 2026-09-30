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
        <h2 className="mb-8 text-center font-body text-[16px] font-normal uppercase tracking-[0.08em] text-muted">
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
