import { useLayoutEffect, useRef, useState } from 'react';

function readTagWidths(measure: HTMLElement): number[] {
  return Array.from(measure.querySelectorAll<HTMLElement>('.tag-item')).map((el) => {
    const w = Math.max(el.offsetWidth, el.getBoundingClientRect().width);
    return Math.ceil(w);
  });
}

/** Reserve width for "+N" badge (worst case: only one tag visible). */
function estimateBadgeWidth(tagCount: number): number {
  if (tagCount <= 1) return 0;
  const label = `+${tagCount - 1}`;
  return Math.max(44, 14 + label.length * 8);
}

/**
 * Fits as many `.tag-item` chips as possible in `containerRef` on one row,
 * reserving space for a trailing `+N` badge when not all tags fit.
 * Uses `measureRef` (off-screen) so widths stay correct when chips use `display: none`.
 */
export function useFittingTags(tags: readonly string[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(() => tags.length);

  useLayoutEffect(() => {
    if (tags.length === 0) {
      setVisibleCount(0);
      return;
    }

    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    let raf = 0;
    let cancelled = false;

    const calculate = (attempt = 0): void => {
      if (cancelled) return;

      const widths = readTagWidths(measure);
      if (widths.length !== tags.length) return;

      const allZero = widths.every((w) => w <= 0);
      const containerWidth = Math.floor(
        container.clientWidth > 0 ? container.clientWidth : container.getBoundingClientRect().width,
      );

      if ((allZero || containerWidth <= 0) && attempt < 24) {
        raf = requestAnimationFrame(() => calculate(attempt + 1));
        return;
      }

      if (allZero || containerWidth <= 0) {
        setVisibleCount(1);
        return;
      }

      const cs = getComputedStyle(container);
      const rawGap = cs.columnGap || cs.gap || '4';
      const gapPx = Number.parseFloat(rawGap) || 4;
      const badgeWidth = estimateBadgeWidth(tags.length);

      let usedWidth = 0;
      let count = 0;

      for (let i = 0; i < widths.length; i++) {
        const tagWidth = widths[i] + (i > 0 ? gapPx : 0);
        const isLast = i === widths.length - 1;
        const reserve = isLast ? 0 : badgeWidth;

        if (usedWidth + tagWidth + reserve <= containerWidth + 0.5) {
          usedWidth += tagWidth;
          count++;
        } else {
          break;
        }
      }

      setVisibleCount(Math.max(0, Math.min(count, tags.length)));
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => calculate(0));
    };

    schedule();

    const ro = new ResizeObserver(() => schedule());
    ro.observe(container);
    ro.observe(measure);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [tags]);

  return { containerRef, measureRef, visibleCount };
}
