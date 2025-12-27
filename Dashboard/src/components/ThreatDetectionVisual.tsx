import { useEffect, useRef } from "react";
import eyeImage from "/eyeImage.png";

export default function PredictiveAnalysisVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = 600);
    const height = (canvas.height = 600);
    const centerX = width / 2;
    const centerY = height / 2;

    const numDots = 100;
    const baseRadius = 180;
    const spread = 90;

    const colors: string[] = [];
    for (let i = 0; i < numDots; i++) {
      if (i < numDots * 0.4) colors.push("#ffffff");
      else if (i < numDots * 0.7) colors.push("#00e0ff");
      else if (i < numDots * 0.9) colors.push("#aaaaaa");
      else colors.push("#7fff00");
    }

    const dots = Array.from({ length: numDots }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = baseRadius + (Math.random() - 0.5) * spread;
      const size = 2 + Math.random() * 3;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    ctx.clearRect(0, 0, width, height);

    const glowGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 300);
    glowGrad.addColorStop(0, "rgba(0,255,255,0.25)");
    glowGrad.addColorStop(0.6, "rgba(0,255,255,0.05)");
    glowGrad.addColorStop(1, "transparent");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 300, 0, Math.PI * 2);
    ctx.fill();

    const maxDist = 120;
    ctx.lineWidth = 0.4;
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    for (let i = 0; i < numDots; i++) {
      for (let j = i + 1; j < numDots; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const distSq = dx * dx + dy * dy;
        if (distSq < maxDist * maxDist && Math.random() > 0.45) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }
    }

    dots.forEach((dot) => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
      ctx.shadowBlur = 8;
      ctx.shadowColor = dot.color;
      ctx.fillStyle = dot.color;
      ctx.fill();
    });
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-[#020617] flex flex-col lg:flex-row items-center justify-between px-10 lg:px-20 py-24 overflow-hidden">
      {/* === LEFT CONTENT BOX === */}
      <div className="relative z-10 max-w-xl bg-[#0d162b]/60 border border-cyan-400/10 rounded-2xl p-10 backdrop-blur-xl shadow-[0_0_40px_rgba(0,255,255,0.08)]">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/10 to-transparent blur-md pointer-events-none"></div>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Predictive <br />
          <span className="text-cyan-400">Insights & LLM Reasoning</span>
        </h2>

        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
          Harness the analytical depth of Large Language Models to uncover trends,
          anticipate future outcomes, and provide intelligent, context-aware predictions.
          Our LLM-powered framework goes beyond statistics — it interprets data with
          real-world reasoning and foresight.
        </p>

        <div className="space-y-3 text-gray-300">
          <div className="flex items-center gap-3 bg-[#101a2e]/80 border border-cyan-400/10 px-4 py-3 rounded-lg backdrop-blur-md hover:bg-[#12233c]/90 transition-all">
            <span className="text-cyan-400 text-xl">🧩</span>
            <span className="font-medium">LLM-driven contextual prediction models</span>
          </div>
          <div className="flex items-center gap-3 bg-[#101a2e]/80 border border-cyan-400/10 px-4 py-3 rounded-lg backdrop-blur-md hover:bg-[#12233c]/90 transition-all">
            <span className="text-cyan-400 text-xl">🔍</span>
            <span className="font-medium">Deep data reasoning and pattern interpretation</span>
          </div>
          <div className="flex items-center gap-3 bg-[#101a2e]/80 border border-cyan-400/10 px-4 py-3 rounded-lg backdrop-blur-md hover:bg-[#12233c]/90 transition-all">
            <span className="text-cyan-400 text-xl">⚙️</span>
            <span className="font-medium">Adaptive large-scale inference pipeline</span>
          </div>
          <div className="flex items-center gap-3 bg-[#101a2e]/80 border border-cyan-400/10 px-4 py-3 rounded-lg backdrop-blur-md hover:bg-[#12233c]/90 transition-all">
            <span className="text-cyan-400 text-xl">📈</span>
            <span className="font-medium">Proactive decision support through LLM insights</span>
          </div>
        </div>
      </div>

      {/* === RIGHT VISUAL (EYE + NETWORK) === */}
      <div className="relative w-[600px] h-[600px] mt-20 lg:mt-0 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="absolute rounded-full z-0"
          style={{ filter: "drop-shadow(0 0 30px rgba(0, 255, 255, 0.15))" }}
        />

        <div className="absolute z-10 flex items-center justify-center">
          <img
            src={eyeImage}
            alt="Predictive LLM Eye"
            className="w-56 h-56 object-contain opacity-95 drop-shadow-[0_0_25px_rgba(0,255,255,0.6)]"
          />
        </div>

        <div className="absolute w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,rgba(0,255,255,0.15)_0%,rgba(0,0,0,0)_70%)] blur-3xl"></div>
      </div>
    </section>
  );
}
