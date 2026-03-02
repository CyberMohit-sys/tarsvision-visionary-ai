import { motion } from "framer-motion";
import galleryCinematic from "@/assets/gallery-cinematic.jpg";
import galleryCyberpunk from "@/assets/gallery-cyberpunk.jpg";
import galleryFantasy from "@/assets/gallery-fantasy.jpg";
import gallery3d from "@/assets/gallery-3d.jpg";
import galleryAnime from "@/assets/gallery-anime.jpg";
import galleryRealistic from "@/assets/gallery-realistic.jpg";

const samples = [
  { src: galleryCinematic, style: "Cinematic Ultra", prompt: "Futuristic portrait with neon lights" },
  { src: galleryCyberpunk, style: "Cyberpunk", prompt: "Cyberpunk cityscape at night" },
  { src: galleryFantasy, style: "Fantasy Epic", prompt: "Dragon over crystal mountains" },
  { src: gallery3d, style: "3D Render", prompt: "Abstract geometric sculpture" },
  { src: galleryAnime, style: "Anime Pro", prompt: "Girl in cherry blossom garden" },
  { src: galleryRealistic, style: "Hyper Realistic", prompt: "Lion in golden hour light" },
];

export default function GallerySection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Powered by <span className="gradient-text">AI Excellence</span>
          </h2>
          <p className="text-muted-foreground text-lg">Sample outputs across different style presets</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {samples.map((item, i) => (
            <motion.div
              key={item.style}
              className="group relative aspect-square rounded-xl overflow-hidden glass-panel glow-hover"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <img
                src={item.src}
                alt={item.prompt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <span className="text-xs font-medium text-accent mb-1">{item.style}</span>
                <p className="text-sm text-foreground font-medium">{item.prompt}</p>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-2 py-1 rounded-md glass-panel text-xs font-medium text-foreground">{item.style}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
