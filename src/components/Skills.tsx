import { motion } from 'framer-motion';
import type { PortfolioData } from '../types/portfolio';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function Skills({ data }: { data: PortfolioData }) {
  const entries = Object.entries(data.skills);

  return (
    <section className="section skills-section" id="skills">
      <motion.div
        className="skills-header"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="skills-title">
          <span className="skills-title-main">Technical</span>{' '}
          <span className="skills-title-accent">Skills</span>
        </h2>
        <p className="skills-subtitle">Technologies and tools I use to bring ideas to life</p>
      </motion.div>
      <motion.div
        className="skills-grid"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        {entries.map(([category, skills]) => (
          <motion.div key={category} className="skill-category" variants={item}>
            <h3 className="skill-category-title">{category}</h3>
            <div className="skill-chips">
              {skills.map((skill) => (
                <motion.span
                  key={skill}
                  className="skill-chip"
                  variants={item}
                  whileHover={{ scale: 1.03, boxShadow: '0 0 16px rgba(0, 255, 247, 0.35)' }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
