import { useEffect, useRef, useCallback } from 'react';

const NEON_CYAN = 'rgba(0, 255, 247, 0.9)';
const NEON_PURPLE = 'rgba(178, 75, 243, 0.6)';
const PARTICLE_COUNT = 80;
const CONNECT_DISTANCE = 140;
const MOUSE_RADIUS = 120;
const MOUSE_STRENGTH = 0.08;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  size: number;
  pulsePhase: number;
}

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const animationRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        size: 1.5 + Math.random() * 1.5,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement?.getBoundingClientRect();
      const w = rect?.width ?? window.innerWidth;
      const h = rect?.height ?? window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      sizeRef.current = { w, h };
      particlesRef.current = initParticles(w, h);
    };

    setSize();
    window.addEventListener('resize', setSize);

    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(canvas.parentElement ?? document.body);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      mouseRef.current = inside ? { x, y } : { x: -999, y: -999 };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -999, y: -999 };
    };

    canvas.parentElement?.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement?.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;
    const loop = () => {
      const { w, h } = sizeRef.current;
      if (w <= 0 || h <= 0) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      time += 0.016;

      particles.forEach((p) => {
        let fx = 0;
        let fy = 0;

        const dx = p.baseX - p.x;
        const dy = p.baseY - p.y;
        fx += dx * 0.02;
        fy += dy * 0.02;

        if (mx > 0 && my > 0) {
          const mdx = p.x - mx;
          const mdy = p.y - my;
          const dist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
            fx += (mdx / dist) * force * 300;
            fy += (mdy / dist) * force * 300;
          }
        }

        p.vx = p.vx * 0.85 + fx;
        p.vy = p.vy * 0.85 + fy;
        p.x += p.vx;
        p.y += p.vy;
      });

      particles.forEach((p, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECT_DISTANCE) {
            const opacity = (1 - dist / CONNECT_DISTANCE) * 0.6;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 255, 247, ${opacity * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      });

      particles.forEach((p) => {
        const pulse = 0.7 + 0.3 * Math.sin(time * 2 + p.pulsePhase);
        const size = p.size * pulse;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 4);
        gradient.addColorStop(0, NEON_CYAN);
        gradient.addColorStop(0.4, NEON_PURPLE);
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = NEON_CYAN;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(loop);
    };

    loop();

    const parent = canvas.parentElement;

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', setSize);
      parent?.removeEventListener('mousemove', handleMouseMove);
      parent?.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initParticles]);

  return <canvas ref={canvasRef} className="hero-background" aria-hidden />;
}
