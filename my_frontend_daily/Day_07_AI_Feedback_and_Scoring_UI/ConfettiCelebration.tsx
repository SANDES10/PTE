import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  vx: number;
  vy: number;
  shape: "rect" | "circle" | "triangle";
}

const COLORS = ["#0d9488", "#06b6d4", "#f59e0b", "#10b981", "#8b5cf6", "#f43f5e", "#3b82f6"];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
    vx: (Math.random() - 0.5) * 60,
    vy: Math.random() * 80 + 40,
    shape: (["rect", "circle", "triangle"] as const)[Math.floor(Math.random() * 3)],
  }));
}

interface ConfettiCelebrationProps {
  trigger: boolean;
  score?: number;
  onComplete?: () => void;
}

export function ConfettiCelebration({ trigger, score, onComplete }: ConfettiCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setParticles(generateParticles(60));
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      setParticles([]);
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: 0,
            width: p.size,
            height: p.shape === "rect" ? p.size * 0.5 : p.size,
            backgroundColor: p.shape !== "triangle" ? p.color : "transparent",
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "rect" ? "2px" : 0,
            borderLeft: p.shape === "triangle" ? `${p.size / 2}px solid transparent` : undefined,
            borderRight: p.shape === "triangle" ? `${p.size / 2}px solid transparent` : undefined,
            borderBottom: p.shape === "triangle" ? `${p.size}px solid ${p.color}` : undefined,
          }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: `${p.vy}vh`,
            x: `${p.vx}vw`,
            rotate: p.rotation * 4,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 2.2, ease: "easeOut" }}
        />
      ))}

      {/* Score reveal overlay */}
      {score !== undefined && (
        <AnimatePresence>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-sm rounded-2xl px-10 py-8 shadow-2xl text-center border border-teal-100"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
            >
              <motion.div
                className="text-6xl font-black text-teal-600 mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {score}
              </motion.div>
              <div className="text-gray-600 font-medium">
                {score >= 79 ? "🎉 Excellent Score!" : score >= 65 ? "✨ Great Work!" : "👍 Good Effort!"}
              </div>
              <div className="text-sm text-gray-400 mt-1">PTE Score</div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── Inline score badge with pop animation ────────────────────────────────────
export function ScoreBadge({ score, className = "" }: { score: number; className?: string }) {
  const color = score >= 79 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : score >= 65 ? "text-teal-600 bg-teal-50 border-teal-200"
    : score >= 50 ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-red-600 bg-red-50 border-red-200";

  return (
    <motion.div
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border font-semibold text-sm ${color} ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
    >
      <span>{score}</span>
      <span className="text-xs opacity-70">/ 90</span>
    </motion.div>
  );
}
