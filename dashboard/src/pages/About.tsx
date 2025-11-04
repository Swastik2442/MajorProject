import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Brain, Wifi, Gauge, Building } from "lucide-react";
import Metadata from "@/components/Metadata";
import ThreatDetectionVisual from "@/components/ThreatDetectionVisual";

export default function About() {
  const bgRef = useRef<HTMLDivElement | null>(null);

  // Parallax background scroll
  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (!bgRef.current) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!bgRef.current) return;
          const offset = window.scrollY * 0.08;
          bgRef.current.style.setProperty("--bg-translate-y", `${offset}px`);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {window.removeEventListener("scroll", onScroll)};
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#050b16] text-white overflow-x-hidden">
      <Metadata />

      {/* === Floating Back Button (Top Right) === */}
      <Link
        to="/"
        className="fixed top-6 right-8 z-50 px-6 py-2 rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white font-semibold text-sm md:text-base shadow-lg hover:opacity-90 transition-all border border-white/10"
      >
        ⬅ Back to Home
      </Link>

      {/* === Background Layer === */}
      <div
        ref={bgRef}
        style={{ transform: "translateY(var(--bg-translate-y, 0))" }}
        className="pointer-events-none fixed inset-0 -z-20 will-change-transform"
      >
        <div className="absolute left-1/2 top-32 -translate-x-1/2 w-[1300px] h-[1300px] bg-[radial-gradient(circle,rgba(0,255,153,0.12),transparent_70%)] blur-3xl opacity-90" />
        <svg
          className="absolute inset-0 w-full h-full opacity-70"
          viewBox="0 0 1600 1200"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="pulseBg" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#00f5d4" />
              <stop offset="100%" stopColor="#00bbf9" />
            </linearGradient>
            <filter id="glowBg" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[300, 360, 420, 480, 540].map((y, i) => (
            <path
              key={i}
              d={`M0 ${y} C400 ${y - (i % 2 ? 48 : 28)}, 800 ${y + (i % 2 ? 38 : 48)}, 1600 ${y}`}
              stroke="url(#pulseBg)"
              strokeWidth="1.6"
              strokeOpacity={0.28}
              filter="url(#glowBg)"
              fill="none"
            />
          ))}

          <path
            d="M-200 700 C300 620 1300 820 1800 780"
            stroke="rgba(67,99,255,0.06)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M-200 840 C200 780 1200 940 1800 900"
            stroke="rgba(0,255,200,0.04)"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-28 px-6">
        {/* Header App Name */}
        <div className="absolute top-6 left-10">
          <h1 className="text-lg font-semibold text-gray-300 tracking-wide">
            {import.meta.env.VITE_APP_TITLE}
          </h1>
        </div>

        {/* Title & Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="max-w-6xl mx-auto text-center relative z-20"
        >
          <h2 className="text-5xl md:text-5xl font-bold mb-4">
            Beyond Monitoring:&nbsp;
            <span className="text-cyan-400">True Network Foresight</span>
          </h2>

          <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-12">
            Gain actionable intelligence and real-time insights. Detect,
            analyze, and respond with precision — powered by AI-driven
            automation and Zabbix telemetry.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                title: "Real-Time Telemetry",
                icon: <Wifi className="w-10 h-10 text-cyan-400" />,
                desc: "Ingest Zabbix feeds instantly for live network visibility.",
              },
              {
                title: "Interactive Alerts",
                icon: <Gauge className="w-10 h-10 text-cyan-400" />,
                desc: "Actionable alerts and escalation pipelines for ops teams.",
              },
              {
                title: "Multi-Tenant Dashboards",
                icon: <Building className="w-10 h-10 text-cyan-400" />,
                desc: "Dedicated dashboards and data isolation for each organization.",
              },
              {
                title: "LLM Powered Analysis",
                icon: <Brain className="w-10 h-10 text-cyan-400" />,
                desc: "Network Status Analysis with prioritized alerts.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.1,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
                className="bg-[#0d162b]/80 border border-cyan-400/8 rounded-2xl p-8 backdrop-blur-md hover:shadow-[0_8px_40px_rgba(0,255,220,0.06)] hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* === SMOOTH TRANSITION SECTION === */}
      <div className="h-40 bg-gradient-to-b from-[#050b16] to-[#020617]" />

      {/* === THREAT DETECTION VISUAL === */}
      <ThreatDetectionVisual />

      {/* === FOOTER === */}
      <footer className="w-full bg-[#020617] py-6 text-center text-gray-500 text-sm border-t border-white/10">
        <p>&copy; 2025 {import.meta.env.VITE_APP_TITLE}</p>
        <p>
          <span>by </span>
          <span className="text-cyan-400 font-medium">
            Rajat Paliwal, Swastik Kulshreshtha &amp; Utkarsh Tailor
          </span>
        </p>
      </footer>
    </div>
  );
}
