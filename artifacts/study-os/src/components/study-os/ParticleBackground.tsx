'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  type: 'atom' | 'electron' | 'molecule' | 'photon';
  pulsePhase: number;
  orbitSpeed: number;
  orbitRadius: number;
  trail: { x: number; y: number; alpha: number }[];
}

interface Bond {
  from: number;
  to: number;
  strength: number;
}

const COLORS = {
  cyan: { r: 0, g: 220, b: 190 },
  purple: { r: 168, g: 85, b: 247 },
  blue: { r: 59, g: 130, b: 246 },
  green: { r: 34, g: 197, b: 94 },
  orange: { r: 251, g: 146, b: 60 },
  pink: { r: 236, g: 72, b: 153 },
};

const colorToRgba = (color: { r: number; g: number; b: number }, alpha: number) => 
  `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const bondsRef = useRef<Bond[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const timeRef = useRef(0);

  const initParticles = useCallback((width: number, height: number) => {
    const particleCount = Math.min(Math.floor((width * height) / 15000), 100);
    particlesRef.current = [];

    const colorKeys = Object.keys(COLORS) as (keyof typeof COLORS)[];

    for (let i = 0; i < particleCount; i++) {
      const rand = Math.random();
      const type = rand < 0.15 ? 'molecule' : rand < 0.35 ? 'atom' : rand < 0.7 ? 'electron' : 'photon';
      const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: type === 'molecule' ? 5 + Math.random() * 4 : 
                type === 'atom' ? 3 + Math.random() * 2 : 
                type === 'photon' ? 1 + Math.random() : 
                1.5 + Math.random(),
        color: colorKey,
        alpha: 0.4 + Math.random() * 0.4,
        type,
        pulsePhase: Math.random() * Math.PI * 2,
        orbitSpeed: 0.5 + Math.random() * 2,
        orbitRadius: 15 + Math.random() * 20,
        trail: [],
      });
    }
  }, []);

  const updateBonds = useCallback(() => {
    bondsRef.current = [];
    const particles = particlesRef.current;
    const bondDistance = 120;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < bondDistance) {
          bondsRef.current.push({
            from: i,
            to: j,
            strength: 1 - distance / bondDistance,
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    const drawPhoton = (ctx: CanvasRenderingContext2D, p: Particle, time: number) => {
      const color = COLORS[p.color as keyof typeof COLORS];
      const pulse = Math.sin(time * 0.003 + p.pulsePhase) * 0.3 + 0.7;
      
      // Trail effect for photons
      p.trail.forEach((t, i) => {
        const trailAlpha = t.alpha * (1 - i / p.trail.length) * 0.5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, p.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = colorToRgba(color, trailAlpha);
        ctx.fill();
      });

      // Glowing core
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
      gradient.addColorStop(0, colorToRgba(color, p.alpha * pulse));
      gradient.addColorStop(0.3, colorToRgba(color, p.alpha * pulse * 0.5));
      gradient.addColorStop(1, colorToRgba(color, 0));
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = colorToRgba({ r: 255, g: 255, b: 255 }, p.alpha);
      ctx.fill();
    };

    const drawMolecule = (ctx: CanvasRenderingContext2D, p: Particle, time: number) => {
      const color = COLORS[p.color as keyof typeof COLORS];
      const pulse = Math.sin(time * 0.002 + p.pulsePhase) * 0.15 + 1;

      // Outer glow
      const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 5);
      glowGradient.addColorStop(0, colorToRgba(color, p.alpha * 0.3));
      glowGradient.addColorStop(0.5, colorToRgba(color, p.alpha * 0.1));
      glowGradient.addColorStop(1, colorToRgba(color, 0));
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 5, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Central nucleus
      const nucleusGradient = ctx.createRadialGradient(
        p.x - p.radius * 0.3, p.y - p.radius * 0.3, 0,
        p.x, p.y, p.radius * pulse
      );
      nucleusGradient.addColorStop(0, colorToRgba({ r: 255, g: 255, b: 255 }, p.alpha * 0.8));
      nucleusGradient.addColorStop(0.4, colorToRgba(color, p.alpha));
      nucleusGradient.addColorStop(1, colorToRgba(color, p.alpha * 0.6));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = nucleusGradient;
      ctx.fill();

      // Orbiting electrons
      const electronCount = 3;
      for (let i = 0; i < electronCount; i++) {
        const angle = (time * 0.001 * p.orbitSpeed) + (i * Math.PI * 2 / electronCount);
        const orbitX = p.x + Math.cos(angle) * p.orbitRadius;
        const orbitY = p.y + Math.sin(angle) * p.orbitRadius * 0.6;

        // Electron trail
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, 2, 0, Math.PI * 2);
        ctx.fillStyle = colorToRgba(color, p.alpha * 0.9);
        ctx.fill();

        // Electron glow
        const electronGlow = ctx.createRadialGradient(orbitX, orbitY, 0, orbitX, orbitY, 6);
        electronGlow.addColorStop(0, colorToRgba(color, 0.4));
        electronGlow.addColorStop(1, colorToRgba(color, 0));
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, 6, 0, Math.PI * 2);
        ctx.fillStyle = electronGlow;
        ctx.fill();
      }
    };

    const drawAtom = (ctx: CanvasRenderingContext2D, p: Particle, time: number) => {
      const color = COLORS[p.color as keyof typeof COLORS];
      const pulse = Math.sin(time * 0.003 + p.pulsePhase) * 0.2 + 1;

      // Soft glow
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
      gradient.addColorStop(0, colorToRgba(color, p.alpha * 0.8));
      gradient.addColorStop(0.5, colorToRgba(color, p.alpha * 0.3));
      gradient.addColorStop(1, colorToRgba(color, 0));
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = colorToRgba(color, p.alpha);
      ctx.fill();
    };

    const drawElectron = (ctx: CanvasRenderingContext2D, p: Particle, time: number) => {
      const color = COLORS[p.color as keyof typeof COLORS];
      const pulse = Math.sin(time * 0.004 + p.pulsePhase) * 0.3 + 1;

      // Trail
      p.trail.slice(-8).forEach((t, i) => {
        const trailAlpha = t.alpha * (i / 8) * 0.4;
        ctx.beginPath();
        ctx.arc(t.x, t.y, p.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = colorToRgba(color, trailAlpha);
        ctx.fill();
      });

      // Glow
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.5);
      gradient.addColorStop(0, colorToRgba(color, p.alpha * 0.7));
      gradient.addColorStop(1, colorToRgba(color, 0));
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = colorToRgba({ r: 255, g: 255, b: 255 }, p.alpha * 0.8);
      ctx.fill();
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      timeRef.current += 16;

      // Fade effect
      ctx.fillStyle = 'rgba(6, 8, 18, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Draw bonds with gradient
      bondsRef.current.forEach((bond) => {
        const p1 = particles[bond.from];
        const p2 = particles[bond.to];
        const color1 = COLORS[p1.color as keyof typeof COLORS];
        const color2 = COLORS[p2.color as keyof typeof COLORS];

        const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        gradient.addColorStop(0, colorToRgba(color1, bond.strength * 0.2));
        gradient.addColorStop(1, colorToRgba(color2, bond.strength * 0.2));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = bond.strength * 2;
        ctx.stroke();
      });

      // Update and draw particles
      particles.forEach((p) => {
        // Store trail position
        if (p.type === 'electron' || p.type === 'photon') {
          p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
          if (p.trail.length > 12) p.trail.shift();
        }

        // Mouse interaction
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 250) {
            const force = (250 - distance) / 250;
            const angle = Math.atan2(dy, dx);
            // Gentle attraction/repulsion based on particle type
            const direction = p.type === 'molecule' ? 0.015 : -0.02;
            p.vx += Math.cos(angle) * force * direction;
            p.vy += Math.sin(angle) * force * direction;
          }
        }

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Apply friction
        p.vx *= 0.995;
        p.vy *= 0.995;

        // Boundary check with smooth wrap
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        // Draw based on type
        switch (p.type) {
          case 'molecule':
            drawMolecule(ctx, p, timeRef.current);
            break;
          case 'atom':
            drawAtom(ctx, p, timeRef.current);
            break;
          case 'photon':
            drawPhoton(ctx, p, timeRef.current);
            break;
          default:
            drawElectron(ctx, p, timeRef.current);
        }
      });

      // Update bonds periodically
      if (timeRef.current % 100 < 20) {
        updateBonds();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { ...mouseRef.current, active: false };
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initParticles, updateBonds]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}
