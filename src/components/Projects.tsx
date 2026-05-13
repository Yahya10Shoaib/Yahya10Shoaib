import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PortfolioData } from '../types/portfolio';
import type { Project } from '../types/portfolio';
import { useFittingTags } from './useFittingTags';

const INITIAL_COUNT = 6;

function ArrowUpRight() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronUp() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function ProjectTechTags({ techStack }: { techStack: string[] }) {
  const tags = techStack;
  const { containerRef, measureRef, visibleCount } = useFittingTags(tags);
  const hidden = tags.length - visibleCount;

  if (tags.length === 0) return null;

  return (
    <div className="project-tech-wrap">
      <div ref={measureRef} className="project-tech project-tech-measure" aria-hidden>
        {tags.map((tech, i) => (
          <span key={`m-${i}-${tech}`} className="project-tech-tag tag-item">
            {tech}
          </span>
        ))}
      </div>
      <div ref={containerRef} className="project-tech">
        {tags.map((tech, i) => (
          <span
            key={`t-${i}-${tech}`}
            className="project-tech-tag tag-item"
            style={{ display: i < visibleCount ? undefined : 'none' }}
          >
            {tech}
          </span>
        ))}
        {hidden > 0 ? (
          <span className="project-tech-tag project-tech-more">+{hidden}</span>
        ) : null}
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const hasLink = Boolean(project.link?.trim());
  const num = String(index + 1).padStart(2, '0');

  return (
    <motion.article
      className="project-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ delay: (index % INITIAL_COUNT) * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      layout
    >
      {/* Header row: index + visit link */}
      <div className="project-card-header">
        <span className="project-index">{num}</span>
        {hasLink ? (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
          >
            Visit <ArrowUpRight />
          </a>
        ) : (
          <span className="project-no-link">
            <LockIcon /> Private
          </span>
        )}
      </div>

      {/* Name – the eye-catcher */}
      <h3 className="project-name">{project.title}</h3>

      {/* Description – clamped to 3 lines */}
      <p className="project-desc">{project.description}</p>

      {/* Tech stack — one row, +N when overflow */}
      <ProjectTechTags techStack={project.techStack} />

      {/* Role */}
      <p className="project-role">{project.role}</p>
    </motion.article>
  );
}

export function Projects({ data }: { data: PortfolioData }) {
  const [showAll, setShowAll] = useState(false);
  const hasMore = data.projects.length > INITIAL_COUNT;
  const visible = showAll ? data.projects : data.projects.slice(0, INITIAL_COUNT);
  const hiddenCount = data.projects.length - INITIAL_COUNT;

  return (
    <section className="section projects-section" id="projects">
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45 }}
      >
        <span className="section-label">Work</span>
        <h2 className="section-title">Featured Projects</h2>
        <p className="section-desc">
          A selection of production apps I've built and shipped
        </p>
      </motion.div>

      <motion.div className="projects-grid" layout>
        <AnimatePresence mode="popLayout">
          {visible.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      {hasMore && (
        <motion.div
          className="projects-more"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            type="button"
            className="projects-more-btn"
            onClick={() => setShowAll((s) => !s)}
          >
            {showAll ? (
              <>Show less <ChevronUp /></>
            ) : (
              <>See {hiddenCount} more project{hiddenCount !== 1 ? 's' : ''} <ChevronDown /></>
            )}
          </button>
        </motion.div>
      )}
    </section>
  );
}
