import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { CinematicUsdScene, MonkeyDigitalTwin } from '../types';
import {
  Compass,
  Layers,
  Wind,
  Eye,
  Maximize2,
  Minimize2,
  Box,
  Activity,
  Cpu,
  RefreshCw,
  Sparkles,
  Info,
  ShieldCheck
} from 'lucide-react';

interface OpenGlMonkeyStageProps {
  twin: MonkeyDigitalTwin;
  activeScene: CinematicUsdScene;
  windSpeedKmH: number;
  gustiness: number;
  windDirectionDeg: number;
  cameraAnglePreset?: string;
  isPlaying?: boolean;
  playbackSpeed?: number;
  showSkeletalRig?: boolean;
  showLiDARPointCloud?: boolean;
  enableSubsurfaceScattering?: boolean;
  enableAnisotropicFur?: boolean;
  isWidescreenScope?: boolean;
  showEthologyOverlay?: boolean;
}

export const OpenGlMonkeyStage: React.FC<OpenGlMonkeyStageProps> = ({
  twin,
  activeScene,
  windSpeedKmH,
  gustiness,
  windDirectionDeg,
  cameraAnglePreset = 'master-shot',
  isPlaying = true,
  playbackSpeed = 1,
  showSkeletalRig = false,
  showLiDARPointCloud = false,
  enableSubsurfaceScattering = true,
  enableAnisotropicFur = true,
  isWidescreenScope = true,
  showEthologyOverlay = true,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Interaction / Orbit state
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraOrbitRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 4.8,
    theta: 0.35,
    phi: 1.2,
  });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.4, 0));

  // Dynamic references for animated joints & particles
  const animatedRefs = useRef<{
    chestGroup: THREE.Group | null;
    headGroup: THREE.Group | null;
    tailSegments: THREE.Group[];
    palmFronds: THREE.Group[];
    petalsParticleSystem: THREE.Points | null;
    waterPlane: THREE.Mesh | null;
    sunLight: THREE.DirectionalLight | null;
    pointCloudMesh: THREE.Points | null;
    skeletalLines: THREE.LineSegments | null;
    furMeshGroup: THREE.Group | null;
  }>({
    chestGroup: null,
    headGroup: null,
    tailSegments: [],
    palmFronds: [],
    petalsParticleSystem: null,
    waterPlane: null,
    sunLight: null,
    pointCloudMesh: null,
    skeletalLines: null,
    furMeshGroup: null,
  });

  const [gpuInfo, setGpuInfo] = useState<string>('OpenGL ES 3.0 / WebGL2 Hardware Accelerated');
  const [fps, setFps] = useState<number>(60);
  const [activePreset, setActivePreset] = useState<string>(cameraAnglePreset);

  // Sync camera presets
  useEffect(() => {
    setActivePreset(cameraAnglePreset);
    const orbit = cameraOrbitRef.current;
    if (cameraAnglePreset === 'fur-macro' || cameraAnglePreset === 'angle-2') {
      orbit.radius = 2.4;
      orbit.theta = 0.5;
      orbit.phi = 1.35;
      cameraTargetRef.current.set(-0.35, 0.75, 0.2);
    } else if (cameraAnglePreset === 'lagoon-wide' || cameraAnglePreset === 'angle-3') {
      orbit.radius = 7.5;
      orbit.theta = -0.6;
      orbit.phi = 1.05;
      cameraTargetRef.current.set(0, 0, 0);
    } else if (cameraAnglePreset === 'bough-tracking' || cameraAnglePreset === 'angle-4') {
      orbit.radius = 3.6;
      orbit.theta = 1.8;
      orbit.phi = 1.6;
      cameraTargetRef.current.set(0.2, 0.2, 0);
    } else {
      // Master Cinematic Scope
      orbit.radius = 4.8;
      orbit.theta = 0.35;
      orbit.phi = 1.2;
      cameraTargetRef.current.set(0, 0.4, 0);
    }
  }, [cameraAnglePreset]);

  // Primary WebGL / OpenGL Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Create Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Tropical Pacific Horizon sky gradient simulation
    const skyColor = activeScene.id === 'pacific-sunset' ? 0x2e1065 : 0x075985;
    const groundColor = activeScene.id === 'pacific-sunset' ? 0x78350f : 0x064e3b;
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(skyColor, 0.045);

    const aspect = container.clientWidth / (container.clientWidth * (9 / 16));
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    cameraRef.current = camera;

    // 2. Create WebGL / OpenGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
      stencil: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientWidth * (9 / 16));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Clear old canvases
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Query GPU Vendor for Telemetry HUD
    try {
      const gl = renderer.getContext();
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (unmaskedRenderer) {
          setGpuInfo(unmaskedRenderer);
        }
      }
    } catch {
      // Non-blocking fallback
    }

    // 3. Lighting Setup (Tropical Equatorial Sun + Pacific Ocean Caustic Bounce)
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, groundColor, 1.4);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 3.2);
    sunLight.position.set(5, 9, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.camera.left = -4;
    sunLight.shadow.camera.right = 4;
    sunLight.shadow.camera.top = 4;
    sunLight.shadow.camera.bottom = -4;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);
    animatedRefs.current.sunLight = sunLight;

    // Rim / Kicker Light for Anisotropic Fur Sheen
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    // Fill Light for Dappled Forest Canopy
    const fillLight = new THREE.PointLight(0x10b981, 1.8, 12);
    fillLight.position.set(0, -1, 3);
    scene.add(fillLight);

    // 4. Pacific Ocean Water Surface (Below Canopy)
    const oceanGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.12,
      metalness: 0.85,
      transparent: true,
      opacity: 0.88,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.rotation.x = -Math.PI / 2;
    oceanMesh.position.y = -4.5;
    oceanMesh.receiveShadow = true;
    scene.add(oceanMesh);
    animatedRefs.current.waterPlane = oceanMesh;

    // 5. Ancient Marshallese Breadfruit (Artocarpus altilis) / Ironwood Canopy Bough
    const boughGroup = new THREE.Group();
    const branchCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6, -0.6, -1.2),
      new THREE.Vector3(-2.5, -0.1, -0.3),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(2.5, -0.2, 0.4),
      new THREE.Vector3(6, -0.8, 0.8),
    ]);
    const branchGeo = new THREE.TubeGeometry(branchCurve, 64, 0.38, 16, false);
    const branchMat = new THREE.MeshStandardMaterial({
      color: 0x3d271d,
      roughness: 0.88,
      metalness: 0.08,
      bumpScale: 0.08,
    });
    const branchMesh = new THREE.Mesh(branchGeo, branchMat);
    branchMesh.castShadow = true;
    branchMesh.receiveShadow = true;
    boughGroup.add(branchMesh);

    // Lichen & Tropical Moss on branch
    const mossGeo = new THREE.TubeGeometry(branchCurve, 32, 0.39, 12, false);
    const mossMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.95,
      metalness: 0.0,
      transparent: true,
      opacity: 0.45,
      wireframe: false,
    });
    const mossMesh = new THREE.Mesh(mossGeo, mossMat);
    boughGroup.add(mossMesh);
    scene.add(boughGroup);

    // 6. Swaying Coconut Palm Fronds & Hibiscus / Plumeria in Wind
    const floraGroup = new THREE.Group();
    const frondsList: THREE.Group[] = [];

    for (let f = 0; f < 6; f++) {
      const frond = new THREE.Group();
      const frondAngle = (f * Math.PI * 2) / 6;
      frond.position.set(Math.cos(frondAngle) * 3.2 - 1.5, 1.8 + Math.sin(f) * 0.4, Math.sin(frondAngle) * 2.5 - 1.0);

      // Palm rachis stem
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.08, 2.4, 8);
      stemGeo.translate(0, 1.2, 0);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.7 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.rotation.z = 0.6;
      frond.add(stemMesh);

      // Pinnate leaflets
      for (let l = 0.3; l < 2.2; l += 0.22) {
        const leafGeo = new THREE.PlaneGeometry(0.65, 0.12);
        const leafMat = new THREE.MeshStandardMaterial({
          color: activeScene.id === 'pacific-sunset' ? 0x854d0e : 0x166534,
          roughness: 0.55,
          side: THREE.DoubleSide,
        });
        const leaf1 = new THREE.Mesh(leafGeo, leafMat);
        leaf1.position.set(Math.sin(0.6) * l, Math.cos(0.6) * l, 0.1);
        leaf1.rotation.y = 0.4;
        frond.add(leaf1);

        const leaf2 = new THREE.Mesh(leafGeo, leafMat);
        leaf2.position.set(Math.sin(0.6) * l, Math.cos(0.6) * l, -0.1);
        leaf2.rotation.y = -0.4;
        frond.add(leaf2);
      }

      floraGroup.add(frond);
      frondsList.push(frond);
    }

    // Blooming Marshall Islands Hibiscus Flower
    const hibiscusGroup = new THREE.Group();
    hibiscusGroup.position.set(-1.8, 0.4, 0.3);
    for (let p = 0; p < 5; p++) {
      const petalGeo = new THREE.ConeGeometry(0.18, 0.45, 12);
      petalGeo.translate(0, 0.22, 0);
      const petalMat = new THREE.MeshStandardMaterial({
        color: 0xe11d48,
        roughness: 0.35,
        side: THREE.DoubleSide,
      });
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.rotation.z = Math.PI / 2;
      petal.rotation.y = (p * Math.PI * 2) / 5;
      hibiscusGroup.add(petal);
    }
    // Stamen tube
    const stamenGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.4, 8);
    stamenGeo.translate(0, 0.2, 0);
    const stamenMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.2 });
    const stamen = new THREE.Mesh(stamenGeo, stamenMat);
    stamen.rotation.x = Math.PI / 2;
    hibiscusGroup.add(stamen);
    floraGroup.add(hibiscusGroup);

    scene.add(floraGroup);
    animatedRefs.current.palmFronds = frondsList;

    // 7. Atmospheric Wind-Blown Tropical Petal & Pollen Particle System
    const petalCount = 450;
    const petalPositions = new Float32Array(petalCount * 3);
    const petalVelocities = new Float32Array(petalCount * 3);

    for (let i = 0; i < petalCount; i++) {
      petalPositions[i * 3] = (Math.random() - 0.5) * 16;
      petalPositions[i * 3 + 1] = Math.random() * 6 - 1.5;
      petalPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      petalVelocities[i * 3] = 0.5 + Math.random() * 1.5;
      petalVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      petalVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }

    const petalGeo = new THREE.BufferGeometry();
    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    const petalMat = new THREE.PointsMaterial({
      color: 0xfb7185,
      size: 0.09,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const petalSystem = new THREE.Points(petalGeo, petalMat);
    scene.add(petalSystem);
    animatedRefs.current.petalsParticleSystem = petalSystem;

    // =========================================================================
    // 8. FULL ARTICULATED 3D MONKEY DIGITAL TWIN (OPENGL THREE.JS RIG)
    // =========================================================================
    const monkeyHero = new THREE.Group();
    monkeyHero.position.set(0, 0.38, 0); // Perched naturally on the bough

    // Species-specific fur color & PBR physical parameters
    const furColorHex =
      twin.species.includes('Capuchin')
        ? 0x3d2817
        : twin.species.includes('Japanese')
        ? 0x8a705e
        : twin.species.includes('Squirrel')
        ? 0xca8a04
        : 0x54321c; // Rhesus Macaque golden-brown agouti

    const skinColorHex = 0xd97706; // Subsurface warm epidermis

    // PBR Physical Material for Primate Fur (with anisotropic sheen & transmission)
    const furMaterial = new THREE.MeshPhysicalMaterial({
      color: furColorHex,
      roughness: 0.68,
      metalness: 0.05,
      sheen: enableAnisotropicFur ? 0.95 : 0.0,
      sheenColor: new THREE.Color(0xfef08a),
      sheenRoughness: 0.4,
      clearcoat: 0.15,
      clearcoatRoughness: 0.2,
      reflectivity: 0.5,
    });

    // Subsurface Scattering Material for Ears & Face
    const sssSkinMaterial = new THREE.MeshPhysicalMaterial({
      color: skinColorHex,
      roughness: 0.42,
      metalness: 0.0,
      transmission: enableSubsurfaceScattering ? 0.25 : 0.0,
      thickness: 0.5,
      ior: 1.45,
      attenuationColor: new THREE.Color(0xf43f5e),
      attenuationDistance: 0.4,
    });

    // A. Torso & Abdomen Group
    const torsoGroup = new THREE.Group();
    const abdomenGeo = new THREE.CapsuleGeometry(0.32, 0.48, 12, 16);
    const abdomenMesh = new THREE.Mesh(abdomenGeo, furMaterial);
    abdomenMesh.castShadow = true;
    abdomenMesh.receiveShadow = true;
    abdomenMesh.rotation.z = 0.25; // Quadrupedal natural forward incline
    torsoGroup.add(abdomenMesh);

    // Chest & Respiration Thorax
    const chestGroup = new THREE.Group();
    chestGroup.position.set(-0.25, 0.28, 0);
    const chestGeo = new THREE.SphereGeometry(0.34, 16, 16);
    chestGeo.scale(1.1, 0.95, 0.9);
    const chestMesh = new THREE.Mesh(chestGeo, furMaterial);
    chestMesh.castShadow = true;
    chestGroup.add(chestMesh);
    torsoGroup.add(chestGroup);
    animatedRefs.current.chestGroup = chestGroup;

    // B. Anatomical Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(-0.55, 0.56, 0);

    // Cranium & Fur Crown
    const craniumGeo = new THREE.SphereGeometry(0.24, 18, 18);
    const craniumMesh = new THREE.Mesh(craniumGeo, furMaterial);
    craniumMesh.castShadow = true;
    headGroup.add(craniumMesh);

    // Facial Mask & Snout
    const muzzleGeo = new THREE.CylinderGeometry(0.09, 0.16, 0.22, 12);
    muzzleGeo.translate(0, 0.11, 0);
    const muzzleMesh = new THREE.Mesh(muzzleGeo, sssSkinMaterial);
    muzzleMesh.rotation.z = Math.PI / 2 + 0.15;
    muzzleMesh.position.set(-0.18, -0.04, 0);
    headGroup.add(muzzleMesh);

    // Nostrils
    const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x1f140e });
    const nostril1 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), nostrilMat);
    nostril1.position.set(-0.35, -0.02, 0.035);
    headGroup.add(nostril1);

    const nostril2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), nostrilMat);
    nostril2.position.set(-0.35, -0.02, -0.035);
    headGroup.add(nostril2);

    // Primate Orbital Sockets & Realistic Specular Eyes
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.1 });
    const irisMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.2, metalness: 0.1 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x020617 });

    const createEye = (zPos: number) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(-0.16, 0.08, zPos);

      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), eyeWhiteMat);
      eyeGroup.add(sclera);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), irisMat);
      iris.position.set(-0.025, 0, 0);
      eyeGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), pupilMat);
      pupil.position.set(-0.035, 0, 0);
      eyeGroup.add(pupil);

      return eyeGroup;
    };

    headGroup.add(createEye(0.09));
    headGroup.add(createEye(-0.09));

    // Cartilaginous Translucent Ears with SSS
    const createEar = (zPos: number, rotY: number) => {
      const earGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.02, 12);
      const earMesh = new THREE.Mesh(earGeo, sssSkinMaterial);
      earMesh.position.set(0.02, 0.08, zPos);
      earMesh.rotation.x = Math.PI / 2;
      earMesh.rotation.y = rotY;
      return earMesh;
    };

    headGroup.add(createEar(0.24, 0.3));
    headGroup.add(createEar(-0.24, -0.3));

    torsoGroup.add(headGroup);
    animatedRefs.current.headGroup = headGroup;

    // C. Forelimbs (Arms) gripping the Breadfruit Bough
    const createForelimb = (zPos: number) => {
      const limb = new THREE.Group();
      limb.position.set(-0.28, 0.16, zPos);

      // Upper arm
      const upperGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.38, 10);
      upperGeo.translate(0, -0.19, 0);
      const upperMesh = new THREE.Mesh(upperGeo, furMaterial);
      upperMesh.rotation.z = -0.35;
      limb.add(upperMesh);

      // Forearm & Paw grasping the branch
      const foreGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.32, 10);
      foreGeo.translate(0, -0.16, 0);
      const foreMesh = new THREE.Mesh(foreGeo, furMaterial);
      foreMesh.position.set(Math.sin(0.35) * 0.38, -Math.cos(0.35) * 0.38, 0);
      foreMesh.rotation.z = 0.45;
      limb.add(foreMesh);

      // Prehensile 5-digit hand wrapping branch
      const handMesh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), sssSkinMaterial);
      handMesh.position.set(
        Math.sin(0.35) * 0.38 - Math.sin(0.45) * 0.32,
        -Math.cos(0.35) * 0.38 - Math.cos(0.45) * 0.32,
        0
      );
      limb.add(handMesh);

      return limb;
    };

    torsoGroup.add(createForelimb(0.24));
    torsoGroup.add(createForelimb(-0.24));

    // D. Hindlimbs (Legs) anchored on Branch
    const createHindlimb = (zPos: number) => {
      const limb = new THREE.Group();
      limb.position.set(0.32, 0.05, zPos);

      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.42, 12);
      thighGeo.translate(0, -0.21, 0);
      const thighMesh = new THREE.Mesh(thighGeo, furMaterial);
      thighMesh.rotation.z = 0.55;
      limb.add(thighMesh);

      // Shin
      const shinGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.36, 10);
      shinGeo.translate(0, -0.18, 0);
      const shinMesh = new THREE.Mesh(shinGeo, furMaterial);
      shinMesh.position.set(-Math.sin(0.55) * 0.42, -Math.cos(0.55) * 0.42, 0);
      shinMesh.rotation.z = -0.5;
      limb.add(shinMesh);

      // Foot gripping
      const footMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.08), sssSkinMaterial);
      footMesh.position.set(
        -Math.sin(0.55) * 0.42 + Math.sin(0.5) * 0.36,
        -Math.cos(0.55) * 0.42 - Math.cos(0.5) * 0.36,
        0
      );
      limb.add(footMesh);

      return limb;
    };

    torsoGroup.add(createHindlimb(0.26));
    torsoGroup.add(createHindlimb(-0.26));

    // E. 12-Segment Articulated Dynamic Prehensile Tail (Forward Kinematics Chain)
    const tailSegments: THREE.Group[] = [];
    let currentParent: THREE.Group = torsoGroup;
    let baseOffset = new THREE.Vector3(0.42, 0.08, 0);

    const segmentCount = 12;
    for (let i = 0; i < segmentCount; i++) {
      const segmentGroup = new THREE.Group();
      if (i === 0) {
        segmentGroup.position.copy(baseOffset);
      } else {
        segmentGroup.position.set(0.14, 0, 0);
      }

      const taper = Math.max(0.018, 0.065 - (i / segmentCount) * 0.045);
      const segGeo = new THREE.CylinderGeometry(taper * 0.85, taper, 0.15, 8);
      segGeo.rotateZ(-Math.PI / 2);
      segGeo.translate(0.075, 0, 0);
      const segMesh = new THREE.Mesh(segGeo, furMaterial);
      segMesh.castShadow = true;
      segmentGroup.add(segMesh);

      currentParent.add(segmentGroup);
      currentParent = segmentGroup;
      tailSegments.push(segmentGroup);
    }
    animatedRefs.current.tailSegments = tailSegments;

    monkeyHero.add(torsoGroup);
    scene.add(monkeyHero);
    animatedRefs.current.furMeshGroup = monkeyHero;

    // F. Optional 3D LiDAR Hologram Point Cloud (for USD Digital Twin Scanning)
    const pointCloudGeo = new THREE.BufferGeometry();
    const ptsCount = 3500;
    const ptsPos = new Float32Array(ptsCount * 3);
    for (let i = 0; i < ptsCount; i++) {
      const r = Math.random() * 0.55;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      ptsPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      ptsPos[i * 3 + 1] = r * Math.cos(phi) + 0.35;
      ptsPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    pointCloudGeo.setAttribute('position', new THREE.BufferAttribute(ptsPos, 3));
    const pointCloudMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.035,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const pointCloudMesh = new THREE.Points(pointCloudGeo, pointCloudMat);
    pointCloudMesh.visible = showLiDARPointCloud;
    scene.add(pointCloudMesh);
    animatedRefs.current.pointCloudMesh = pointCloudMesh;

    // G. Skeletal Rig Visualizer Lines
    const skelMat = new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 2 });
    const skelGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.42, 0.08, 0),
      new THREE.Vector3(-0.25, 0.28, 0),
      new THREE.Vector3(-0.55, 0.56, 0),
      new THREE.Vector3(-0.28, -0.22, 0.24),
      new THREE.Vector3(-0.28, -0.22, -0.24),
      new THREE.Vector3(0.32, -0.32, 0.26),
      new THREE.Vector3(0.32, -0.32, -0.26),
    ]);
    const skelLines = new THREE.LineSegments(skelGeo, skelMat);
    skelLines.position.set(0, 0.38, 0);
    skelLines.visible = showSkeletalRig;
    scene.add(skelLines);
    animatedRefs.current.skeletalLines = skelLines;

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = w * (9 / 16);
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // 10. Mouse / Touch Orbit Event Handlers
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraOrbitRef.current.theta -= deltaX * 0.007;
      cameraOrbitRef.current.phi = Math.max(0.15, Math.min(Math.PI - 0.15, cameraOrbitRef.current.phi - deltaY * 0.007));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraOrbitRef.current.radius = Math.max(1.8, Math.min(10.0, cameraOrbitRef.current.radius + e.deltaY * 0.005));
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });

    // 11. Main OpenGL Animation Loop (60 FPS)
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = performance.now();

    const animate = (timeNow: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = (timeNow - lastTime) * 0.001 * playbackSpeed;
      lastTime = timeNow;

      // FPS Calculation
      frameCount++;
      if (timeNow - fpsTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsTime = timeNow;
      }

      if (!isPlaying) return;

      const elapsed = timeNow * 0.001;

      // Camera Orbit Position Calculation
      const { radius, theta, phi } = cameraOrbitRef.current;
      const target = cameraTargetRef.current;
      camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = target.y + radius * Math.cos(phi);
      camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(target);

      // Primate Breathing Respiration (Kinematic chest expansion)
      if (animatedRefs.current.chestGroup) {
        const breath = 1.0 + Math.sin(elapsed * 2.8) * 0.05;
        animatedRefs.current.chestGroup.scale.set(breath, breath, breath);
      }

      // Saccadic Head Micro-turns & Awareness
      if (animatedRefs.current.headGroup) {
        animatedRefs.current.headGroup.rotation.y = Math.sin(elapsed * 1.2) * 0.12 + Math.sin(elapsed * 3.7) * 0.04;
        animatedRefs.current.headGroup.rotation.x = Math.sin(elapsed * 0.8) * 0.06;
      }

      // Pacific Tradewind Physics & Ethology Profile Modulation
      const windNorm = Math.max(0.2, windSpeedKmH / 30);
      const windRad = (windDirectionDeg * Math.PI) / 180;
      const gust = Math.sin(elapsed * 4.0 + gustiness * 3) * gustiness * 0.5;
      const totalWindSway = windNorm + gust;

      // Swaying Coconut Palm Fronds
      animatedRefs.current.palmFronds.forEach((frond, idx) => {
        frond.rotation.z = Math.sin(elapsed * 2.5 * windNorm + idx) * 0.08 * totalWindSway;
        frond.rotation.y = Math.cos(windRad) * 0.1;
      });

      // Tail Ethology Chain Inverse Kinematics
      const ethPattern = twin.ethologyProfile?.tailLanguageRepertoire[0];
      const targetAngleDeg = ethPattern ? ethPattern.angleDegrees : 65;
      const twitchHz = ethPattern ? ethPattern.twitchFrequencyHz : 1.2;
      const curvature = ethPattern ? ethPattern.curvature : 0.4;
      const tailTwitch = Math.sin(elapsed * Math.PI * 2 * twitchHz) * (twitchHz > 0 ? 0.08 : 0.01);
      const windDeflection = Math.sin(elapsed * 3.5) * 0.06 * totalWindSway;

      const baseRad = (targetAngleDeg * Math.PI) / 180;
      const segmentPitch = (baseRad / segmentCount) * 0.8 + tailTwitch;
      const segmentRoll = (curvature * 0.15) + windDeflection;

      animatedRefs.current.tailSegments.forEach((seg, idx) => {
        seg.rotation.z = segmentPitch + Math.sin(elapsed * 4 + idx * 0.3) * 0.02;
        seg.rotation.y = segmentRoll;
      });

      // Tropical Petal / Pollen Particle Drift
      const petalSys = animatedRefs.current.petalsParticleSystem;
      if (petalSys) {
        const positions = petalSys.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < petalCount; i++) {
          positions[i * 3] += (0.025 + Math.random() * 0.01) * totalWindSway;
          positions[i * 3 + 1] += Math.sin(elapsed * 2 + i) * 0.005;

          // Wrap around boundary
          if (positions[i * 3] > 8) positions[i * 3] = -8;
          if (positions[i * 3 + 1] < -2) positions[i * 3] = 4;
        }
        petalSys.geometry.attributes.position.needsUpdate = true;
      }

      // Ocean Wave Surface Motion
      if (animatedRefs.current.waterPlane) {
        animatedRefs.current.waterPlane.position.y = -4.5 + Math.sin(elapsed * 1.5) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [activeScene.id, twin.species, showSkeletalRig, showLiDARPointCloud, enableSubsurfaceScattering, enableAnisotropicFur]);

  // Dynamic Visibility Updates for Shaders & Overlays
  useEffect(() => {
    if (animatedRefs.current.pointCloudMesh) {
      animatedRefs.current.pointCloudMesh.visible = showLiDARPointCloud;
    }
    if (animatedRefs.current.skeletalLines) {
      animatedRefs.current.skeletalLines.visible = showSkeletalRig;
    }
  }, [showLiDARPointCloud, showSkeletalRig]);

  return (
    <div className="relative w-full aspect-video bg-[#030712] rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl group select-none">
      {/* 3D WebGL / OpenGL Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 2.39:1 Anamorphic Scope Cinematic Bars */}
      {isWidescreenScope && (
        <>
          <div className="absolute top-0 left-0 right-0 h-[8.5%] bg-black/90 pointer-events-none z-10 flex items-center justify-between px-6">
            <span className="text-[10px] font-mono tracking-widest text-emerald-400/80 font-semibold">
              OPENGL 3D HARDWARE-ACCELERATED USD PIPELINE • 2.39:1 ANAMORPHIC SCOPE
            </span>
            <span className="text-[10px] font-mono tracking-wider text-slate-400">
              ACEScg • THREE.JS WEBGL2 • {fps} FPS
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[8.5%] bg-black/90 pointer-events-none z-10 flex items-center justify-between px-6">
            <span className="text-[10px] font-mono text-slate-400">
              PRIMA-RIG: {twin.name.toUpperCase()} ({twin.species})
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              PACIFIC TRADEWINDS: {windSpeedKmH} KM/H @ {windDirectionDeg}°
            </span>
          </div>
        </>
      )}

      {/* Top Left OpenGL Status & Camera Preset Pills */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-emerald-500/40 text-[11px] font-mono text-emerald-400 shadow-lg">
          <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>OPENGL 3D ACTIVE</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-300 font-bold">{fps} FPS</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md border border-slate-700/60 text-[11px] text-slate-300">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{gpuInfo.split('/')[0].trim().slice(0, 24)}</span>
        </div>
      </div>

      {/* Interactive Orbit Drag Helper Pill */}
      <div className="absolute bottom-5 left-4 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 pointer-events-none">
        <Compass className="w-3.5 h-3.5 text-cyan-400" />
        <span>Drag to orbit in 3D • Scroll to zoom • Right-click to pan</span>
      </div>

      {/* Ethological Telemetry HUD Vector Overlay */}
      {showEthologyOverlay && twin.ethologyProfile && (
        <div className="absolute top-14 right-4 z-20 max-w-xs w-72 rounded-xl bg-slate-950/90 backdrop-blur-md border border-purple-500/40 p-3.5 text-xs shadow-2xl animate-in fade-in slide-in-from-right-3">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-mono font-bold text-[10px] tracking-wider text-purple-300 uppercase">
                ETHOLOGY TELEMETRY (USD)
              </span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
              60 FPS IK
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Tail Repertoire:</span>
              <span className="text-emerald-400 font-semibold">
                {twin.ethologyProfile.tailLanguageRepertoire[0]?.postureName || 'Alert Stiffening'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Elevation Angle:</span>
              <span className="font-mono text-cyan-300">
                {twin.ethologyProfile.tailLanguageRepertoire[0]?.angleDegrees || 65}° Vertical
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Twitch Oscillation:</span>
              <span className="font-mono text-amber-300">
                {twin.ethologyProfile.tailLanguageRepertoire[0]?.twitchFrequencyHz || 1.2} Hz
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Acoustic F0:</span>
              <span className="font-mono text-fuchsia-300">
                {twin.ethologyProfile.vocalizationRepertoire[0]?.fundamentalFrequencyHz || 890} Hz
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tradewind Load:</span>
              <span className="font-mono text-sky-400">
                {windSpeedKmH} km/h (Trade Winds)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
