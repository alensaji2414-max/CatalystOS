
import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export interface CelebrationEvent {
  type: "level_up" | "achievement" | "quest_complete" | "streak" | "milestone";
  title: string;
  subtitle?: string;
  icon?: string;
  xpGained?: number;
  coinsGained?: number;
  newLevel?: number;
}

interface CelebrationOverlayProps {
  event: CelebrationEvent;
  onComplete: () => void;
}

export function CelebrationOverlay({ event, onComplete }: CelebrationOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    size: 4 + Math.random() * 8,
    color: getRandomColor(event.type),
  }));

  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (i / 20) * 360,
    delay: Math.random() * 0.3,
    distance: 100 + Math.random() * 150,
  }));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              bottom: -20,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
            initial={{ y: 0, opacity: 1 }}
            animate={{
              y: -window.innerHeight - 100,
              opacity: [1, 1, 0],
              x: [0, (Math.random() - 0.5) * 200],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Radial burst from center */}
      <div className="absolute inset-0 flex items-center justify-center">
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute w-2 h-2 rounded-full bg-yellow-400"
            style={{
              boxShadow: "0 0 10px #facc15, 0 0 20px #facc15",
            }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos((sparkle.angle * Math.PI) / 180) * sparkle.distance,
              y: Math.sin((sparkle.angle * Math.PI) / 180) * sparkle.distance,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 1,
              delay: sparkle.delay + 0.2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Main content card */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-8 py-10"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 300 }}
      >
        {/* Glowing rings */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${getGlowColor(event.type)}20 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Icon with glow */}
        <motion.div
          className="relative mb-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0 blur-2xl"
            style={{ backgroundColor: getGlowColor(event.type) }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.span
            className="relative text-7xl sm:text-8xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 10, delay: 0.2 }}
          >
            {event.icon || getDefaultIcon(event.type)}
          </motion.span>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            textShadow: "0 0 30px rgba(250, 204, 21, 0.5)",
          }}
        >
          {event.title}
        </motion.h2>

        {/* Subtitle */}
        {event.subtitle && (
          <motion.p
            className="text-lg text-muted-foreground mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {event.subtitle}
          </motion.p>
        )}

        {/* New Level Display */}
        {event.newLevel && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-primary/30 blur-xl rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div className="relative px-8 py-4 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/50">
                <span className="text-5xl font-bold text-primary">
                  Level {event.newLevel}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rewards */}
        {(event.xpGained || event.coinsGained) && (
          <motion.div
            className="flex gap-6 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {event.xpGained && (
              <motion.div
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/50"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-2xl">⚡</span>
                <span className="text-xl font-bold text-yellow-400">+{event.xpGained} XP</span>
              </motion.div>
            )}
            {event.coinsGained && (
              <motion.div
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/50"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-2xl">🪙</span>
                <span className="text-xl font-bold text-amber-400">+{event.coinsGained}</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Tap to continue */}
        <motion.p
          className="mt-8 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        >
          Auto-closing in a moment...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

function getRandomColor(type: CelebrationEvent["type"]): string {
  const colors: Record<CelebrationEvent["type"], string[]> = {
    level_up: ["#facc15", "#fbbf24", "#f59e0b", "#22d3ee", "#06b6d4"],
    achievement: ["#a855f7", "#8b5cf6", "#7c3aed", "#c084fc", "#e879f9"],
    quest_complete: ["#22c55e", "#4ade80", "#86efac", "#10b981", "#34d399"],
    streak: ["#f97316", "#fb923c", "#fdba74", "#ef4444", "#f87171"],
    milestone: ["#3b82f6", "#60a5fa", "#93c5fd", "#6366f1", "#818cf8"],
  };
  const typeColors = colors[type];
  return typeColors[Math.floor(Math.random() * typeColors.length)];
}

function getGlowColor(type: CelebrationEvent["type"]): string {
  const colors: Record<CelebrationEvent["type"], string> = {
    level_up: "#facc15",
    achievement: "#a855f7",
    quest_complete: "#22c55e",
    streak: "#f97316",
    milestone: "#3b82f6",
  };
  return colors[type];
}

function getDefaultIcon(type: CelebrationEvent["type"]): string {
  const icons: Record<CelebrationEvent["type"], string> = {
    level_up: "⬆️",
    achievement: "🏆",
    quest_complete: "✅",
    streak: "🔥",
    milestone: "🎯",
  };
  return icons[type];
}
