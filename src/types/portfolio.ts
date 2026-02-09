export interface PortfolioData {
  name: string;
  title: string;
  experienceYears: string;
  intro: string;
  skills: Record<string, string[]>;
  projects: Project[];
  experience: ExperienceEntry[];
  contact: Contact;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  role: string;
  /** Optional image URL shown on card flip */
  image?: string;
  /** Optional project/live link; VISIT button and link icon use this */
  link?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  period: string;
  highlights: string[];
}

export interface Contact {
  email: string;
  github: string;
  linkedin: string;
}
