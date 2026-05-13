import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import type { PortfolioData } from '../types/portfolio';
import type { Project } from '../types/portfolio';
import { useFittingTags } from './useFittingTags';

const INITIAL_COUNT = 6;

const layoutMorph = {
  type: 'tween' as const,
  duration: 0.52,
  ease: [0.22, 0.94, 0.36, 1] as [number, number, number, number],
};
const flipEase = [0.32, 0.72, 0, 1] as [number, number, number, number];
const flipDuration = { enter: 0.5, exit: 0.38 } as const;

function getProjectVisitUrl(project: Project): string | undefined {
  const url = project.playStoreLink?.trim() || project.link?.trim();
  return url || undefined;
}

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

function ProjectTechTagsFull({ techStack }: { techStack: string[] }) {
  if (techStack.length === 0) return null;
  return (
    <div className="project-tech project-tech--modal">
      {techStack.map((tech, i) => (
        <span key={`${i}-${tech}`} className="project-tech-tag">
          {tech}
        </span>
      ))}
    </div>
  );
}

function ProjectDetailModal({ project, layoutId, onClose }: { project: Project; layoutId: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const visitUrl = getProjectVisitUrl(project);
  const titleId = `project-modal-title-${project.id}`;

  useLayoutEffect(() => {
    closeRef.current?.focus();
  }, [project.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      className="project-modal-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
    >
      <div className="project-modal-perspective" onClick={(e) => e.stopPropagation()}>
        <motion.div
          layoutId={layoutId}
          className="project-modal-panel project-modal-panel--from-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          transition={{ layout: layoutMorph }}
          style={{ borderRadius: 'var(--r)' }}
        >
          <motion.div
            className="project-modal-panel-inner"
            initial={{ rotateY: 18, opacity: 0.99 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{
              rotateY: -14,
              opacity: 0.97,
              transition: { duration: flipDuration.exit, ease: flipEase },
            }}
            transition={{ duration: flipDuration.enter, ease: flipEase }}
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'center center',
            }}
          >
            <button
              ref={closeRef}
              type="button"
              className="project-modal-close"
              onClick={onClose}
              aria-label="Close project details"
            >
              ×
            </button>

            {project.image?.trim() ? (
              <div className="project-modal-image-wrap">
                <img
                  className="project-modal-image"
                  src={project.image.trim()}
                  alt={`${project.title} preview`}
                  loading="eager"
                  decoding="async"
                />
              </div>
            ) : null}

            <div
              className={`project-modal-body${project.image?.trim() ? '' : ' project-modal-body--with-close-offset'}`}
            >
              <h2 id={titleId} className="project-modal-title">
                {project.title}
              </h2>
              <p className="project-modal-desc">{project.description}</p>
              <ProjectTechTagsFull techStack={project.techStack} />
              <p className="project-modal-role">{project.role}</p>

              {visitUrl ? (
                <a
                  className="project-modal-visit"
                  href={visitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit <ArrowUpRight />
                </a>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function projectLayoutId(id: string) {
  return `project-surface-${id}`;
}

function ProjectCard({
  project,
  index,
  onOpen,
  isSourceForOpenModal,
}: {
  project: Project;
  index: number;
  onOpen: (p: Project) => void;
  isSourceForOpenModal: boolean;
}) {
  const visitUrl = getProjectVisitUrl(project);
  const hasLink = Boolean(visitUrl);
  const num = String(index + 1).padStart(2, '0');

  const openClick = (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    onOpen(project);
  };

  const openKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.key === ' ') e.preventDefault();
    if ((e.target as HTMLElement).closest('a, button')) return;
    onOpen(project);
  };

  return (
    <motion.article
      layoutId={projectLayoutId(project.id)}
      className="project-card project-card--clickable"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isSourceForOpenModal ? 0 : 1,
        y: 0,
        pointerEvents: isSourceForOpenModal ? 'none' : 'auto',
      }}
      exit={{ opacity: 0, y: 10 }}
      transition={{
        opacity: { duration: 0.18 },
        layout: layoutMorph,
        y: { delay: (index % INITIAL_COUNT) * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      }}
      style={{ borderRadius: 'var(--r)' }}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`Open details for ${project.title}`}
      onClick={openClick}
      onKeyDown={openKeyDown}
    >
      <div className="project-card-header">
        <span className="project-index">{num}</span>
        {hasLink ? (
          <a
            href={visitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
            onClick={(e) => e.stopPropagation()}
          >
            Visit <ArrowUpRight />
          </a>
        ) : (
          <span className="project-no-link">
            <LockIcon /> Private
          </span>
        )}
      </div>

      <h3 className="project-name">{project.title}</h3>

      <p className="project-desc">{project.description}</p>

      <ProjectTechTags techStack={project.techStack} />

      <p className="project-role">{project.role}</p>
    </motion.article>
  );
}

export function Projects({ data }: { data: PortfolioData }) {
  const [showAll, setShowAll] = useState(false);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const hasMore = data.projects.length > INITIAL_COUNT;
  const visible = showAll ? data.projects : data.projects.slice(0, INITIAL_COUNT);
  const hiddenCount = data.projects.length - INITIAL_COUNT;

  return (
    <LayoutGroup>
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
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onOpen={setModalProject}
                isSourceForOpenModal={modalProject?.id === project.id}
              />
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

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {modalProject ? (
                <ProjectDetailModal
                  key={modalProject.id}
                  project={modalProject}
                  layoutId={projectLayoutId(modalProject.id)}
                  onClose={() => setModalProject(null)}
                />
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </LayoutGroup>
  );
}
