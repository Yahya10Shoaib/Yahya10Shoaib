import type { PortfolioData } from '../types/portfolio';
import portfolioJson from '../data/portfolio.json';

const STORAGE_KEY = 'portfolio-data';

export function getPortfolioData(): PortfolioData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as PortfolioData;
    }
  } catch {
    // ignore
  }
  return portfolioJson as PortfolioData;
}

export function setPortfolioData(data: PortfolioData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
}

export function exportPortfolioJson(data: PortfolioData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'portfolio.json';
  a.click();
  URL.revokeObjectURL(url);
}
