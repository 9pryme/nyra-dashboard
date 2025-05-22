import React from "react";
import { motion } from "framer-motion";
import { Hourglass, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FeatureComingSoonProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

export default function FeatureComingSoon({
  title = "Feature Coming Soon",
  description = "We're working hard to bring you this feature. Please check back later.",
  showBackButton = true,
}: FeatureComingSoonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] p-6"
    >
      <div className="flex flex-col items-center max-w-md text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative"
        >
          <div className="bg-primary/10 p-4 rounded-full">
            <Clock className="h-12 w-12 text-primary" />
          </div>
          <motion.div
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [0.95, 1.05, 0.95],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4,
              ease: "easeInOut" 
            }}
            className="absolute -right-2 -top-2 bg-primary/15 p-2 rounded-full"
          >
            <Hourglass className="h-5 w-5 text-primary" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold tracking-tight"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-muted-foreground"
        >
          {description}
        </motion.p>

        {showBackButton && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link href="/dashboard">
              <Button variant="outline">
                Return to Dashboard
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 