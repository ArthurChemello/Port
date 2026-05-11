import * as THREE from "three";
import { useThree } from "./hooks/useThree";

// --- Helpers ---
function createBox(
  w: number, h: number, d: number,
  color: number,
  x: number, y: number, z: number
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createCylinder(
  rt: number, rb: number, h: number,
  color: number,
  x: number, y: number, z: number,
  segs = 8
): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(rt, rb, h, segs);
  const mat = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

function buildBarn(scene: THREE.Scene) {
  // Corpo do celeiro
  const body = createBox(4, 3, 3, 0xc0392b, -4, 1.5, 0);
  scene.add(body);

  // Telhado (pirâmide com prisma)
  const roofGeo = new THREE.CylinderGeometry(0, 3, 1.8, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x7b3f00 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(-4, 3.9, 0);
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  scene.add(roof);

  // Porta
  const door = createBox(1, 1.6, 0.1, 0x5c3317, -4, 0.8, 1.51);
  scene.add(door);
}

function buildTree(scene: THREE.Scene, x: number, z: number) {
  // Tronco
  const trunk = createCylinder(0.15, 0.2, 1.2, 0x8B5E3C, x, 0.6, z);
  scene.add(trunk);
  // Copa
  const top = createCylinder(0, 1, 1.8, 0x3a7d44, x, 1.9, z, 6);
  scene.add(top);
  const mid = createCylinder(0, 1.3, 1.6, 0x4a9e58, x, 1.4, z, 6);
  scene.add(mid);
}

function buildHouse(scene: THREE.Scene) {
  // Paredes
  const walls = createBox(3, 2.2, 3, 0xf5e6c8, 4, 1.1, 0);
  scene.add(walls);
  // Telhado
  const roofGeo = new THREE.CylinderGeometry(0, 2.4, 1.4, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xc0392b });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(4, 2.6, 0);
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  scene.add(roof);
  // Porta
  const door = createBox(0.6, 1.1, 0.1, 0x8B5E3C, 4, 0.55, 1.51);
  scene.add(door);
  // Janela
  const win = createBox(0.7, 0.7, 0.1, 0xa8d4f5, 5, 1.2, 1.51);
  scene.add(win);
}

function buildFence(scene: THREE.Scene) {
  const posts: [number, number][] = [
    [-7, 2], [-5, 2], [-3, 2], [-1, 2],
    [1, 2], [3, 2], [5, 2], [7, 2],
  ];
  posts.forEach(([x, z]) => {
    const post = createBox(0.12, 1, 0.12, 0xd4a96a, x, 0.5, z);
    scene.add(post);
  });
  // Rail superior
  const railTop = createBox(14, 0.1, 0.1, 0xd4a96a, 0, 0.95, 2);
  scene.add(railTop);
  const railBot = createBox(14, 0.1, 0.1, 0xd4a96a, 0, 0.55, 2);
  scene.add(railBot);
}

function buildWell(scene: THREE.Scene) {
  const base = createCylinder(0.5, 0.5, 0.6, 0x888888, 0, 0.3, -3, 12);
  scene.add(base);
  const post1 = createBox(0.1, 1.2, 0.1, 0x8B5E3C, -0.4, 0.9, -3);
  const post2 = createBox(0.1, 1.2, 0.1, 0x8B5E3C, 0.4, 0.9, -3);
  scene.add(post1);
  scene.add(post2);
  const beam = createBox(1, 0.1, 0.1, 0x8B5E3C, 0, 1.55, -3);
  scene.add(beam);
}

export default function ThreeFarm() {
  const { mountRef } = useThree({
    onSetup: ({ scene, camera, renderer }) => {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      scene.background = new THREE.Color("#87ceeb");
      scene.fog = new THREE.Fog("#87ceeb", 20, 50);

      camera.position.set(10, 8, 14);
      camera.lookAt(0, 0, 0);

      // Chão
      const groundGeo = new THREE.PlaneGeometry(40, 40);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x7dba5a });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Construções
      buildBarn(scene);
      buildHouse(scene);
      buildFence(scene);
      buildWell(scene);

      // Árvores
      buildTree(scene, -7, -3);
      buildTree(scene, -8, 1);
      buildTree(scene, 7, -4);
      buildTree(scene, 8, -1);

      // Iluminação
      const ambient = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambient);

      const sun = new THREE.DirectionalLight(0xfff4e0, 1.8);
      sun.position.set(10, 20, 10);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 2048;
      sun.shadow.mapSize.height = 2048;
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 60;
      sun.shadow.camera.left = -20;
      sun.shadow.camera.right = 20;
      sun.shadow.camera.top = 20;
      sun.shadow.camera.bottom = -20;
      scene.add(sun);

      // Interação com mouse (orbitar)
      let isDragging = false;
      let prevMouse = { x: 0, y: 0 };
      let spherical = { theta: 0.9, phi: 0.55, radius: 18 };

      const updateCamera = () => {
        camera.position.set(
          spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta),
          spherical.radius * Math.cos(spherical.phi),
          spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
        );
        camera.lookAt(0, 0, 0);
      };
      updateCamera();

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
      };
      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        spherical.theta -= (e.clientX - prevMouse.x) * 0.008;
        spherical.phi = Math.max(0.1, Math.min(1.4, spherical.phi + (e.clientY - prevMouse.y) * 0.008));
        prevMouse = { x: e.clientX, y: e.clientY };
        updateCamera();
      };
      const onMouseUp = () => { isDragging = false; };
      const onWheel = (e: WheelEvent) => {
        spherical.radius = Math.max(5, Math.min(35, spherical.radius + e.deltaY * 0.02));
        updateCamera();
      };

      window.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("wheel", onWheel);
    },

    onAnimate: () => {},
  });

  return (
    <div style={{
      width: "100vw", height: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#1a1a2e",
      fontFamily: "'Courier New', monospace",
    }}>
      <h1 style={{
        color: "#a8d4a8", letterSpacing: "0.3em",
        fontSize: "0.8rem", textTransform: "uppercase",
        marginBottom: "1rem", opacity: 0.8,
      }}>
        Three.js · Fazenda 3D
      </h1>

      <div ref={mountRef} style={{
        width: "min(800px, 95vw)",
        height: "min(550px, 80vh)",
        borderRadius: "12px", overflow: "hidden",
        border: "1px solid #2a4a2a",
        cursor: "grab",
        boxShadow: "0 0 40px #0a2a0a66",
      }} />

      <p style={{ color: "#4a7a4a", fontSize: "0.72rem", marginTop: "1rem" }}>
        Arraste para orbitar · Scroll para zoom
      </p>
    </div>
  );
}