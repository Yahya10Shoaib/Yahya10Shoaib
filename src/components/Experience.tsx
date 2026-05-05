import { motion } from 'framer-motion';
import type { PortfolioData } from '../types/portfolio';
import type { ExperienceEntry } from '../types/portfolio';

function TimelineItem({ entry, index }: { entry: ExperienceEntry; index: number }) {
  return (
    <motion.div
      className="exp-item"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="exp-header">
        <div className="exp-header-left">
          <h3 className="exp-role">{entry.role}</h3>
          <p className="exp-company">{entry.company}</p>
        </div>
        <span className="exp-period">{entry.period}</span>
      </div>

      <ul className="exp-highlights">
        {entry.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
    </motion.div>
  );
}

export function Experience({ data }: { data: PortfolioData }) {
  return (
    <section className="section experience-section" id="experience">
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45 }}
      >
        <span className="section-label">Career</span>
        <h2 className="section-title">Experience</h2>
        <p className="section-desc">Where I've worked and what I've built</p>
      </motion.div>

      <div className="exp-list">
        {data.experience.map((entry, i) => (
          <TimelineItem key={entry.id} entry={entry} index={i} />
        ))}
      </div>
    </section>
  );
}
