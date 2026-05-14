    import * as Three from 'three';
    import { useThree } from './hooks/useThree';
    import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
    import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

    export default function ThreePortfolio() {
        const {mountRef} = useThree({
            onSetup: ({scene, camera, renderer}) => {
                
                // configuração inicial da cena, câmera e renderer
                scene.background = new Three.Color("#1a1a2e");
                camera.position.set(0, 2, 6);
                camera.lookAt(0, 0, 0);
                //luz 
                scene.add(new Three.AmbientLight(0xffffff, 0.8));
                const dir = new Three.DirectionalLight(0xffffff, 1);
                dir.position.set(5, 5, 5);
                scene.add(dir);
                //bola de luz
                const pointLight = new Three.PointLight(0xffffff, 1, 10);
                pointLight.position.set(0, 3, 0);
                pointLight.castShadow = true;
                scene.add(pointLight)
                const helper = new Three.PointLightHelper(pointLight, 0.3);
                scene.add(helper);                  
                //carta
                const CartaoGeo = new Three.PlaneGeometry(2, 3);
                const CartaMat = new Three.MeshStandardMaterial({color: 0xffffff, side : Three.DoubleSide});
                const Cartao = new Three.Mesh(CartaoGeo, CartaMat);
                scene.add(Cartao);
                //Detectar o clique da carta (Raycaster)
                const raycaster = new Three.Raycaster();
                const mouse = new Three.Vector2();

                const controls = new OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;

                renderer.shadowMap.enabled = true;
                dir.castShadow = true;

                window.addEventListener("click", (event) => {
                    //conversor de para 3d
                    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                    raycaster.setFromCamera(mouse, camera);
                    const hits = raycaster.intersectObject(Cartao);
                    
                    if(hits.length > 0){
                        //muda a cor da carta ao clicar por enquanto
                        (Cartao.material as Three.MeshStandardMaterial).color.set(0x5b8dee);
                        console.log("clicou na carta");
                    }
                });
                //braço esquerda e direita
                const loader = new GLTFLoader();
                loader.load("/Hand.glb", (gltf : GLTF) => {
                    const maoDireita = gltf.scene;
                    const maoEsquerda = gltf.scene.clone()

                    maoDireita.scale.set(0.150, 0.150, 0.150);
                    maoEsquerda.scale.set(0.150, 0.150, 0.150);      
                    
                    maoDireita.position.set(-4.989, 0.271, 1.612);
                    maoEsquerda.position.set(-4.989, 0.271, 0.065); 

                    scene.add(maoDireita);
                    scene.add(maoEsquerda);

                });
                //mesa
                loader.load("Table.glb", (gltf : GLTF) => {
                    const mesa = gltf.scene;
                    mesa.position.set(0.170, 0, 0.110);
                    mesa.scale.set(5, 5, 5);
                    scene.add(mesa);
                });

                (scene as any).controls = controls;
            },
            onAnimate: ({ scene }) => {
                (scene as any).controls?.update();
            },
        });
        return (
            <div
                ref = {mountRef}
                style={{width: "100vw" , height: "100vh", cursor: "pointer"}}
            />
        );
    }
    // Skeletal Hand by Jeremy Swan [CC-BY] via Poly Pizza
    // Table by Hunter Paramore [CC-BY] via Poly Pizza
    //Window Bars by Quaterniu