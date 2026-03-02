import { motion } from "framer-motion";
import { Suspense, lazy } from "react";
import PromptArea from "./PromptArea";
import ParticleField from "./ParticleField";

const FloatingOrb = lazy(() => import("./FloatingOrb"));

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-gradient">
      {/* 3D Orb Background */}
      <Suspense fallback={null}>
        <div className="absolute inset-0 opacity-60">
          <FloatingOrb />
        </div>
      </Suspense>

      {/* Particle Field */}
      <ParticleField />

      {/* Gradient orbs decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }}  />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-accent/5 blur-[80px] animate-pulse-glow" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 container mx-auto px-4 pt-20">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 glass-panel px-4 py-2 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-muted-foreground font-medium tracking-wide">Powered by Tars Labs</span>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="gradient-text">TarsVision</span>
            <br />
            <span className="text-foreground/90">Where Intelligence Becomes Visual</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
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
