// Home.tsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import useTypingEffect from "@/hooks/typingEffect";
import {
  Brain,
  Wifi,
  Lock,
  Gauge,
} from "lucide-react";

/**
 * Updated Home.tsx
 * - Keeps hero and background identical
 * - “Learn More” now navigates to `/about` instead of #features
 */

const HEADLINE_1 = "Unified Network Intelligence";
const HEADLINE_2 = "at Your Fingertips";

export default function Home() {
  const [startSecond, setStartSecond] = useState(false);
  const headline1 = useTypingEffect(HEADLINE_1, 80, true);
  const headline2 = useTypingEffect(HEADLINE_2, 80, startSecond);

  const bgRef = useRef<HTMLDivElement | null>(null);

  // GPU-friendly scroll background offset
  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (!bgRef.current) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const offset = window.scrollY * 0.08;
          bgRef.current!.style.setProperty("--bg-translate-y", `${offset}px`);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Trigger typing of second headline
  useEffect(() => {
    if (headline1.length === HEADLINE_1.length) {
      const timeout = setTimeout(() => setStartSecond(true), 150);
      return () => clearTimeout(timeout);
    }
  }, [headline1]);

  return (
    <div className="relative min-h-screen w-full bg-[#050b16] text-white overflow-x-hidden">
      {/* Background Layer */}
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

      {/* Page Content */}
      <div className="relative z-10">
        {/* === HERO SECTION === */}
        <section className="relative flex flex-col items-center justify-center min-h-screen w-full">
          <div className="absolute top-6 w-full flex justify-start items-center px-10 z-20">
            <h1 className="text-lg font-semibold text-gray-300 tracking-wide">
              NMS
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="relative bg-[rgba(255,255,255,0.06)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)]
              rounded-3xl p-16 w-[92%] max-w-5xl text-center shadow-[0_0_100px_rgba(0,255,180,0.15)] z-20"
          >
            <div className="absolute -z-10 w-[700px] h-[700px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(0,200,255,0.25),transparent_70%)] blur-3xl" />

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
              insights, detect anomalies, and manage network health with advanced AI and machine learning.
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

              {/* ✅ Updated "Learn More" to navigate to /about */}
              <Link to="/about">
                <button className="px-10 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 text-lg">
                  Learn More
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Gradient bridge (hero -> rest) */}
          <div
            className="absolute bottom-0 left-0 w-full h-40 pointer-events-none z-10"
            aria-hidden
          >
            <div className="w-full h-full bg-gradient-to-b from-transparent via-[#051026] to-[#08101f] opacity-95" />
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full bg-[#050b16] py-6 text-center text-gray-500 text-sm border-t border-white/10">
          <p>&copy; 2025 NMS</p>
          <p>
            <span>by </span>
            <span className="text-cyan-400 font-medium">
              Rajat Paliwal, Swastik Kulshreshtha &amp; Utkarsh Tailor
            </span>
          </p>
        </footer>
      </div>

      {/* caret blink animation */}
      <style>{`
        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }
        .animate-caret-blink { animation: blink 1s infinite; }
      `}</style>
    </div>
  );
}
