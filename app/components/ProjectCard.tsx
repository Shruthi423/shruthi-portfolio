"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export type Project = {
  name: string;
  discipline: string;
  type?: string;
  year: string;
  color1: string;
  color2: string;
  href?: string;
};

const SMOOTH_EASE = [0.22, 1, 0.36, 1] as const;
const COLUMN_COUNT = 7;
const COLUMN_STAGGER = 0.08;
const COLUMN_DURATION = 1.0;

export function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);

  const tags = [project.discipline, project.type, project.year]
    .filter(Boolean)
    .join(" · ");

  const inner = (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative aspect-square w-full overflow-hidden rounded-lg"
      style={{ backgroundColor: project.color2 }}
    >
      <div className="pointer-events-none absolute inset-0 flex">
        {Array.from({ length: COLUMN_COUNT }).map((_, i) => (
          <motion.div
            key={i}
            className="h-full flex-1"
            style={{ backgroundColor: project.color1 }}
            initial={false}
            animate={{ y: hovered ? "0%" : "100%" }}
            transition={{
              duration: COLUMN_DURATION,
              ease: SMOOTH_EASE,
              delay: hovered
                ? i * COLUMN_STAGGER
                : (COLUMN_COUNT - 1 - i) * (COLUMN_STAGGER * 0.6),
            }}
          />
        ))}
      </div>

      <motion.div
        initial={false}
        animate={{
          opacity: hovered ? 1 : 0,
          y: hovered ? 0 : 16,
        }}
        transition={{
          duration: 0.35,
          ease: SMOOTH_EASE,
          delay: hovered
            ? COLUMN_COUNT * COLUMN_STAGGER + COLUMN_DURATION * 0.6
            : 0,
        }}
        className="pointer-events-none absolute inset-x-0 bottom-0 p-6"
      >
        <h3
          className="font-heading text-paragraph font-medium"
          style={{ color: project.color2 }}
        >
          {project.name}
        </h3>
        <p
          className="mt-2 font-mono text-caption-2 uppercase tracking-wide"
          style={{ color: project.color2, opacity: 0.65 }}
        >
          {tags}
        </p>
      </motion.div>
    </article>
  );

  if (!project.href) return inner;
  return (
    <Link
      href={project.href}
      data-cursor-label="↗"
      className="block"
    >
      {inner}
    </Link>
  );
}
