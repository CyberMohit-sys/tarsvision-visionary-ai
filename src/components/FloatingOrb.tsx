import { useRef, Component, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

function AnimatedOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.2, 64, 64]}>
      <MeshDistortMaterial
        color="#6366f1"
        emissive="#4f46e5"
        emissiveIntensity={0.4}
        roughness={0.2}
        metalness={0.8}
        distort={0.4}
        speed={2}
        transparent
        opacity={0.7}
      />
    </Sphere>
  );
}

export default function FloatingOrb() {
  return (
    <ErrorBoundary fallback={null}>
      <div className="absolute inset-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 4], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1} color="#818cf8" />
          <pointLight position={[-5, -5, 5]} intensity={0.5} color="#06b6d4" />
          <AnimatedOrb />
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}
