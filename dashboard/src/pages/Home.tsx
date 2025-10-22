// Home.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import useTypingEffect from "@/hooks/typingEffect";
import {
  Brain,
  Wifi,
  CloudLightning,
  Lock,
  Gauge,
  Rocket,
} from "lucide-react";

const HEADLINE_1 = "Unified Network Intelligence";
const HEADLINE_2 = "at Your Fingertips";

export default function Home() {
  const [startSecond, setStartSecond] = useState(false);
  const headline1 = useTypingEffect(HEADLINE_1, 80, true);
  const headline2 = useTypingEffect(HEADLINE_2, 80, startSecond);

  useEffect(() => {
    if (headline1.length === HEADLINE_1.length) {
      const timeout = setTimeout(() => setStartSecond(true), 150);
      return () => clearTimeout(timeout);
    }
  }, [headline1]);

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-[#050b16] overflow-x-hidden text-white scroll-smooth">
      {/* === HERO SECTION === */}
      <section className="relative flex flex-col items-center justify-center min-h-screen w-full">
        {/* Background glow */}
        <div className="absolute w-[1200px] h-[1200px] bg-[radial-gradient(circle,rgba(0,255,153,0.12),transparent_70%)] blur-3xl"></div>

        {/* Static network lines */}
        <div className="absolute inset-0 overflow-hidden opacity-70">
          <svg
            className="absolute top-1/2 left-0 -translate-y-1/2 w-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1600 600"
            fill="none"
          >
            <defs>
              <linearGradient id="pulse" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#00f5d4" />
                <stop offset="100%" stopColor="#00bbf9" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {[200, 260, 320, 380, 440].map((y, i) => (
              <path
                key={i}
                d={`M0 ${y} C400 ${y - 40}, 800 ${y + 40}, 1600 ${y}`}
                stroke="url(#pulse)"
                strokeWidth="1.5"
                strokeOpacity="0.35"
                filter="url(#glow)"
                fill="none"
              />
            ))}
            {[
              [200, 700],
              [260, 500],
              [320, 900],
              [380, 1100],
              [440, 300],
              [320, 1300],
            ].map(([y, x], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="5"
                fill="#00e0ff"
                opacity="0.8"
                filter="url(#glow)"
              />
            ))}
          </svg>
        </div>

        {/* Header */}
        <div className="absolute top-6 w-full flex justify-start items-center px-10">
          <h1 className="text-lg font-semibold text-gray-300 tracking-wide">
            NMS
          </h1>
        </div>

        {/* Glassmorphic hero card */}
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
          viewport={{ once: true }}
          className="relative bg-[rgba(255,255,255,0.06)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)]
            rounded-3xl p-16 w-[92%] max-w-5xl text-center shadow-[0_0_100px_rgba(0,255,180,0.15)] z-10"
        >
          <div className="absolute -z-10 w-[700px] h-[700px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(0,200,255,0.25),transparent_70%)] blur-3xl"></div>

          <h2 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text mb-6 leading-tight">
            {headline1}
            {headline1.length < HEADLINE_1.length && (
              <span className="animate-caret-blink inline-block w-[2px] h-10 bg-white ml-1" />
            )}
            <br />
            <span className="text-blue-300">{headline2}</span>
            {headline1.length === HEADLINE_1.length &&
              headline2.length < HEADLINE_2.length && (
                <span className="animate-caret-blink inline-block w-[2px] h-10 bg-white ml-1" />
              )}
          </h2>

          <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-10">
            Harnessing Zabbix & AI for Predictive Operations. Gain real-time
            insights, detect anomalies, and manage network health with advanced
            AI and machine learning.
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/login"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-green-400 to-blue-500 p-[1px] text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-green-700"
            >
              <span className="relative px-10 py-3 transition-all bg-[#050b16] rounded-full group-hover:bg-transparent group-hover:text-white">
                Access Dashboard
              </span>
            </Link>
            <a href="#features">
              <button className="px-10 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 text-lg">
                Learn More
              </button>
            </a>
          </div>
        </motion.div>

       
      </section>

      {/* === FEATURE SECTION === */}
      <section
        id="features"
        className="relative w-full bg-[#0a0f1e] py-32 flex flex-col items-center justify-center min-h-screen"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-20 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Explore Key Capabilities
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl px-8">
          {[
            {
              icon: <Brain className="w-14 h-14 text-cyan-400" />,
              title: "AI / LLM Powered",
              desc: "Advanced AI models analyze data and predict network anomalies proactively.",
            },
            {
              icon: <Wifi className="w-14 h-14 text-purple-400" />,
              title: "Real-Time Monitoring",
              desc: "Track live performance metrics and instantly detect downtime or latency spikes.",
            },
            {
              icon: <CloudLightning className="w-14 h-14 text-pink-400" />,
              title: "Cloud Integration",
              desc: "Seamlessly integrates with hybrid and multi-cloud infrastructures.",
            },
            {
              icon: <Lock className="w-14 h-14 text-teal-400" />,
              title: "Secure by Design",
              desc: "End-to-end encryption and AI-powered threat detection built-in.",
            },
            {
              icon: <Gauge className="w-14 h-14 text-blue-400" />,
              title: "High Performance",
              desc: "Optimized for ultra-fast data processing and visualization.",
            },
            {
              icon: <Rocket className="w-14 h-14 text-indigo-400" />,
              title: "Scalable & Modular",
              desc: "Easily adapt and expand with modular architecture for future needs.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-2xl p-10 backdrop-blur-lg shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <div className="flex justify-center mb-6">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-4 text-white text-center">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-base leading-relaxed text-center">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* === FOOTER === */}
      <footer className="w-full bg-[#050b16] py-6 text-center text-gray-500 text-sm border-t border-white/10">
        <p>&copy; 2025 NMS</p>
        <p>
          <span>by </span>
          <span className="text-cyan-400 font-medium">
            Rajat Paliwal, Swastik Kulshreshtha & Utkarsh Tailor
          </span>
        </p>
      </footer>
    </div>
  );
}
