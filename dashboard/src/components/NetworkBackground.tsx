// src/components/NetworkBackground.tsx
import { useEffect, useRef } from "react";

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // fewer dots, smarter connections = no lag
    const numDots = 70;
    const maxDistance = 130;
    const dots: { x: number; y: number; vx: number; vy: number }[] = [];

    const colors = ["#00f5d4", "#00bbf9", "#9b5de5", "#00f0ff"];

    for (let i = 0; i < numDots; i++) {
      const speed = 0.6 + Math.random() * 1.2;
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
      });
    }

    let lastFrame = 0;
    function animate(time: number) {
      if (!ctx) return;
      const delta = time - lastFrame;
      if (delta < 16) {
        requestAnimationFrame(animate);
        return;
      }
      lastFrame = time;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(2, 6, 23, 0.9)";
      ctx.fillRect(0, 0, width, height);

      // Draw dots
      for (let i = 0; i < numDots; i++) {
        const dot = dots[i];
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;

        const color = colors[i % colors.length];
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.arc(dot.x, dot.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Optimized connections — only nearby dots checked
      for (let i = 0; i < numDots; i++) {
        const dotA = dots[i];
        for (let j = i + 1; j < numDots; j++) {
          const dotB = dots[j];
          const dx = dotA.x - dotB.x;
          const dy = dotA.y - dotB.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistance * maxDistance) {
            const alpha = 1 - Math.sqrt(distSq) / maxDistance;
            ctx.strokeStyle = `rgba(0, 255, 255, ${(alpha * 0.3).toString()})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(dotA.x, dotA.y);
            ctx.lineTo(dotB.x, dotB.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0"
      style={{
        background:
          "radial-gradient(circle at center, #0b132b 0%, #020617 100%)",
      }}
    />
  );
}
