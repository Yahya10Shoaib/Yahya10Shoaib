import type { PortfolioData } from '../types/portfolio';
import portfolioJson from '../data/portfolio.json';

const STORAGE_KEY = 'portfolio-data';
const API_SECRET_KEY = 'portfolio-api-secret';

function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

/** Sync: returns localStorage data or static JSON (for initial paint). */
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

/** Async: fetch from API first; on success update localStorage and return. Else return sync fallback. */
export async function getPortfolioDataAsync(): Promise<PortfolioData> {
  try {
    const res = await fetch(`${getApiBase()}/api/portfolio`);
    if (res.ok) {
      const data = (await res.json()) as PortfolioData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch {
    // ignore
  }
  return getPortfolioData();
}

/** Save locally and, if API secret is set, POST to API so data is shared for all visitors. */
export async function setPortfolioData(data: PortfolioData): Promise<{ synced: boolean }> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
  const secret = typeof window !== 'undefined' ? localStorage.getItem(API_SECRET_KEY) : null;
  if (!secret) {
    return { synced: false };
  }
  try {
    const res = await fetch(`${getApiBase()}/api/portfolio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(data),
    });
    return { synced: res.ok };
  } catch {
    return { synced: false };
  }
}

export function getPortfolioApiSecret(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(API_SECRET_KEY);
}

export function setPortfolioApiSecret(secret: string): void {
  if (typeof window === 'undefined') return;
  if (secret.trim()) {
    localStorage.setItem(API_SECRET_KEY, secret.trim());
  } else {
    localStorage.removeItem(API_SECRET_KEY);
  }
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
