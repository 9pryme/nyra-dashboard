"use client";

import { motion } from "framer-motion";

interface NyraLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function NyraLoading({ className = "", size = "md" }: NyraLoadingProps) {
  const sizeClasses = {
    sm: "text-3xl",
    md: "text-5xl", 
    lg: "text-7xl"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex space-x-2">
        {["N", "Y", "R", "A"].map((letter, index) => (
          <motion.div
            key={letter}
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              textShadow: [
                "0 0 10px rgba(100, 214, 0, 0.5)",
                "0 0 20px rgba(100, 214, 0, 0.8)",
                "0 0 10px rgba(100, 214, 0, 0.5)"
              ]
            }}
            transition={{
              delay: index * 0.15,
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 1
            }}
            className={`font-bold tracking-wider ${sizeClasses[size]} bg-gradient-to-r from-[#64D600] via-[#64D600] to-[#64D600] bg-clip-text text-transparent`}
          >
            <motion.span
              animate={{
                scale: [1, 1.08, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 