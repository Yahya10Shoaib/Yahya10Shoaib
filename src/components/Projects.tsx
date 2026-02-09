import { motion } from 'framer-motion';
import type { PortfolioData } from '../types/portfolio';
import type { Project } from '../types/portfolio';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

function ExternalLinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const hasLink = Boolean(project.link?.trim());
  const hasImage = Boolean(project.image?.trim());

  return (
    <motion.article
      className="project-card-flip"
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      custom={index}
    >
      <div className="project-card-inner">
        <div className="project-card-front">
          <h3 className="project-title">{project.title}</h3>
          <div className="project-card-front-body">
            <p className="project-desc">{project.description}</p>
            <p className="project-role">{project.role}</p>
            <div className="project-tech">
              {project.techStack.map((tech) => (
                <span key={tech} className="project-tech-tag">{tech}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="project-card-back">
          <div className="project-card-back-image">
            {hasImage ? (
              <img src={project.image} alt="" />
            ) : (
              <div className="project-card-back-placeholder" aria-hidden />
            )}
          </div>
          <div className="project-card-back-actions">
            {hasLink ? (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card-visit"
              >
                <span>Visit</span>
                <ExternalLinkIcon />
              </a>
            ) : (
              <span className="project-card-visit project-card-visit--disabled">
                <span>Visit</span>
                <ExternalLinkIcon />
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function Projects({ data }: { data: PortfolioData }) {
  return (
    <section className="section projects-section" id="projects">
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
      >
        Featured Projects
      </motion.h2>
      <div className="projects-grid">
        {data.projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
