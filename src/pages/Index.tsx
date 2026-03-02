import { useState } from "react";
import CursorGlow from "@/components/CursorGlow";
import HeroSection from "@/components/HeroSection";
import AdvancedControls from "@/components/AdvancedControls";
import ImageGrid from "@/components/ImageGrid";
import GallerySection from "@/components/GallerySection";
import StylePresets from "@/components/StylePresets";
import EcosystemSection from "@/components/EcosystemSection";
import TarsFooter from "@/components/TarsFooter";
import { GenerationContext } from "@/components/PromptArea";

const Index = () => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState("");

  return (
    <GenerationContext.Provider value={{ images, isLoading, enhancedPrompt, setImages, setIsLoading, setEnhancedPrompt }}>
      <div className="min-h-screen bg-background relative overflow-x-hidden">
        <CursorGlow />
        <HeroSection />
        <AdvancedControls />
        <ImageGrid />
        <GallerySection />
        <StylePresets />
        <EcosystemSection />
        <TarsFooter />
      </div>
    </GenerationContext.Provider>
  );
};

export default Index;
