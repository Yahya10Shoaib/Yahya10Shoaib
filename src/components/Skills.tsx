import { motion } from 'framer-motion';
import type { PortfolioData } from '../types/portfolio';

const rowVariant = {
  hidden: { opacity: 0, x: -16 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const chipVariant = {
  hidden: { opacity: 0, scale: 0.88 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, delay: i * 0.035, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Skills({ data }: { data: PortfolioData }) {
  const entries = Object.entries(data.skills);

  return (
    <section className="section skills-section" id="skills">
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45 }}
      >
        <span className="section-label">Expertise</span>
        <h2 className="section-title">Technical Skills</h2>
        <p className="section-desc">
          Technologies and tools I use to build production-ready apps
        </p>
      </motion.div>

      <div className="skills-table">
        {entries.map(([category, skills], rowIndex) => (
          <motion.div
            key={category}
            className="skills-row"
            custom={rowIndex}
            variants={rowVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
          >
            <div className="skills-row-meta">
              <span className="skills-row-num">
                {String(rowIndex + 1).padStart(2, '0')}
              </span>
              <h3 className="skills-row-category">{category}</h3>
            </div>

            <div className="skill-chips">
              {skills.map((skill, chipIndex) => (
                <motion.span
                  key={skill}
                  className="skill-chip"
                  custom={chipIndex}
                  variants={chipVariant}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-30px' }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
