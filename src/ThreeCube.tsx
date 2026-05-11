import * as THREE from "three";
import { useThree } from "./hooks/useThree";

export default function ThreeCube() {
  const { mountRef } = useThree({
    onSetup: ({ scene, camera }) => {
      scene.background = new THREE.Color("#0a0a0f");
      camera.position.set(2, 1.5, 3);
      camera.lookAt(0, 0, 0);

      // Cubo
      const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
      const material = new THREE.MeshStandardMaterial({
        color: "#5b8dee",
        metalness: 0.4,
        roughness: 0.3,
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.name = "cube";
      scene.add(cube);

      // Arestas
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMat = new THREE.LineBasicMaterial({ color: "#a8c5ff" });
      cube.add(new THREE.LineSegments(edges, lineMat));

      // Iluminação
      scene.add(new THREE.AmbientLight("#ffffff", 0.5));

      const dirLight = new THREE.DirectionalLight("#e0f0ff", 1.5);
      dirLight.position.set(3, 5, 4);
      scene.add(dirLight);

      const pointLight = new THREE.PointLight("#4488ff", 2, 10);
      pointLight.position.set(-3, 2, -2);
      scene.add(pointLight);

      // Grid
      const grid = new THREE.GridHelper(10, 20, "#1a1a2e", "#1a1a2e");
      grid.position.y = -1.2;
      scene.add(grid);

      // Interação com mouse
      let isDragging = false;
      let prevMouse = { x: 0, y: 0 };

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
      };
      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        cube.rotation.x += (e.clientY - prevMouse.y) * 0.005;
        cube.rotation.y += (e.clientX - prevMouse.x) * 0.005;
        prevMouse = { x: e.clientX, y: e.clientY };
      };
      const onMouseUp = () => { isDragging = false; };

      window.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },

    onAnimate: ({ scene }) => {
      const cube = scene.getObjectByName("cube");
      if (cube) {
        cube.rotation.x += 0.003;
        cube.rotation.y += 0.005;
      }
    },
  });

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        fontFamily: "'Courier New', monospace",
      }}
    >
      <h1
        style={{
          color: "#a8c5ff",
          letterSpacing: "0.3em",
          fontSize: "0.85rem",
          textTransform: "uppercase",
          marginBottom: "1.5rem",
          opacity: 0.7,
        }}
      >
        Three.js · Cubo 3D
      </h1>

      <div
        ref={mountRef}
        style={{
          width: "min(600px, 90vw)",
          height: "min(600px, 90vw)",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #1e2a4a",
          cursor: "grab",
          boxShadow: "0 0 40px #1a3a8a44",
        }}
      />

      <p style={{ color: "#4a6080", fontSize: "0.75rem", marginTop: "1.2rem" }}>
        Clique e arraste para rotacionar
      </p>
    </div>
  );
}