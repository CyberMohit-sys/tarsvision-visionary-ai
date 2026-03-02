import { motion } from "framer-motion";

const presets = [
  { name: "Cinematic Ultra", emoji: "🎬", color: "from-primary/20 to-secondary/20" },
  { name: "Hyper Realistic", emoji: "📷", color: "from-accent/20 to-primary/20" },
  { name: "3D Render", emoji: "🧊", color: "from-secondary/20 to-accent/20" },
  { name: "Anime Pro", emoji: "✨", color: "from-primary/20 to-accent/20" },
  { name: "Cyberpunk", emoji: "🌆", color: "from-secondary/30 to-primary/20" },
  { name: "Fantasy Epic", emoji: "🐉", color: "from-accent/20 to-secondary/20" },
  { name: "Branding Mode", emoji: "💎", color: "from-primary/20 to-primary/10" },
  { name: "Minimal Luxury", emoji: "🖤", color: "from-muted/40 to-card/60" },
];

export default function StylePresets() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Style Presets</h2>
          <p className="text-muted-foreground text-lg">One click to transform your creative direction</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {presets.map((preset, i) => (
            <motion.button
              key={preset.name}
              className={`glass-panel glow-hover p-6 text-center bg-gradient-to-br ${preset.color} group cursor-pointer`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{preset.emoji}</span>
              <span className="text-sm font-medium text-foreground">{preset.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
