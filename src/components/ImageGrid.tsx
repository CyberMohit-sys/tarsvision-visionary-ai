import { motion } from "framer-motion";
import { Download, RefreshCw, Wand2, ArrowUpCircle, Pencil } from "lucide-react";
import { useGeneration } from "./PromptArea";

function ShimmerCard() {
  return <div className="aspect-square rounded-xl shimmer" />;
}

function ImageCard({ src, index }: { src: string; index: number }) {
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `tarsvision-${Date.now()}-${index}.png`;
    a.click();
  };

  return (
    <motion.div
      className="group relative aspect-square rounded-xl overflow-hidden glass-panel border-glass-border"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <img src={src} alt={`Generated image ${index + 1}`} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
        {[
          { icon: Download, label: "Download", onClick: handleDownload },
          { icon: RefreshCw, label: "Regenerate" },
          { icon: Wand2, label: "Enhance" },
          { icon: ArrowUpCircle, label: "Upscale" },
          { icon: Pencil, label: "Edit" },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            className="p-2.5 rounded-lg glass-panel hover:bg-primary/20 transition-colors group/btn"
            title={label}
            onClick={onClick}
          >
            <Icon className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default function ImageGrid() {
  const { images, isLoading, enhancedPrompt } = useGeneration();

  if (!isLoading && images.length === 0) return null;

  return (
    <section className="py-24 relative" id="results">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Generated Results</h2>
          {enhancedPrompt && (
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto glass-panel p-3 rounded-lg">
              <span className="text-accent font-medium">Enhanced: </span>
              {enhancedPrompt.slice(0, 200)}{enhancedPrompt.length > 200 ? "…" : ""}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ShimmerCard key={i} />)
            : images.map((src, i) => <ImageCard key={i} src={src} index={i} />)
          }
        </div>
      </div>
    </section>
  );
}
