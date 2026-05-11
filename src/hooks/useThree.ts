import { useEffect, useRef } from "react";
import * as THREE from "three";

interface UseThreeOptions {
  onSetup?: (ctx: ThreeContext) => void;
  onAnimate?: (ctx: ThreeContext) => void;
  onResize?: (ctx: ThreeContext) => void;
}

export interface ThreeContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

export function useThree(options: UseThreeOptions = {}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // --- Cena ---
    const scene = new THREE.Scene();

    // --- Câmera ---
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const ctx: ThreeContext = { scene, camera, renderer };

    // Callback de setup do usuário
    options.onSetup?.(ctx);

    // --- Resize ---
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      options.onResize?.(ctx);
    };
    window.addEventListener("resize", handleResize);

    // --- Loop de animação ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      options.onAnimate?.(ctx);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return { mountRef };
}