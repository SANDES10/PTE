import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedProgressBarProps {
  value: number;      // 0–100
  max?: number;
  color?: string;
  bgColor?: string;
  height?: number;
  label?: string;
  showValue?: boolean;
  delay?: number;
  className?: string;
}

export function AnimatedProgressBar({
  value,
  max = 100,
  color = "bg-teal-500",
  bgColor = "bg-gray-100",
  height = 8,
  label,
  showValue = false,
  delay = 0,
  className = "",
}: AnimatedProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div ref={ref} className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-gray-600 font-medium">{label}</span>}
          {showValue && <span className="text-sm font-semibold text-gray-800">{value}</span>}
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${bgColor}`}
        style={{ height }}
      >
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: "0%" }}
          animate={isInView ? { width: `${pct}%` } : { width: "0%" }}
          transition={{
            duration: 0.9,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      </div>
    </div>
  );
}

// ─── Multi-skill progress bars (for score reports) ────────────────────────────
interface SkillBarProps {
  skill: string;
  score: number;
  maxScore?: number;
  color?: string;
  delay?: number;
}

export function SkillBar({ skill, score, maxScore = 90, color = "bg-teal-500", delay = 0 }: SkillBarProps) {
  const minScore = 10;
  const pct = Math.max(0, Math.min(100, ((score - minScore) / (maxScore - minScore)) * 100));
  const scoreColor = score >= 79 ? "text-emerald-600" : score >= 65 ? "text-teal-600" : score >= 50 ? "text-amber-600" : "text-red-500";

  return (
    <div className="flex items-center gap-3 group">
      <span className="text-sm text-gray-600 w-36 shrink-0 group-hover:text-gray-900 transition-colors">{skill}</span>
      <div className="flex-1">
        <AnimatedProgressBar value={pct} color={color} height={6} delay={delay} />
      </div>
      <span className={`text-sm font-bold w-8 text-right ${scoreColor}`}>{score}</span>
    </div>
  );
}

// ─── Circular progress (mini) ─────────────────────────────────────────────────
interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export function CircularProgress({
  value,
  size = 48,
  strokeWidth = 4,
  color = "#0d9488",
  className = "",
}: CircularProgressProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true });
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, value));
  const offset = circumference * (1 - pct / 100);

  return (
    <svg ref={ref} width={size} height={size} className={className} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={isInView ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </svg>
  );
}
