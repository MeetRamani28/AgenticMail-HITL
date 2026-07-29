import React from "react";
import { motion } from "framer-motion";

interface Props {
  mood: "idle" | "listening" | "thinking" | "speaking";
}
    
export const AgenticMailOrb: React.FC<Props> = ({ mood }) => {
  const moodConfig = {
    idle: {
      color: "border-cyan-500/50",
      glow: "shadow-[0_0_35px_rgba(6,182,212,0.25)]",
      coreColor: "bg-cyan-500/40",
      text: "AGENTIC-MAIL CORE // STANDBY",
      animateScale: [1, 1.05, 1],
      speed: 4,
    },
    listening: {
      color: "border-emerald-400",
      glow: "shadow-[0_0_50px_rgba(52,211,153,0.6)]",
      coreColor: "bg-emerald-400/70",
      text: "LISTENING TO EXECUTIVE COMMAND...",
      animateScale: [1, 1.15, 1],
      speed: 1.5,
    },
    thinking: {
      color: "border-amber-400",
      glow: "shadow-[0_0_50px_rgba(251,191,36,0.6)]",
      coreColor: "bg-amber-400/70",
      text: "PROCESSING RAG & LLM WORKFLOW...",
      animateScale: [0.95, 1.1, 0.95],
      speed: 1,
    },
    speaking: {
      color: "border-cyan-300",
      glow: "shadow-[0_0_60px_rgba(34,211,238,0.8)]",
      coreColor: "bg-cyan-300/80",
      text: "DISPATCHING EXECUTIVE RESPONSE...",
      animateScale: [1, 1.2, 1.05, 1.15, 1],
      speed: 0.8,
    },
  }[mood];

  return (
    <div className="flex flex-col items-center justify-center py-6 select-none">
      <div className="relative flex items-center justify-center w-48 h-48">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className={`absolute w-44 h-44 rounded-full border-2 border-dashed ${moodConfig.color} opacity-60`}
        />

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className={`absolute w-36 h-36 rounded-full border border-dotted ${moodConfig.color} opacity-80`}
        />

        <motion.div
          animate={{
            scale: moodConfig.animateScale,
          }}
          transition={{
            duration: moodConfig.speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`w-24 h-24 rounded-full border-2 ${moodConfig.color} ${moodConfig.glow} flex items-center justify-center backdrop-blur-sm bg-[#050811]/60`}
        >
          <div
            className={`w-10 h-10 rounded-full ${moodConfig.coreColor} blur-[2px] animate-pulse`}
          />
        </motion.div>

        <div className="absolute w-48 h-48 pointer-events-none">
          <span className="absolute top-2 left-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
          <span className="absolute bottom-4 right-6 w-1 h-1 bg-cyan-300 rounded-full opacity-70" />
          <span className="absolute top-10 left-6 w-1 h-1 bg-cyan-500 rounded-full opacity-50" />
        </div>
      </div>

      <motion.p
        key={mood}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 text-[11px] font-mono tracking-widest text-cyan-400 uppercase bg-cyan-950/40 border border-cyan-800/60 px-3 py-1 rounded-full shadow-sm"
      >
        {moodConfig.text}
      </motion.p>
    </div>
  );
};