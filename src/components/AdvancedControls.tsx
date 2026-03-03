import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Ratio, Sparkles, Sun, Layers, Hash } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:2"];

export default function AdvancedControls() {
  const [open, setOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [creativity, setCreativity] = useState([70]);
  const [detail, setDetail] = useState([80]);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.button
          className="w-full glass-panel-glow p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setOpen(!open)}
          whileTap={{ scale: 0.995 }}
        >
          <span className="font-display font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Advanced Creative Controls
          </span>
          <motion.div animate={{ rotate: open ? 180 : 0 }}>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-panel p-6 mt-2 space-y-6">
                {/* Aspect Ratio */}
                <div>
                  <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                    <Ratio className="w-4 h-4 text-accent" /> Aspect Ratio
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {aspectRatios.map((r) => (
                      <button
                        key={r}
                        onClick={() => setSelectedRatio(r)}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedRatio === r
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Creativity */}
                <div>
                  <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-secondary" /> Creativity — {creativity[0]}%
                  </label>
                  <Slider value={creativity} onValueChange={setCreativity} max={100} step={1} className="w-full" />
                </div>

                {/* Detail Intensity */}
                <div>
                  <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-accent" /> Detail Intensity — {detail[0]}%
                  </label>
                  <Slider value={detail} onValueChange={setDetail} max={100} step={1} className="w-full" />
                </div>

                {/* Lighting & Seed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                      <Sun className="w-4 h-4 text-primary" /> Lighting Mode
                    </label>
                    <select className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                      <option>Natural</option>
                      <option>Studio</option>
                      <option>Cinematic</option>
                      <option>Dramatic</option>
                      <option>Neon</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                      <Hash className="w-4 h-4 text-secondary" /> Seed
                    </label>
                    <input
                      type="number"
                      placeholder="Random"
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
