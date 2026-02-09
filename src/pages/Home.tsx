import { motion } from 'framer-motion';
import { getPortfolioData } from '../utils/portfolioStore';
import { Hero } from '../components/Hero';
import { Skills } from '../components/Skills';
import { Projects } from '../components/Projects';
import { Experience } from '../components/Experience';
import { Contact } from '../components/Contact';

export function Home() {
  const data = getPortfolioData();

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Hero data={data} />
      <Skills data={data} />
      <Projects data={data} />
      <Experience data={data} />
      <Contact data={data} />
    </motion.main>
  );
}
