import { motion } from "framer-motion";
import { Suspense, lazy } from "react";
import PromptArea from "./PromptArea";
import ParticleField from "./ParticleField";
import { AuthButton } from "./Auth";

const FloatingOrb = lazy(() => import("./FloatingOrb"));

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-gradient">
      {/* Nav bar with auth */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-8 py-4">
        <span className="font-display font-bold text-lg gradient-text">TarsVision</span>
        <AuthButton />
      </div>

      {/* 3D Orb Background */}
      <Suspense fallback={null}>
        <div className="absolute inset-0 opacity-60">
          <FloatingOrb />
        </div>
      </Suspense>

      {/* Particle Field */}
      <ParticleField />

      {/* Gradient orbs decoration */}
      <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 rounded-full bg-primary/10 blur-[80px] sm:blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-40 sm:w-80 h-40 sm:h-80 rounded-full bg-secondary/10 blur-[60px] sm:blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 container mx-auto px-4 pt-20 sm:pt-20">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 glass-panel px-3 py-1.5 sm:px-4 sm:py-2 mb-6 sm:mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs sm:text-sm text-muted-foreground font-medium tracking-wide">Powered by Tars Labs</span>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-5xl lg:text-7xl font-bold font-display leading-tight mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="gradient-text">TarsVision</span>
            <br />
            <span className="text-foreground/90 text-xl sm:text-4xl lg:text-5xl">Where Intelligence Becomes Visual</span>
          </motion.h1>

          <motion.p
            className="text-sm sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Generate cinematic, ultra-detailed AI visuals in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <PromptArea />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
