import { motion } from 'framer-motion';
import type { PortfolioData } from '../types/portfolio';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero({ data }: { data: PortfolioData }) {
  const expLabel = data.experienceYears.split(' ')[0];
  const projectCount = data.projects.length;
  const companyCount = data.experience.length;

  return (
    <section className="hero" id="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <motion.span className="hero-badge" {...fadeUp(0.1)}>
            Available for opportunities
          </motion.span>

          <motion.h1 className="hero-name" {...fadeUp(0.2)}>
            {data.name}
          </motion.h1>

          <motion.p className="hero-title" {...fadeUp(0.3)}>
            {data.title}
          </motion.p>

          <motion.p className="hero-intro" {...fadeUp(0.4)}>
            {data.intro}
          </motion.p>

          <motion.div className="hero-actions" {...fadeUp(0.5)}>
            <a href="#contact" className="btn-primary">
              Get in touch
            </a>
            <a href="/Resume_Yahya_Shoaib.pdf" download className="btn-secondary">
              Resume ↗
            </a>
          </motion.div>
        </div>

        <motion.div
          className="hero-aside"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.6 }}
        >
          <div className="hero-stat">
            <span className="stat-num">{expLabel}</span>
            <span className="stat-label">Years experience</span>
          </div>
          <div className="hero-stat">
            <span className="stat-num">{projectCount}</span>
            <span className="stat-label">Apps shipped</span>
          </div>
          <div className="hero-stat">
            <span className="stat-num">{companyCount}</span>
            <span className="stat-label">Companies</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
