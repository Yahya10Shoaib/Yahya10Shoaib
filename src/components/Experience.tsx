import { motion } from 'framer-motion';
import type { PortfolioData } from '../types/portfolio';
import type { ExperienceEntry } from '../types/portfolio';

function TimelineItem({ entry, index }: { entry: ExperienceEntry; index: number }) {
  return (
    <motion.div
      className="timeline-item"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div className="timeline-dot" />
      <div className="timeline-content">
        <span className="timeline-period">{entry.period}</span>
        <h3 className="timeline-role">{entry.role} · {entry.company}</h3>
        <ul className="timeline-highlights">
          {entry.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export function Experience({ data }: { data: PortfolioData }) {
  return (
    <section className="section experience-section" id="experience">
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
      >
        Experience
      </motion.h2>
      <div className="timeline">
        {data.experience.map((entry, i) => (
          <TimelineItem key={entry.id} entry={entry} index={i} />
        ))}
      </div>
    </section>
  );
}
