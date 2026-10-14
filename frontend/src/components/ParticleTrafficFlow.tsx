import React, { useEffect, useRef } from 'react';

interface ParticleTrafficFlowProps {
  modelName: string;
  strategy: string;
  versionA: string;
  weightA: number;
  versionB: string;
  weightB: number;
  height?: number;
}

interface Particle {
  progress: number;
  speed: number;
  target: 'A' | 'B';
  color: string;
  size: number;
}

export const ParticleTrafficFlow: React.FC<ParticleTrafficFlowProps> = ({
  modelName,
  strategy,
  versionA,
  weightA,
  versionB,
  weightB,
  height = 240
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];

    // Responsive width
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = height;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle generator
    const spawnParticle = () => {
      if (particles.length > 55) return;
      const target: 'A' | 'B' = Math.random() * 100 < weightA ? 'A' : 'B';
      particles.push({
        progress: 0,
        speed: 0.007 + Math.random() * 0.006,
        target,
        color: target === 'A' ? '#ccff00' : '#38bdf8',
        size: Math.random() * 2.5 + 2
      });
    };

    let tick = 0;

    const render = () => {
      tick++;
      if (tick % 3 === 0) spawnParticle();

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Node coordinates
      const startX = 70;
      const startY = h / 2;

      const routerX = w * 0.42;
      const routerY = h / 2;

      const endAX = w - 85;
      const endAY = h * 0.28;

      const endBX = w - 85;
      const endBY = h * 0.72;

      // Draw background flow curves
      // 1. Ingress to Router
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(routerX, routerY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 2. Router to Version A (Bézier curve)
      ctx.beginPath();
      ctx.moveTo(routerX, routerY);
      ctx.bezierCurveTo(routerX + (endAX - routerX) * 0.5, routerY, routerX + (endAX - routerX) * 0.5, endAY, endAX, endAY);
      ctx.strokeStyle = weightA > 0 ? 'rgba(204, 255, 0, 0.22)' : 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = Math.max(1, (weightA / 100) * 4);
      ctx.stroke();

      // 3. Router to Version B (Bézier curve)
      ctx.beginPath();
      ctx.moveTo(routerX, routerY);
      ctx.bezierCurveTo(routerX + (endBX - routerX) * 0.5, routerY, routerX + (endBX - routerX) * 0.5, endBY, endBX, endBY);
      ctx.strokeStyle = weightB > 0 ? 'rgba(56, 189, 248, 0.22)' : 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = Math.max(1, (weightB / 100) * 4);
      ctx.stroke();

      // Update & Draw flowing particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += p.speed;

        let px = startX;
        let py = startY;

        if (p.progress <= 0.4) {
          // Ingress segment
          const t = p.progress / 0.4;
          px = startX + (routerX - startX) * t;
          py = startY;
        } else {
          // Curved branch segment
          const t = (p.progress - 0.4) / 0.6;
          const endY = p.target === 'A' ? endAY : endBY;
          const cp1x = routerX + (endAX - routerX) * 0.5;
          const cp1y = routerY;
          const cp2x = routerX + (endAX - routerX) * 0.5;
          const cp2y = endY;

          // Cubic Bézier calculation
          const mt = 1 - t;
          px = mt * mt * mt * routerX + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * endAX;
          py = mt * mt * mt * routerY + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * endY;
        }

        // Draw glowing particle
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.progress >= 1) {
          particles.splice(i, 1);
        }
      }

      // Draw Mission Control Node Badges
      // 1. Ingress Node
      drawNode(ctx, startX, startY, 'INGRESS', 'POST /predict', '#94a3b8');

      // 2. Router Node
      drawNode(ctx, routerX, routerY, strategy, `${weightA}% / ${weightB}%`, '#f8fafc');

      // 3. Version A Node
      drawNode(ctx, endAX, endAY, versionA, `${weightA}% Traffic`, '#ccff00');

      // 4. Version B Node
      drawNode(ctx, endBX, endBY, versionB, `${weightB}% Traffic`, '#38bdf8');

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [modelName, strategy, versionA, weightA, versionB, weightB, height]);

  const drawNode = (ctx: CanvasRenderingContext2D, x: number, y: number, title: string, subtitle: string, accent: string) => {
    const boxW = 105;
    const boxH = 42;
    const rx = x - boxW / 2;
    const ry = y - boxH / 2;

    // Card background
    ctx.fillStyle = 'rgba(14, 17, 23, 0.9)';
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(rx, ry, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    // Pulse dot
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(rx + 10, ry + 15, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Text Title
    ctx.font = '600 11px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, rx + 20, ry + 18);

    // Text Subtitle (Mono)
    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(subtitle, rx + 10, ry + 33);
  };

  return (
    <div style={{ width: '100%', position: 'relative', overflow: 'hidden', borderRadius: 8, background: 'rgba(5, 7, 10, 0.6)', border: '1px solid var(--border-subtle)' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />
    </div>
  );
};
