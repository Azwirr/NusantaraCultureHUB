"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  colorType: "gold" | "secondary" | "primary";
}

interface BatikMotif {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSize: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  variant: "saga" | "indigo";
}

export function LiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = !document.hidden;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = motionQuery.matches;

    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function isDark(): boolean {
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr === "dark") return true;
      if (attr === "light") return false;
      return darkQuery.matches;
    }

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
    };

    let particles: Particle[] = [];
    let motifs: BatikMotif[] = [];

    function setupDimensions() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx?.scale(dpr, dpr);
    }

    function initElements() {
      // Scale element counts based on viewport area
      const area = width * height;
      const particleCount = Math.min(48, Math.max(18, Math.floor(area / 30000)));
      const motifCount = Math.min(7, Math.max(3, Math.floor(area / 180000)));

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -(0.18 + Math.random() * 0.35), // gentle upward float
          size: 1.2 + Math.random() * 2.2,
          baseAlpha: 0.2 + Math.random() * 0.45,
          pulseSpeed: 0.015 + Math.random() * 0.025,
          pulsePhase: Math.random() * Math.PI * 2,
          colorType: Math.random() > 0.45 ? "gold" : Math.random() > 0.5 ? "secondary" : "primary",
        });
      }

      motifs = [];
      for (let i = 0; i < motifCount; i++) {
        motifs.push({
          x: (width / (motifCount + 1)) * (i + 1) + (Math.random() - 0.5) * 120,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          baseSize: 32 + Math.random() * 28,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.0012,
          opacity: 0.07 + Math.random() * 0.07,
          variant: i % 2 === 0 ? "saga" : "indigo",
        });
      }
    }

    // Draw single 4-petal Kawung node matching project line-art geometry
    function drawKawungNode(
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      rotation: number,
      color: string,
      alpha: number
    ) {
      context.save();
      context.translate(cx, cy);
      context.rotate(rotation);
      context.strokeStyle = color;
      context.fillStyle = color;
      context.globalAlpha = alpha;
      context.lineWidth = 1.25;
      context.lineCap = "round";
      context.lineJoin = "round";

      const rx = size * 0.34;
      const ry = size * 0.55;
      const offset = size * 0.62;
      const angles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];

      angles.forEach((angle) => {
        context.save();
        context.rotate(angle);
        context.beginPath();
        context.ellipse(0, -offset, rx, ry, 0, 0, Math.PI * 2);
        context.stroke();
        context.restore();
      });

      // Center decorative ring & core dot
      context.beginPath();
      context.arc(0, 0, size * 0.18, 0, Math.PI * 2);
      context.stroke();

      context.beginPath();
      context.arc(0, 0, size * 0.07, 0, Math.PI * 2);
      context.fill();

      context.restore();
    }

    function renderFrame() {
      if (!ctx || width === 0 || height === 0) return;

      const dark = isDark();

      // Theme-specific palettes derived from Nusantara design tokens
      // Light: #F7F1E3 (paper), #8A5A2B (saga brown), #1F3A5F (indigo), #C9A227 (accent gold)
      // Dark:  #18191C (night), #E3B48A (saga glow), #AEC8F4 (light indigo), #C9A227 (gold)
      const colors = dark
        ? {
            gold: "rgba(201, 162, 39, ",
            goldGlow: "rgba(255, 224, 142, ",
            secondary: "rgba(227, 180, 138, ",
            primary: "rgba(174, 200, 244, ",
            sagaMotif: "#e3b48a",
            indigoMotif: "#aec8f4",
          }
        : {
            gold: "rgba(201, 162, 39, ",
            goldGlow: "rgba(217, 180, 68, ",
            secondary: "rgba(138, 90, 43, ",
            primary: "rgba(31, 58, 95, ",
            sagaMotif: "#8a5a2b",
            indigoMotif: "#1f3a5f",
          };

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse coordinate interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // 1. Draw drifting Batik Kawung motifs
      for (let i = 0; i < motifs.length; i++) {
        const motif = motifs[i];

        if (!prefersReducedMotion) {
          motif.x += motif.vx;
          motif.y += motif.vy;
          motif.rotation += motif.rotSpeed;

          // Gentle mouse tilt & subtle parallax push
          if (mouse.active) {
            const dx = motif.x - mouse.x;
            const dy = motif.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 260 && dist > 1) {
              const force = (1 - dist / 260) * 0.35;
              motif.x += (dx / dist) * force;
              motif.y += (dy / dist) * force;
              motif.rotation += (dx / dist) * 0.0006;
            }
          }

          // Screen wrap-around
          if (motif.x < -motif.baseSize * 2) motif.x = width + motif.baseSize * 2;
          if (motif.x > width + motif.baseSize * 2) motif.x = -motif.baseSize * 2;
          if (motif.y < -motif.baseSize * 2) motif.y = height + motif.baseSize * 2;
          if (motif.y > height + motif.baseSize * 2) motif.y = -motif.baseSize * 2;
        }

        const motifColor = motif.variant === "saga" ? colors.sagaMotif : colors.indigoMotif;
        drawKawungNode(
          ctx,
          motif.x,
          motif.y,
          motif.baseSize,
          motif.rotation,
          motifColor,
          motif.opacity * (dark ? 1.15 : 0.95)
        );
      }

      // 2. Draw soft ambient golden & saga embers (heritage dust / kunang-kunang)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx + Math.sin(p.pulsePhase) * 0.15;
          p.y += p.vy;
          p.pulsePhase += p.pulseSpeed;

          // Mouse gentle repulsion
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 130 && dist > 1) {
              const repel = (1 - dist / 130) * 0.8;
              p.x += (dx / dist) * repel;
              p.y += (dy / dist) * repel;
            }
          }

          // Recycle particles to bottom when they float above top
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        const alphaPulse = p.baseAlpha * (0.65 + 0.35 * Math.sin(p.pulsePhase));
        const finalAlpha = Math.max(0.05, Math.min(alphaPulse, 0.75));

        ctx.save();
        ctx.globalAlpha = finalAlpha;

        if (dark && p.colorType === "gold") {
          // Luminous golden firefly with soft radial halo
          const glowRadius = p.size * 3.2;
          const grad = ctx.createRadialGradient(p.x, p.y, p.size * 0.2, p.x, p.y, glowRadius);
          grad.addColorStop(0, `${colors.goldGlow}0.9)`);
          grad.addColorStop(0.35, `${colors.gold}0.4)`);
          grad.addColorStop(1, `${colors.gold}0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#fff8dc";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.75, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Clean archival paper dust particle
          const prefix =
            p.colorType === "gold"
              ? colors.gold
              : p.colorType === "secondary"
              ? colors.secondary
              : colors.primary;

          ctx.fillStyle = `${prefix}${finalAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    function loop() {
      if (isVisible) {
        renderFrame();
      }
      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(loop);
      }
    }

    function onResize() {
      setupDimensions();
      initElements();
      renderFrame();
    }

    function onMouseMove(e: MouseEvent) {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    }

    function onMouseLeave() {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    }

    function onVisibilityChange() {
      isVisible = !document.hidden;
      if (isVisible && !prefersReducedMotion) {
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(loop);
      }
    }

    function onMotionChange(e: MediaQueryListEvent) {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        cancelAnimationFrame(animId);
        renderFrame();
      } else {
        loop();
      }
    }

    // Observe data-theme changes from ThemeToggle
    const themeObserver = new MutationObserver(() => {
      renderFrame();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    darkQuery.addEventListener("change", renderFrame);
    motionQuery.addEventListener("change", onMotionChange);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    setupDimensions();
    initElements();

    if (prefersReducedMotion) {
      renderFrame();
    } else {
      animId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animId);
      themeObserver.disconnect();
      darkQuery.removeEventListener("change", renderFrame);
      motionQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="live-bg-canvas"
      aria-hidden="true"
      role="presentation"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
