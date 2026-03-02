import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EcosystemSection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          className="glass-panel-glow p-12 max-w-2xl mx-auto gradient-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">Ecosystem</p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Powered by <span className="gradient-text">Tars Labs</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            TarsVision is part of the Tars Labs AI ecosystem — pushing boundaries in visual intelligence.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-display font-semibold"
          >
            Open TARS AI
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
