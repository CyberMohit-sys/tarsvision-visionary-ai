import { useState, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { generateImage, editImage } from "@/lib/api";
import { toast } from "sonner";

// Context for sharing generation results
export const GenerationContext = createContext<{
  images: string[];
  isLoading: boolean;
  enhancedPrompt: string;
  setImages: (imgs: string[]) => void;
  setIsLoading: (v: boolean) => void;
  setEnhancedPrompt: (p: string) => void;
}>({
  images: [],
  isLoading: false,
  enhancedPrompt: "",
  setImages: () => {},
  setIsLoading: () => {},
  setEnhancedPrompt: () => {},
});

export function useGeneration() {
  return useContext(GenerationContext);
}

interface PromptAreaProps {
  style?: string;
  aspectRatio?: string;
  creativity?: number;
  detail?: number;
  lighting?: string;
}

export default function PromptArea({ style, aspectRatio, creativity, detail, lighting }: PromptAreaProps) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string>("image/jpeg");
  const [dragOver, setDragOver] = useState(false);
  const { setImages, setIsLoading, isLoading, setEnhancedPrompt } = useGeneration();

  const handleFile = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB limit");
      return;
    }
    if (!/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      toast.error("Only JPG, PNG, WEBP files allowed");
      return;
    }
    setUploadedMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setImages([]);
    setEnhancedPrompt("");

    try {
      if (mode === "text") {
        const result = await generateImage({
          prompt: prompt.trim(),
          style,
          aspectRatio,
          creativity,
          detail,
          lighting,
        });
        setImages(result.images);
        setEnhancedPrompt(result.enhancedPrompt);
        toast.success(`Generated ${result.count} image(s)`);
      } else {
        if (!uploadedImage) {
          toast.error("Please upload an image first");
          setIsLoading(false);
          return;
        }
        // Extract base64 data (remove data:image/...;base64, prefix)
        const base64Data = uploadedImage.split(",")[1];
        const result = await editImage({
          prompt: prompt.trim(),
          imageBase64: base64Data,
          mimeType: uploadedMimeType,
        });
        setImages(result.images);
        setEnhancedPrompt(result.enhancedPrompt);
        toast.success("Image edited successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsLoading(false);
    }
  };

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

          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === "text"
                ? "Describe the visual universe you want to create…"
                : "Describe how you want to transform this image…"
              }
              className="flex-1 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground text-sm sm:text-base min-h-[56px] max-h-32"
              rows={2}
            />
            <Button
              size="lg"
              className="self-end sm:self-end px-6 sm:px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-display font-semibold tracking-wide w-full sm:w-auto"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Generating…" : "Generate"}
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
