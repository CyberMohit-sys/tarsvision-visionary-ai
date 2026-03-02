import CursorGlow from "@/components/CursorGlow";
import HeroSection from "@/components/HeroSection";
import AdvancedControls from "@/components/AdvancedControls";
import StylePresets from "@/components/StylePresets";
import ImageGrid from "@/components/ImageGrid";
import EcosystemSection from "@/components/EcosystemSection";
import TarsFooter from "@/components/TarsFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <CursorGlow />
      <HeroSection />
      <AdvancedControls />
      <ImageGrid />
      <StylePresets />
      <EcosystemSection />
      <TarsFooter />
    </div>
  );
};

export default Index;
