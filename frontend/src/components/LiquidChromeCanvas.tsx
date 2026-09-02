import React, { useEffect, useRef } from 'react';

interface LiquidChromeCanvasProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'high';
}

export const LiquidChromeCanvas: React.FC<LiquidChromeCanvasProps> = ({
  className = '',
  intensity = 'medium',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic mouse / pointer ripple tracker
    let mouseX = width * 0.5;
    let mouseY = height * 0.4;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Stars & Specular Chrome Diamond Sparkles
    const starCount = intensity === 'subtle' ? 60 : intensity === 'medium' ? 110 : 160;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      baseAlpha: Math.random() * 0.5 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.006,
      isDiamondSparkle: Math.random() < 0.14,
      sparkleRay: Math.random() * 3.5 + 2,
      speedY: (Math.random() - 0.5) * 0.08,
      speedX: (Math.random() - 0.5) * 0.08,
    }));

    // Organic Liquid Mercury & Metallic Purple Blobs (Fluid Metablobs)
    const blobCount = intensity === 'subtle' ? 8 : intensity === 'medium' ? 15 : 22;
    const blobs = Array.from({ length: blobCount }, () => {
      const rand = Math.random();
      let type: 'vibrantPurple' | 'deepViolet' | 'liquidChrome' | 'moltenOrange';
      if (rand < 0.45) {
        type = 'vibrantPurple'; // #C77DFF / #9D4EDD
      } else if (rand < 0.75) {
        type = 'deepViolet'; // #7B2CBF / #5A189A
      } else if (rand < 0.92) {
        type = 'liquidChrome'; // #F8F9FA / #CBD5E1
      } else {
        type = 'moltenOrange'; // #FF7045 subtle fire rim
      }

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 220 + 130,
        baseRadius: Math.random() * 220 + 130,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        phase: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.015 + 0.008,
        type,
      };
    });

    // Liquid Waves Flow Paths
    const waveCount = 4;
    const waves = Array.from({ length: waveCount }, (_, i) => ({
      y: (height / (waveCount + 1)) * (i + 1),
      speed: (i % 2 === 0 ? 1 : -1) * (0.004 + i * 0.002),
      amplitude: 25 + i * 15,
      wavelength: 0.003 + i * 0.001,
      phase: i * Math.PI * 0.5,
    }));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      time += 0.009;
      // Smooth lerp mouse coordinates
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 1. Deep Obsidian Base with Metallic Purple Depth Gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        60,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      bgGrad.addColorStop(0, '#100B20');
      bgGrad.addColorStop(0.4, '#080512');
      bgGrad.addColorStop(1, '#040207');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Liquid Mercury Fluid Waves (Viscous Metallic Flows)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      waves.forEach((w, idx) => {
        ctx.beginPath();
        const yBase = w.y + Math.sin(time * 0.8 + w.phase) * 30;
        ctx.moveTo(0, yBase);

        for (let x = 0; x <= width; x += 20) {
          const waveY =
            yBase +
            Math.sin(x * w.wavelength + time * 1.5 + w.phase) * w.amplitude +
            Math.sin(x * 0.001 - time * 0.8) * 15;
          ctx.lineTo(x, waveY);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, yBase - 50, 0, yBase + 120);
        if (idx % 2 === 0) {
          waveGrad.addColorStop(0, 'rgba(199, 125, 255, 0.045)');
          waveGrad.addColorStop(0.5, 'rgba(157, 78, 221, 0.02)');
          waveGrad.addColorStop(1, 'rgba(5, 4, 9, 0)');
        } else {
          waveGrad.addColorStop(0, 'rgba(248, 249, 250, 0.035)');
          waveGrad.addColorStop(0.5, 'rgba(123, 44, 191, 0.015)');
          waveGrad.addColorStop(1, 'rgba(5, 4, 9, 0)');
        }

        ctx.fillStyle = waveGrad;
        ctx.fill();
      });

      // 3. Render Floating Liquid Chrome & Metallic Purple Blobs
      blobs.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        b.phase += b.wobbleSpeed;

        // Interactive subtle repulse near mouse
        const dx = b.x - mouseX;
        const dy = b.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 280) {
          const force = (280 - dist) / 280;
          b.x += (dx / dist) * force * 1.2;
          b.y += (dy / dist) * force * 1.2;
        }

        if (b.x < -b.radius) b.x = width + b.radius;
        if (b.x > width + b.radius) b.x = -b.radius;
        if (b.y < -b.radius) b.y = height + b.radius;
        if (b.y > height + b.radius) b.y = -b.radius;

        const currentRadius = b.baseRadius + Math.sin(b.phase) * 45;
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, currentRadius);

        if (b.type === 'vibrantPurple') {
          // Vibrant Metallic Purple (#C77DFF -> #9D4EDD)
          grad.addColorStop(0, 'rgba(199, 125, 255, 0.12)');
          grad.addColorStop(0.45, 'rgba(157, 78, 221, 0.06)');
          grad.addColorStop(1, 'rgba(5, 4, 9, 0)');
        } else if (b.type === 'deepViolet') {
          // Royal Deep Violet (#7B2CBF -> #5A189A)
          grad.addColorStop(0, 'rgba(123, 44, 191, 0.10)');
          grad.addColorStop(0.5, 'rgba(90, 24, 154, 0.04)');
          grad.addColorStop(1, 'rgba(5, 4, 9, 0)');
        } else if (b.type === 'moltenOrange') {
          // Molten Orange Internal Refraction (#FF7045)
          grad.addColorStop(0, 'rgba(255, 112, 69, 0.06)');
          grad.addColorStop(0.45, 'rgba(194, 65, 12, 0.02)');
          grad.addColorStop(1, 'rgba(5, 4, 9, 0)');
        } else {
          // Liquid Mercury Platinum Chrome (#F8F9FA -> #CBD5E1)
          grad.addColorStop(0, 'rgba(248, 249, 250, 0.08)');
          grad.addColorStop(0.5, 'rgba(203, 213, 225, 0.035)');
          grad.addColorStop(1, 'rgba(5, 4, 9, 0)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      // 4. Specular Diamond Sparkles & Liquid Glimmers
      stars.forEach((s) => {
        s.x += s.speedX;
        s.y += s.speedY;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        const currentAlpha = s.baseAlpha + Math.sin(time * 3 + s.x) * 0.25;
        const clampedAlpha = Math.max(0.1, Math.min(0.95, currentAlpha));

        ctx.fillStyle = `rgba(248, 249, 250, ${clampedAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // 4-point Specular Star Glints with Purple Tint
        if (s.isDiamondSparkle && clampedAlpha > 0.4) {
          ctx.save();
          ctx.strokeStyle = `rgba(199, 125, 255, ${clampedAlpha * 0.85})`;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          // Vertical Ray
          ctx.moveTo(s.x, s.y - s.sparkleRay);
          ctx.lineTo(s.x, s.y + s.sparkleRay);
          // Horizontal Ray
          ctx.moveTo(s.x - s.sparkleRay, s.y);
          ctx.lineTo(s.x + s.sparkleRay, s.y);
          ctx.stroke();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      id="liquid-chrome-canvas"
      aria-hidden="true"
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
    />
  );
};
