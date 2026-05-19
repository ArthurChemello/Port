import * as Three from 'three';
import { useThree } from './hooks/useThree';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function ThreePortfolio() {
  const { mountRef } = useThree({
    onSetup: ({ scene, camera, renderer }) => {

      // Câmera
      camera.position.set(0.129, 5.517, -7.08);
      camera.rotation.order = "YXZ";
      camera.rotation.y = Math.PI;

      // Sombras
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = Three.VSMShadowMap;

      // Iluminação
      scene.add(new Three.AmbientLight(0xffffff, 0.8));
      const dir = new Three.DirectionalLight(0xffffff, 3);
      dir.position.set(0, 7, 0);
      dir.castShadow = true;
      dir.shadow.mapSize.width = 2048;
      dir.shadow.mapSize.height = 2048;
      dir.shadow.camera.near = 0.5;
      dir.shadow.camera.far = 50;
      dir.shadow.camera.left = -20;
      dir.shadow.camera.right = 20;
      dir.shadow.camera.top = 20;
      dir.shadow.camera.bottom = -20;
      scene.add(dir);

      // Cena
      const loader = new GLTFLoader();
      loader.load("/scene.glb", (gltf: GLTF) => {
        scene.add(gltf.scene);
        gltf.scene.traverse((obj) => {
          if (obj instanceof Three.Mesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });

        const mao = gltf.scene.getObjectByName("Skeletal Hand");
        if (mao) {
          (scene as any).mao = mao;
          (scene as any).maoPosOriginal = mao.position.clone();
          (scene as any).maoRotOriginal = mao.rotation.clone();
        }
      });

      // Cartas na mesa
      const cartasData = [
        { nome: "Projeto 1", x: -2,  z: 1 },
        { nome: "Projeto 2", x: -1,  z: 1 },
        { nome: "Projeto 3", x: 0,   z: 1 },
        { nome: "Projeto 4", x: 1,   z: 1 },
        { nome: "Projeto 5", x: 2,   z: 1 },
      ];

      const CartaoGeo = new Three.PlaneGeometry(0.6, 0.9);
      const CartaMeshes: Three.Mesh[] = [];

      cartasData.forEach(({ nome, x, z }) => {
        const mat = new Three.MeshStandardMaterial({ color: 0xffffff, side: Three.DoubleSide });
        const carta = new Three.Mesh(CartaoGeo, mat);
        carta.position.set(x, 3.6, z);
        carta.rotation.x = -Math.PI / 2;
        carta.name = nome;
        carta.castShadow = true;
        scene.add(carta);
        CartaMeshes.push(carta);
      });

      // Estado da animação
      (scene as any).animando = false;
      (scene as any).cartaSelecionada = null;
      (scene as any).faseAnim = 0;

      // Controle do pointer
      let pointerAtivo = false;

      renderer.domElement.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        renderer.domElement.requestPointerLock();
      });

      document.addEventListener("pointerlockchange", () => {
        pointerAtivo = document.pointerLockElement === renderer.domElement;
        console.log("pointerAtivo:", pointerAtivo);
      });

      // Controle de câmera
      let yaw = Math.PI;
      let pitch = 0;
      const MAX_PITCH = Three.MathUtils.degToRad(40);
      const MAX_YAW = Three.MathUtils.degToRad(80);

      document.addEventListener("mousemove", (e) => {
        if (!pointerAtivo) return;
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;
        yaw = Three.MathUtils.clamp(yaw, Math.PI - MAX_YAW, Math.PI + MAX_YAW);
        pitch = Three.MathUtils.clamp(pitch, -MAX_PITCH, MAX_PITCH);
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;
      });

      // Raycaster
      const raycaster = new Three.Raycaster();
      const centro = new Three.Vector2(0, 0);

      window.addEventListener("click", () => {
        console.log("clique detectado!", pointerAtivo);
        if (!pointerAtivo) return;
        if ((scene as any).animando) return;

        raycaster.setFromCamera(centro, camera);
        const hits = raycaster.intersectObjects(CartaMeshes);
        console.log("hits:", hits.length);
        if (hits.length > 0) {
          const carta = hits[0].object as Three.Mesh;
          (scene as any).animando = true;
          (scene as any).cartaSelecionada = carta;
          (scene as any).faseAnim = 1;
          console.log("carta selecionada:", carta.name);
        }
      });

      // ESC volta ao estado normal
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          const mao = (scene as any).mao;
          const carta = (scene as any).cartaSelecionada;
          if (mao) {
            mao.position.copy((scene as any).maoPosOriginal);
            mao.rotation.copy((scene as any).maoRotOriginal);
          }
          if (carta) {
            carta.rotation.x = -Math.PI / 2;
            carta.scale.set(1, 1, 1);
            carta.position.set(carta.position.x, 3.6, 1);
          }
          (scene as any).animando = false;
          (scene as any).faseAnim = 0;
          (scene as any).cartaSelecionada = null;
        }
      });
    },

    onAnimate: ({ scene }) => {
      const mao = (scene as any).mao;
      const carta = (scene as any).cartaSelecionada;
      const fase = (scene as any).faseAnim;

      if (!mao || !carta || fase === 0) return;

      // Fase 1 — mão vai até a carta
      if (fase === 1) {
        const destino = new Three.Vector3(carta.position.x, mao.position.y, carta.position.z);
        mao.position.lerp(destino, 0.06);
        if (mao.position.distanceTo(destino) < 0.1) {
          (scene as any).faseAnim = 2;
        }
      }

      // Fase 2 — mão arrasta a carta puxando para perto
      if (fase === 2) {
        const destinoZ = (scene as any).maoPosOriginal.z + 1.5;
        mao.position.z += (destinoZ - mao.position.z) * 0.04;
        carta.position.x = mao.position.x;
        carta.position.z = mao.position.z;
        if (Math.abs(mao.position.z - destinoZ) < 0.1) {
          (scene as any).faseAnim = 3;
        }
      }

      // Fase 3 — mão e carta viram juntas
      if (fase === 3) {
        carta.rotation.x += (0 - carta.rotation.x) * 0.08;
        mao.rotation.x += (0 - mao.rotation.x) * 0.08;
        if (Math.abs(carta.rotation.x) < 0.05) {
          carta.rotation.x = 0;
          (scene as any).faseAnim = 4;
        }
      }

      // Fase 4 — carta cresce na frente da câmera
      if (fase === 4) {
        carta.scale.lerp(new Three.Vector3(5, 5, 5), 0.05);
        carta.position.y += (6.5 - carta.position.y) * 0.05;
        carta.position.z += (-8 - carta.position.z) * 0.05;
      }
    },
  });

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "white",
        fontSize: "24px",
        pointerEvents: "none",
        userSelect: "none",
      }}>
        +
      </div>
    </div>
  );
}
// Skeletal Hand by Jeremy Swan [CC-BY] via Poly Pizza  