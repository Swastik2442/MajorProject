import { useState, useEffect } from "react";
import { Link } from "react-router";
import useTypingEffect from "@/hooks/typingEffect";

const BackgroundGraphics = () => (
  <div className="absolute inset-0 overflow-hidden z-0">
    <svg
      viewBox="0 0 1920 1080"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full opacity-60"
    >
      <defs>
        <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#00f5d4" />
          <stop offset="100%" stopColor="#00bbf9" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="1920" height="1080" fill="#060b22" />

      {[200, 400, 600, 800].map((y, i) => (
        <path
          key={i}
          d={`M-50 ${y.toString()} C200 ${(y - 100).toString()}, 400 ${(y + 100).toString()}, 700 ${y.toString()}
              C1000 ${(y - 100).toString()}, 1300 ${(y + 100).toString()}, 1970 ${y.toString()}`}
          stroke="url(#grad)"
          strokeWidth="2"
          opacity="0.25"
          filter="url(#glow)"
          fill="none"
        />
      ))}

      <g transform="translate(860 420)">
        <polygon
          points="100,0 200,50 200,150 100,200 0,150 0,50"
          fill="rgba(255,255,255,0.02)"
          stroke="url(#grad)"
          strokeWidth="2"
          filter="url(#glow)"
        />
        <circle cx="100" cy="100" r="12" fill="#00f5d4" opacity="0.8" />
        <circle cx="60" cy="70" r="6" fill="#00bbf9" opacity="0.7" />
        <circle cx="140" cy="70" r="6" fill="#00bbf9" opacity="0.7" />
        <circle cx="60" cy="130" r="6" fill="#00bbf9" opacity="0.7" />
        <circle cx="140" cy="130" r="6" fill="#00bbf9" opacity="0.7" />
      </g>
    </svg>
  </div>
);

const HEADLINE_1 = "Unified Network Intelligence";
const HEADLINE_2 = "at Your Fingertips";

export default function Home() {
  const [startSecond, setStartSecond] = useState(false);

  const headline1 = useTypingEffect(HEADLINE_1, 80, true);
  const headline2 = useTypingEffect(HEADLINE_2, 80, startSecond);

  useEffect(() => {
    if (headline1.length === HEADLINE_1.length) {
      const timeout = setTimeout(() => {setStartSecond(true)}, 100);
      return () => {clearTimeout(timeout)};
    }
  }, [headline1]);

  const typing1Done = headline1.length === HEADLINE_1.length;
  const typing2Done = headline2.length === HEADLINE_2.length;

  return (
    <div className="relative min-h-screen text-white bg-[#060b22] flex flex-col overflow-hidden">
      <BackgroundGraphics />

      {/* Hero */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-wide mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500">
            {headline1}
          </span>
          {!typing1Done && (
            <span className="animate-caret-blink inline-block w-[2px] h-12 bg-white ml-2" />
          )}
          <br />
          <span className="text-blue-300">{headline2}</span>
          {typing1Done && !typing2Done && (
            <span className="animate-caret-blink inline-block w-[2px] h-12 bg-white ml-2" />
          )}
        </h1>

        <p className="text-lg md:text-xl text-gray-300 max-w-3xl leading-relaxed mb-10">
          Leverage real-time Zabbix telemetry, advanced AI/ML-driven analytics,
          and interactive dashboards to optimize and secure your network
          operations — all from one unified interface.
        </p>

        <div className="flex flex-wrap justify-center gap-5">
          <Link
            to="/login"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 p-[1px] text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-cyan-800"
          >
            <span className="relative px-8 py-3 transition-all bg-[#060b22] rounded-md group-hover:bg-transparent group-hover:text-white">
              Get Started
            </span>
          </Link>
          <button className="px-8 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10">
            Learn More
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-gray-500 text-sm border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <p>&copy; {new Date().getFullYear()} {import.meta.env.VITE_APP_TITLE ?? "NMS"}</p>
        <p>
          <span>by </span>
          <span className="text-cyan-500 font-medium">Rajat Paliwal, Swastik Kulshreshtha & Utkarsh Tailor</span>
        </p>
      </footer>
    </div>
  );
}
