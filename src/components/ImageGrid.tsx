import { motion } from "framer-motion";
import { Download, RefreshCw, Wand2, ArrowUpCircle, Pencil } from "lucide-react";

const placeholders = [1, 2, 3, 4];

function ShimmerCard() {
  return (
    <div className="aspect-square rounded-xl shimmer" />
  );
}

function ImageCard({ index }: { index: number }) {
  return (
    <motion.div
      className="group relative aspect-square rounded-xl overflow-hidden glass-panel border-glass-border"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Placeholder shimmer */}
      <ShimmerCard />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
        {[
          { icon: Download, label: "Download" },
          { icon: RefreshCw, label: "Regenerate" },
          { icon: Wand2, label: "Enhance" },
          { icon: ArrowUpCircle, label: "Upscale" },
          { icon: Pencil, label: "Edit" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="p-2.5 rounded-lg glass-panel hover:bg-primary/20 transition-colors group/btn"
            title={label}
          >
            <Icon className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default function ImageGrid() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Generated Results</h2>
          <p className="text-muted-foreground text-lg">Your AI-generated visuals appear here</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {placeholders.map((_, i) => (
            <ImageCard key={i} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
