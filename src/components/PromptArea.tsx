import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function PromptArea() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.size <= 5 * 1024 * 1024 && /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Tabs value={mode} onValueChange={setMode} className="w-full">
        <TabsList className="glass-panel border-glass-border bg-card/40 mb-4 p-1">
          <TabsTrigger value="text" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground gap-2">
            <Sparkles className="w-4 h-4" />
            Text to Image
          </TabsTrigger>
          <TabsTrigger value="edit" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground gap-2">
            <ImageIcon className="w-4 h-4" />
            Edit Existing Image
          </TabsTrigger>
        </TabsList>

        <div className="glass-panel-glow p-6 gradient-border">
          <TabsContent value="edit" className="mt-0 mb-4">
            <AnimatePresence mode="wait">
              {!uploadedImage ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver ? "border-accent bg-accent/5" : "border-border"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">Drag & drop an image here</p>
                  <label className="cursor-pointer">
                    <span className="text-sm text-primary hover:underline">or browse files</span>
                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileSelect} />
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WEBP · Max 5MB</p>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-lg overflow-hidden"
                >
                  <img src={uploadedImage} alt="Upload preview" className="w-full max-h-48 object-cover rounded-lg" />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <div className="flex gap-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === "text"
                ? "Describe the visual universe you want to create…"
                : "Describe how you want to transform this image…"
              }
              className="flex-1 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground text-base min-h-[56px] max-h-32"
              rows={2}
            />
            <Button
              size="lg"
              className="self-end px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-display font-semibold tracking-wide"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
