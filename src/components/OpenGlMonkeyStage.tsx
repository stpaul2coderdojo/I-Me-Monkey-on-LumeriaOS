import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CinematicUsdScene, MonkeyDigitalTwin } from '../types';
import { generate3dMeshFromImage } from '../utils/imageTo3dMesh';
import {
  Compass,
  Activity,
  Cpu,
  Sparkles,
  Layers,
  Wind,
  Box
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
  enablePhotorealMesh?: boolean;
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
  enablePhotorealMesh = true,
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
  const previousMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);

  const cameraOrbitRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 3.8,
    theta: 0.45,
    phi: 1.25,
  });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.42, 0));

  // Dynamic references for animated joints & scene fx
  const animatedRefs = useRef<{
    chestGroup: THREE.Group | null;
    headGroup: THREE.Group | null;
    tailSegments: THREE.Group[];
    foliageObjects: THREE.Object3D[];
    weatherParticles: THREE.Points | null;
    waterPlane: THREE.Mesh | null;
    lidarLaserRing: THREE.Mesh | null;
    turntableMesh: THREE.Group | null;
    pointCloudMesh: THREE.Points | null;
    skeletalGroup: THREE.Group | null;
    monkeyHero: THREE.Group | null;
    sunLight: THREE.DirectionalLight | null;
    photorealFaceMesh: THREE.Mesh | null;
    photorealSceneMesh: THREE.Mesh | null;
  }>({
    chestGroup: null,
    headGroup: null,
    tailSegments: [],
    foliageObjects: [],
    weatherParticles: null,
    waterPlane: null,
    lidarLaserRing: null,
    turntableMesh: null,
    pointCloudMesh: null,
    skeletalGroup: null,
    monkeyHero: null,
    sunLight: null,
    photorealFaceMesh: null,
    photorealSceneMesh: null,
  });

  const [gpuInfo, setGpuInfo] = useState<string>('OpenGL ES 3.0 / WebGL2 Hardware Accelerated');
  const [fps, setFps] = useState<number>(60);
  const [photorealStats, setPhotorealStats] = useState<{ active: boolean; primateVertices: number; sceneVertices: number } | null>(null);

  // Sync camera presets smoothly
  useEffect(() => {
    const orbit = cameraOrbitRef.current;
    const target = cameraTargetRef.current;

    const preset = (cameraAnglePreset || '').toLowerCase();
    if (preset.includes('macro') || preset.includes('close') || preset.includes('eye') || preset.includes('sss')) {
      orbit.radius = 1.9;
      orbit.theta = 0.35;
      orbit.phi = 1.3;
      target.set(-0.15, 0.72, 0.15);
    } else if (preset.includes('wide') || preset.includes('crane') || preset.includes('drone') || preset.includes('sweep')) {
      orbit.radius = 6.8;
      orbit.theta = -0.55;
      orbit.phi = 1.05;
      target.set(0, 0.3, 0);
    } else if (preset.includes('profile') || preset.includes('side')) {
      orbit.radius = 3.6;
      orbit.theta = 1.57;
      orbit.phi = 1.35;
      target.set(0, 0.45, 0);
    } else if (preset.includes('turntable') || preset.includes('orbit')) {
      orbit.radius = 3.5;
      orbit.theta = 0.8;
      orbit.phi = 1.25;
      target.set(0, 0.42, 0);
    } else if (preset.includes('low') || preset.includes('ascent')) {
      orbit.radius = 3.2;
      orbit.theta = 0.2;
      orbit.phi = 1.68;
      target.set(0, 0.5, 0);
    } else {
      // Master Cinematic 3/4 Scope View
      orbit.radius = 3.8;
      orbit.theta = 0.45;
      orbit.phi = 1.25;
      target.set(0, 0.42, 0);
    }
  }, [cameraAnglePreset]);

  // Primary WebGL / OpenGL Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Create Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const aspect = container.clientWidth / (container.clientWidth * (9 / 16));
    const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    cameraRef.current = camera;

    // 2. Create WebGL / OpenGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientWidth * (9 / 16));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = activeScene.id === 'volumetric-scan' ? 1.4 : 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

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

    // =========================================================================
    // 3. ENVIRONMENT & SKYDOME GENERATOR
    // =========================================================================
    const isVolumetric = activeScene.id === 'volumetric-scan';
    const isSunset = activeScene.id === 'pacific-sunset';
    const isMonsoon = activeScene.id === 'tropical-monsoon';
    const isDawn = activeScene.id === 'emerald-dawn';

    // Procedural Atmosphere Dome Canvas
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 512;
    skyCanvas.height = 256;
    const skyCtx = skyCanvas.getContext('2d');
    if (skyCtx) {
      const grad = skyCtx.createLinearGradient(0, 0, 0, 256);
      if (isVolumetric) {
        // High-tech Virtual Studio Cleanroom
        grad.addColorStop(0.0, '#030712');
        grad.addColorStop(0.5, '#090d1a');
        grad.addColorStop(0.85, '#1e1b4b');
        grad.addColorStop(1.0, '#0f172a');
      } else if (isSunset) {
        // Fiery Marshall Islands Sunset
        grad.addColorStop(0.0, '#1e1b4b');
        grad.addColorStop(0.35, '#581c87');
        grad.addColorStop(0.65, '#9a3412');
        grad.addColorStop(0.88, '#ea580c');
        grad.addColorStop(1.0, '#fbbf24');
      } else if (isMonsoon) {
        // Nocturnal Rainy Canopy & Bioluminescence
        grad.addColorStop(0.0, '#020617');
        grad.addColorStop(0.5, '#091e3a');
        grad.addColorStop(0.85, '#0f2942');
        grad.addColorStop(1.0, '#061325');
      } else if (isDawn) {
        // Equatorial Dawn Godrays
        grad.addColorStop(0.0, '#0369a1');
        grad.addColorStop(0.4, '#0284c7');
        grad.addColorStop(0.75, '#38bdf8');
        grad.addColorStop(0.92, '#fdba74');
        grad.addColorStop(1.0, '#fef08a');
      } else {
        // Sanctuary Awakening - Clear Pacific Midday
        grad.addColorStop(0.0, '#0284c7');
        grad.addColorStop(0.5, '#38bdf8');
        grad.addColorStop(0.85, '#7dd3fc');
        grad.addColorStop(1.0, '#bae6fd');
      }
      skyCtx.fillStyle = grad;
      skyCtx.fillRect(0, 0, 512, 256);
    }
    const skyTex = new THREE.CanvasTexture(skyCanvas);
    skyTex.colorSpace = THREE.SRGBColorSpace;

    const skyGeo = new THREE.SphereGeometry(45, 32, 20);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    // Subtle atmospheric distance fog matching sky horizon
    const fogColor = isVolumetric
      ? 0x090d1a
      : isSunset
      ? 0x9a3412
      : isMonsoon
      ? 0x061325
      : isDawn
      ? 0x38bdf8
      : 0x7dd3fc;
    scene.fog = new THREE.FogExp2(fogColor, isVolumetric ? 0.03 : 0.025);

    // =========================================================================
    // 4. LIGHTING RIG
    // =========================================================================
    const hemiLight = new THREE.HemisphereLight(
      isVolumetric ? 0x818cf8 : isSunset ? 0xfdba74 : isMonsoon ? 0x38bdf8 : 0xbae6fd,
      isVolumetric ? 0x020617 : isSunset ? 0x451a03 : isMonsoon ? 0x022c22 : 0x064e3b,
      isVolumetric ? 1.2 : 1.4
    );
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(
      isVolumetric ? 0xf8fafc : isSunset ? 0xffedd5 : isMonsoon ? 0x93c5fd : 0xfffbeb,
      isVolumetric ? 3.0 : isSunset ? 4.2 : isMonsoon ? 1.8 : 3.4
    );
    sunLight.position.set(isSunset ? 6 : 4, isSunset ? 4 : 8, isSunset ? 4 : 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.camera.left = -4;
    sunLight.shadow.camera.right = 4;
    sunLight.shadow.camera.top = 4;
    sunLight.shadow.camera.bottom = -4;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);
    animatedRefs.current.sunLight = sunLight;

    // Rim / Back Kicker Light for Anisotropic Fur
    const rimLight = new THREE.DirectionalLight(
      isVolumetric ? 0xa855f7 : isSunset ? 0xf97316 : isMonsoon ? 0x06b6d4 : 0x34d399,
      isVolumetric ? 3.2 : 2.6
    );
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    // Warm or Cool Key Bounce Light
    const fillLight = new THREE.PointLight(
      isVolumetric ? 0x38bdf8 : isSunset ? 0xf59e0b : isMonsoon ? 0x10b981 : 0x22c55e,
      isVolumetric ? 1.6 : 1.4,
      12
    );
    fillLight.position.set(0, -0.5, 3);
    scene.add(fillLight);

    // =========================================================================
    // 5. STAGE PROPS & ENVIRONMENT PERCH
    // =========================================================================
    if (isVolumetric) {
      // -------------------------------------------------------------
      // SCENE: VOLUMETRIC LIDAR SCAN & USD STUDIO RIG
      // -------------------------------------------------------------
      const studioGroup = new THREE.Group();

      // Procedural LiDAR Calibration Turntable Grid Texture
      const gridCanvas = document.createElement('canvas');
      gridCanvas.width = 1024;
      gridCanvas.height = 1024;
      const gCtx = gridCanvas.getContext('2d');
      if (gCtx) {
        gCtx.fillStyle = '#060a14';
        gCtx.fillRect(0, 0, 1024, 1024);

        // Concentric distance rings
        gCtx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        gCtx.lineWidth = 3;
        const radii = [120, 240, 360, 460];
        radii.forEach((r) => {
          gCtx.beginPath();
          gCtx.arc(512, 512, r, 0, Math.PI * 2);
          gCtx.stroke();
        });

        // Inner Cyan Alignment Ring
        gCtx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
        gCtx.lineWidth = 4;
        gCtx.beginPath();
        gCtx.arc(512, 512, 240, 0, Math.PI * 2);
        gCtx.stroke();

        // 360 Degree angle ticks
        for (let deg = 0; deg < 360; deg += 15) {
          const rad = (deg * Math.PI) / 180;
          const isMajor = deg % 45 === 0;
          const r1 = 460;
          const r2 = isMajor ? 490 : 475;
          gCtx.strokeStyle = isMajor ? 'rgba(236, 72, 153, 0.8)' : 'rgba(168, 85, 247, 0.4)';
          gCtx.lineWidth = isMajor ? 3 : 1.5;
          gCtx.beginPath();
          gCtx.moveTo(512 + Math.cos(rad) * r1, 512 + Math.sin(rad) * r1);
          gCtx.lineTo(512 + Math.cos(rad) * r2, 512 + Math.sin(rad) * r2);
          gCtx.stroke();
        }

        // Center Crosshair Target
        gCtx.strokeStyle = 'rgba(6, 182, 212, 0.9)';
        gCtx.lineWidth = 2;
        gCtx.beginPath();
        gCtx.moveTo(512 - 60, 512);
        gCtx.lineTo(512 + 60, 512);
        gCtx.moveTo(512, 512 - 60);
        gCtx.lineTo(512, 512 + 60);
        gCtx.stroke();
      }
      const gridTex = new THREE.CanvasTexture(gridCanvas);
      gridTex.colorSpace = THREE.SRGBColorSpace;

      // Turntable Cylinder Platform
      const ttGeo = new THREE.CylinderGeometry(2.1, 2.2, 0.16, 48);
      const ttMat = new THREE.MeshStandardMaterial({
        map: gridTex,
        roughness: 0.35,
        metalness: 0.7,
        bumpScale: 0.05,
      });
      const turntable = new THREE.Mesh(ttGeo, ttMat);
      turntable.position.set(0, -0.08, 0);
      turntable.receiveShadow = true;
      studioGroup.add(turntable);

      // Glowing Cyan Edge Ring
      const rimTorus = new THREE.Mesh(
        new THREE.TorusGeometry(2.12, 0.025, 16, 64),
        new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
      );
      rimTorus.rotation.x = Math.PI / 2;
      rimTorus.position.y = 0;
      studioGroup.add(rimTorus);

      // Outer Floor Studio Plane
      const studioFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshStandardMaterial({
          color: 0x020617,
          roughness: 0.85,
          metalness: 0.3,
        })
      );
      studioFloor.rotation.x = -Math.PI / 2;
      studioFloor.position.y = -0.16;
      studioFloor.receiveShadow = true;
      studioGroup.add(studioFloor);

      // Holographic 3D Spatial Coordinate Axes
      const axesGroup = new THREE.Group();
      axesGroup.position.set(1.4, 0.05, -1.4);
      const axisLen = 0.45;
      const xLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(axisLen, 0, 0)]),
        new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 })
      );
      const yLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, axisLen, 0)]),
        new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 3 })
      );
      const zLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, axisLen)]),
        new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 3 })
      );
      axesGroup.add(xLine, yLine, zLine);
      studioGroup.add(axesGroup);

      // Animated Vertical LiDAR Laser Sweep Disc
      const laserRingGeo = new THREE.RingGeometry(0.1, 1.4, 32);
      const laserRingMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const laserRing = new THREE.Mesh(laserRingGeo, laserRingMat);
      laserRing.rotation.x = Math.PI / 2;
      laserRing.position.set(0, 0.4, 0);
      studioGroup.add(laserRing);
      animatedRefs.current.lidarLaserRing = laserRing;

      // Holographic Bounding Box
      const bboxGeo = new THREE.BoxGeometry(1.6, 1.3, 1.5);
      const bboxEdges = new THREE.EdgesGeometry(bboxGeo);
      const bboxLines = new THREE.LineSegments(
        bboxEdges,
        new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.4 })
      );
      bboxLines.position.set(0, 0.65, 0);
      studioGroup.add(bboxLines);

      scene.add(studioGroup);
      animatedRefs.current.turntableMesh = studioGroup;
    } else {
      // -------------------------------------------------------------
      // SCENE: NATURE CANOPY PERCH (DAWN / SUNSET / MONSOON / SANCTUARY)
      // -------------------------------------------------------------
      const natureGroup = new THREE.Group();

      // Pacific Ocean Below
      if (isSunset || isDawn) {
        const oceanGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
        const oceanMat = new THREE.MeshStandardMaterial({
          color: isSunset ? 0xb45309 : 0x0284c7,
          roughness: 0.15,
          metalness: 0.8,
          transparent: true,
          opacity: 0.9,
        });
        const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
        oceanMesh.rotation.x = -Math.PI / 2;
        oceanMesh.position.y = -3.8;
        oceanMesh.receiveShadow = true;
        natureGroup.add(oceanMesh);
        animatedRefs.current.waterPlane = oceanMesh;
      }

      // Ancient Marshallese Breadfruit / Ironwood Bough Perch
      const branchCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-4.5, -0.2, -0.6),
        new THREE.Vector3(-2.2, 0.1, -0.2),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(2.2, -0.15, 0.3),
        new THREE.Vector3(4.5, -0.4, 0.7),
      ]);
      const branchGeo = new THREE.TubeGeometry(branchCurve, 48, 0.36, 14, false);
      const branchMat = new THREE.MeshStandardMaterial({
        color: isMonsoon ? 0x271a14 : 0x452a1c,
        roughness: isMonsoon ? 0.45 : 0.88,
        metalness: 0.05,
      });
      const branchMesh = new THREE.Mesh(branchGeo, branchMat);
      branchMesh.castShadow = true;
      branchMesh.receiveShadow = true;
      natureGroup.add(branchMesh);

      // Moss & Epiphytic Lichen Layers on Branch
      const mossGeo = new THREE.TubeGeometry(branchCurve, 32, 0.375, 10, false);
      const mossMat = new THREE.MeshStandardMaterial({
        color: isMonsoon ? 0x059669 : 0x16a34a,
        roughness: 0.95,
        transparent: true,
        opacity: 0.6,
      });
      const mossMesh = new THREE.Mesh(mossGeo, mossMat);
      natureGroup.add(mossMesh);

      // Secondary Cross Branch
      const subCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.2, 0.05, -0.1),
        new THREE.Vector3(-0.6, 0.6, -1.8),
        new THREE.Vector3(0.4, 1.1, -3.2),
      ]);
      const subGeo = new THREE.TubeGeometry(subCurve, 24, 0.22, 10, false);
      const subMesh = new THREE.Mesh(subGeo, branchMat);
      subMesh.castShadow = true;
      natureGroup.add(subMesh);

      // Tropical Palm Trees & Foliage in Background
      const foliageObjects: THREE.Object3D[] = [];
      const createPalmFrond = (x: number, y: number, z: number, scale: number, rotY: number) => {
        const frondGroup = new THREE.Group();
        frondGroup.position.set(x, y, z);
        frondGroup.rotation.y = rotY;
        frondGroup.scale.set(scale, scale, scale);

        // Arching Stem
        const stemCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.8, 0.5, 0),
          new THREE.Vector3(1.8, 0.3, 0),
          new THREE.Vector3(2.6, -0.4, 0),
        ]);
        const stem = new THREE.Mesh(
          new THREE.TubeGeometry(stemCurve, 16, 0.04, 6, false),
          new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.7 })
        );
        frondGroup.add(stem);

        // Pinnate Leaflets
        for (let l = 0.4; l <= 2.4; l += 0.22) {
          const leafMat = new THREE.MeshStandardMaterial({
            color: isSunset ? 0x854d0e : 0x15803d,
            roughness: 0.5,
            side: THREE.DoubleSide,
          });
          const leafGeo = new THREE.PlaneGeometry(0.55, 0.1);
          const leaf1 = new THREE.Mesh(leafGeo, leafMat);
          leaf1.position.set(l * 0.9, Math.sin(l) * 0.3, 0.15);
          leaf1.rotation.y = 0.5;
          leaf1.rotation.z = -0.3;
          frondGroup.add(leaf1);

          const leaf2 = new THREE.Mesh(leafGeo, leafMat);
          leaf2.position.set(l * 0.9, Math.sin(l) * 0.3, -0.15);
          leaf2.rotation.y = -0.5;
          leaf2.rotation.z = -0.3;
          frondGroup.add(leaf2);
        }

        natureGroup.add(frondGroup);
        foliageObjects.push(frondGroup);
      };

      createPalmFrond(-2.6, 1.4, -1.8, 1.2, 0.4);
      createPalmFrond(2.2, 1.1, -2.1, 1.1, -0.6);
      createPalmFrond(-0.8, 2.1, -3.2, 1.4, 1.1);

      // Tropical Plumeria / Hibiscus Blossoms on Branch
      const createFlower = (x: number, y: number, z: number, colorHex: number) => {
        const flowerGroup = new THREE.Group();
        flowerGroup.position.set(x, y, z);

        for (let i = 0; i < 5; i++) {
          const petalGeo = new THREE.SphereGeometry(0.09, 8, 8);
          petalGeo.scale(1.0, 0.3, 2.2);
          const petalMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            roughness: 0.3,
            side: THREE.DoubleSide,
          });
          const petal = new THREE.Mesh(petalGeo, petalMat);
          petal.rotation.y = (i * Math.PI * 2) / 5;
          petal.position.set(Math.cos((i * Math.PI * 2) / 5) * 0.08, 0, Math.sin((i * Math.PI * 2) / 5) * 0.08);
          flowerGroup.add(petal);
        }

        // Center Pistil
        const center = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2 })
        );
        flowerGroup.add(center);

        natureGroup.add(flowerGroup);
      };

      createFlower(-1.6, 0.25, 0.2, 0xf43f5e);
      createFlower(-1.4, 0.28, 0.35, 0xffedd5);
      createFlower(1.8, -0.05, 0.3, 0xfb7185);

      scene.add(natureGroup);
      animatedRefs.current.foliageObjects = foliageObjects;

      // -------------------------------------------------------------
      // PHOTOREALISTIC 3D CANOPY / TERRAIN ENVIRONMENT MESH FROM SCENE IMAGE
      // -------------------------------------------------------------
      if (enablePhotorealMesh && activeScene.highResImageUrl) {
        generate3dMeshFromImage({
          imageSrc: activeScene.highResImageUrl,
          segmentsX: 96,
          segmentsY: 72,
          depthScale: 0.95,
          curvature: 0.16,
          radialFalloff: false,
          meshWidth: 16.0,
          meshHeight: 9.2,
        })
          .then((res) => {
            if (!scene) return;
            const scenePbrMat = new THREE.MeshPhysicalMaterial({
              map: res.diffuseTexture,
              normalMap: res.normalTexture,
              normalScale: new THREE.Vector2(1.8, 1.8),
              roughnessMap: res.roughnessTexture,
              roughness: 0.7,
              metalness: 0.08,
              clearcoat: isMonsoon ? 0.45 : 0.05,
              clearcoatRoughness: 0.2,
              side: THREE.DoubleSide,
            });
            const sceneMesh = new THREE.Mesh(res.geometry, scenePbrMat);
            sceneMesh.position.set(0, 2.0, -5.6);
            sceneMesh.receiveShadow = true;
            natureGroup.add(sceneMesh);
            animatedRefs.current.photorealSceneMesh = sceneMesh;
            setPhotorealStats((prev) => ({
              active: true,
              primateVertices: prev?.primateVertices || 0,
              sceneVertices: res.vertexCount,
            }));
          })
          .catch((err) => {
            console.warn('Could not generate 3D scene mesh from image:', err);
          });
      }
    }

    // =========================================================================
    // 6. ATMOSPHERIC WEATHER & PARTICLE SIMULATION
    // =========================================================================
    const particleCount = isMonsoon ? 600 : isVolumetric ? 300 : 350;
    const pPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 14;
      pPositions[i * 3 + 1] = Math.random() * 7 - 1.0;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

    const pMat = new THREE.PointsMaterial({
      color: isMonsoon ? 0x67e8f9 : isSunset ? 0xfdba74 : isVolumetric ? 0xa855f7 : 0xfde047,
      size: isMonsoon ? 0.06 : isVolumetric ? 0.035 : 0.05,
      transparent: true,
      opacity: isMonsoon ? 0.85 : 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(pGeo, pMat);
    scene.add(particleSystem);
    animatedRefs.current.weatherParticles = particleSystem;

    // =========================================================================
    // 7. ARTICULATED 3D MONKEY DIGITAL TWIN (HIGH-FIDELITY PRIMATE RIG)
    // =========================================================================
    const monkeyHero = new THREE.Group();
    // Position securely on branch / studio platform
    monkeyHero.position.set(0, isVolumetric ? 0.02 : 0.22, 0);

    // Species-specific fur & skin shading
    const speciesLower = (twin.species || '').toLowerCase();
    const isChimp = speciesLower.includes('chimp');
    const isCapuchin = speciesLower.includes('capuchin');

    const furColorHex = isChimp
      ? 0x1c1917 // Chimpanzee deep charcoal coat
      : isCapuchin
      ? 0x3d2817 // Capuchin warm bistre
      : 0x654321; // Rhesus Macaque golden-brown agouti

    const skinColorHex = isChimp
      ? 0xc2a48a // Pale tan epidermis
      : 0xd97706; // Warm macaque amber epidermis

    // PBR Physical Material for Primate Fur
    const furMaterial = new THREE.MeshPhysicalMaterial({
      color: furColorHex,
      roughness: 0.65,
      metalness: 0.05,
      sheen: enableAnisotropicFur ? 0.95 : 0.0,
      sheenColor: new THREE.Color(isSunset ? 0xfdba74 : isVolumetric ? 0xa855f7 : 0xfde047),
      sheenRoughness: 0.35,
      clearcoat: isMonsoon ? 0.8 : 0.12,
      clearcoatRoughness: isMonsoon ? 0.1 : 0.3,
    });

    // Subsurface Scattering Epidermis Material for Face, Ears, Hands
    const skinMaterial = new THREE.MeshPhysicalMaterial({
      color: skinColorHex,
      roughness: 0.4,
      metalness: 0.0,
      transmission: enableSubsurfaceScattering ? 0.2 : 0.0,
      thickness: 0.4,
      ior: 1.45,
      attenuationColor: new THREE.Color(0xf43f5e),
      attenuationDistance: 0.3,
    });

    // Skeletal Rig debug lines tracker
    const skeletalJoints: THREE.Vector3[] = [];

    // -------------------------------------------------------------
    // A. TORSO & SPINE HIERARCHY
    // -------------------------------------------------------------
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.48, 0);

    // Pelvis & Lumbar Base
    const pelvisGeo = new THREE.SphereGeometry(0.26, 16, 16);
    pelvisGeo.scale(1.0, 0.85, 1.15);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, furMaterial);
    pelvisMesh.castShadow = true;
    torsoGroup.add(pelvisMesh);
    skeletalJoints.push(new THREE.Vector3(0, 0.48, -0.2));

    // Abdominal core
    const abdomenGeo = new THREE.CapsuleGeometry(0.24, 0.28, 12, 16);
    abdomenGeo.rotateX(Math.PI / 4);
    const abdomenMesh = new THREE.Mesh(abdomenGeo, furMaterial);
    abdomenMesh.position.set(0, 0.12, 0.1);
    abdomenMesh.castShadow = true;
    torsoGroup.add(abdomenMesh);

    // Chest & Respiration Thorax (Clavicle Girdle)
    const chestGroup = new THREE.Group();
    chestGroup.position.set(0, 0.26, 0.22);
    const chestGeo = new THREE.SphereGeometry(0.27, 18, 18);
    chestGeo.scale(1.05, 0.95, 1.15);
    const chestMesh = new THREE.Mesh(chestGeo, furMaterial);
    chestMesh.castShadow = true;
    chestGroup.add(chestMesh);
    torsoGroup.add(chestGroup);
    animatedRefs.current.chestGroup = chestGroup;
    skeletalJoints.push(new THREE.Vector3(0, 0.74, 0.22));

    // -------------------------------------------------------------
    // B. ANATOMICAL PRIMATE HEAD & FACIAL MASK
    // -------------------------------------------------------------
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.25, 0.24); // Rests atop neck/chest

    // Cranium with natural primate skull shape
    const craniumGeo = new THREE.SphereGeometry(0.21, 20, 20);
    craniumGeo.scale(0.96, 1.02, 1.06);
    const craniumMesh = new THREE.Mesh(craniumGeo, furMaterial);
    craniumMesh.castShadow = true;
    headGroup.add(craniumMesh);
    skeletalJoints.push(new THREE.Vector3(0, 0.99, 0.46));

    // Simian Brow Ridge (Supraorbital Torus)
    const browTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.028, 10, 16, Math.PI),
      skinMaterial
    );
    browTorus.rotation.x = -Math.PI / 2 + 0.3;
    browTorus.position.set(0, 0.07, 0.16);
    headGroup.add(browTorus);

    // Facial Disk & Cheekbones
    const faceDiskGeo = new THREE.SphereGeometry(0.16, 16, 16);
    faceDiskGeo.scale(0.9, 0.88, 0.65);
    const faceDisk = new THREE.Mesh(faceDiskGeo, skinMaterial);
    faceDisk.position.set(0, -0.02, 0.13);
    headGroup.add(faceDisk);

    // -------------------------------------------------------------
    // PHOTOREALISTIC 3D PRIMATE FACIAL/HEAD MESH FROM PORTRAIT IMAGE
    // -------------------------------------------------------------
    if (enablePhotorealMesh && twin.imageUrl) {
      generate3dMeshFromImage({
        imageSrc: twin.imageUrl,
        segmentsX: 72,
        segmentsY: 72,
        depthScale: 0.16,
        curvature: 0.58,
        radialFalloff: true,
        meshWidth: 0.36,
        meshHeight: 0.38,
      })
        .then((res) => {
          if (!headGroup) return;
          const photoPbrMat = new THREE.MeshPhysicalMaterial({
            map: res.diffuseTexture,
            normalMap: res.normalTexture,
            normalScale: new THREE.Vector2(2.0, 2.0),
            roughnessMap: res.roughnessTexture,
            roughness: 0.52,
            metalness: 0.04,
            sheen: enableAnisotropicFur ? 0.95 : 0.0,
            sheenColor: new THREE.Color(isSunset ? 0xfdba74 : 0xfde047),
            sheenRoughness: 0.35,
            transmission: enableSubsurfaceScattering ? 0.16 : 0.0,
            side: THREE.DoubleSide,
          });
          const photoFaceMesh = new THREE.Mesh(res.geometry, photoPbrMat);
          photoFaceMesh.position.set(0, -0.015, 0.165);
          photoFaceMesh.castShadow = true;
          headGroup.add(photoFaceMesh);
          animatedRefs.current.photorealFaceMesh = photoFaceMesh;
          setPhotorealStats((prev) => ({
            active: true,
            primateVertices: res.vertexCount,
            sceneVertices: prev?.sceneVertices || 0,
          }));
        })
        .catch((err) => {
          console.warn('Could not generate 3D primate face mesh from image:', err);
        });
    }

    // Primate Rounded Muzzle / Snout (Natural simian contour)
    const snoutGeo = new THREE.CapsuleGeometry(0.075, 0.09, 10, 14);
    snoutGeo.rotateX(Math.PI / 2);
    const snoutMesh = new THREE.Mesh(snoutGeo, skinMaterial);
    snoutMesh.position.set(0, -0.075, 0.22);
    headGroup.add(snoutMesh);

    // Nostrils
    const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x1f140e });
    const nostril1 = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), nostrilMat);
    nostril1.position.set(0.028, -0.065, 0.315);
    headGroup.add(nostril1);

    const nostril2 = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), nostrilMat);
    nostril2.position.set(-0.028, -0.065, 0.315);
    headGroup.add(nostril2);

    // Expressive Simian Eyes (Binocular Forward Vision)
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1 });
    const irisMat = new THREE.MeshStandardMaterial({ color: 0x5c2b0e, roughness: 0.25 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const corneaMat = new THREE.MeshPhysicalMaterial({
      roughness: 0.05,
      transmission: 0.95,
      thickness: 0.1,
      ior: 1.336,
      transparent: true,
      opacity: 0.7,
    });

    const createSimianEye = (xPos: number) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(xPos, 0.045, 0.18);

      // Sclera
      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), eyeWhiteMat);
      eyeGroup.add(sclera);

      // Iris
      const iris = new THREE.Mesh(new THREE.CircleGeometry(0.022, 14), irisMat);
      iris.position.set(0, 0, 0.036);
      eyeGroup.add(iris);

      // Pupil
      const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.012, 12), pupilMat);
      pupil.position.set(0, 0, 0.038);
      eyeGroup.add(pupil);

      // Specular corneal glint
      const cornea = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), corneaMat);
      eyeGroup.add(cornea);

      return eyeGroup;
    };

    headGroup.add(createSimianEye(0.068));
    headGroup.add(createSimianEye(-0.068));

    // Primate Lateral Auricles (Shaped Simian Ears with Helix & Concha)
    const createPrimateEar = (isRight: boolean) => {
      const earGroup = new THREE.Group();
      const xOffset = isRight ? 0.2 : -0.2;
      earGroup.position.set(xOffset, 0.03, 0.02);
      earGroup.rotation.y = isRight ? 0.35 : -0.35;

      // Outer Helix Rim
      const helix = new THREE.Mesh(
        new THREE.TorusGeometry(0.065, 0.016, 8, 16, Math.PI * 1.3),
        skinMaterial
      );
      helix.rotation.z = isRight ? -0.4 : 0.4;
      earGroup.add(helix);

      // Inner Concha Cup
      const concha = new THREE.Mesh(
        new THREE.CircleGeometry(0.052, 12),
        skinMaterial
      );
      concha.rotation.y = isRight ? -Math.PI / 2 : Math.PI / 2;
      earGroup.add(concha);

      return earGroup;
    };

    headGroup.add(createPrimateEar(true));
    headGroup.add(createPrimateEar(false));

    chestGroup.add(headGroup);
    animatedRefs.current.headGroup = headGroup;

    // -------------------------------------------------------------
    // C. ARTICULATED FORELIMBS (ARMS & 5-DIGIT PREHENSILE HANDS)
    // -------------------------------------------------------------
    const createForelimb = (isRight: boolean) => {
      const limbGroup = new THREE.Group();
      const xSide = isRight ? 0.22 : -0.22;
      limbGroup.position.set(xSide, 0.08, 0.12);

      // Shoulder ball
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), furMaterial);
      limbGroup.add(shoulder);

      // Upper arm (Humerus)
      const upperGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.32, 10);
      upperGeo.translate(0, -0.16, 0);
      const upperMesh = new THREE.Mesh(upperGeo, furMaterial);
      upperMesh.rotation.x = -0.35; // Forward angle
      upperMesh.rotation.z = isRight ? -0.15 : 0.15;
      limbGroup.add(upperMesh);

      // Forearm Group (Radius/Ulna) anchored at elbow
      const forearmGroup = new THREE.Group();
      forearmGroup.position.set(
        isRight ? 0.04 : -0.04,
        -0.32 * Math.cos(0.35),
        0.32 * Math.sin(0.35)
      );

      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), furMaterial);
      forearmGroup.add(elbow);

      const foreGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.28, 10);
      foreGeo.translate(0, -0.14, 0);
      const foreMesh = new THREE.Mesh(foreGeo, furMaterial);
      foreMesh.rotation.x = 0.45; // Angles down to branch
      forearmGroup.add(foreMesh);

      // Dexterous 5-Digit Hand at Wrist
      const handGroup = new THREE.Group();
      handGroup.position.set(0, -0.28 * Math.cos(0.45), -0.28 * Math.sin(0.45));

      // Palm pad
      const palmMesh = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), skinMaterial);
      palmMesh.scale.set(1.1, 0.55, 1.2);
      handGroup.add(palmMesh);

      // Curved Digits Grasping Perch
      for (let d = -1.5; d <= 1.5; d += 1.0) {
        const fingerGeo = new THREE.CapsuleGeometry(0.014, 0.07, 6, 8);
        fingerGeo.rotateX(Math.PI / 3);
        const fingerMesh = new THREE.Mesh(fingerGeo, skinMaterial);
        fingerMesh.position.set(d * 0.024, -0.02, 0.05);
        handGroup.add(fingerMesh);
      }

      // Opposable Thumb (Pollex)
      const thumbGeo = new THREE.CapsuleGeometry(0.015, 0.05, 6, 8);
      thumbGeo.rotateZ(isRight ? -Math.PI / 3 : Math.PI / 3);
      const thumb = new THREE.Mesh(thumbGeo, skinMaterial);
      thumb.position.set(isRight ? -0.04 : 0.04, -0.01, 0.02);
      handGroup.add(thumb);

      forearmGroup.add(handGroup);
      limbGroup.add(forearmGroup);

      return limbGroup;
    };

    chestGroup.add(createForelimb(true));
    chestGroup.add(createForelimb(false));

    // -------------------------------------------------------------
    // D. ARTICULATED HINDLIMBS (LEGS & PREHENSILE GRASPING FEET)
    // -------------------------------------------------------------
    const createHindlimb = (isRight: boolean) => {
      const limbGroup = new THREE.Group();
      const xSide = isRight ? 0.2 : -0.2;
      limbGroup.position.set(xSide, -0.05, -0.15);

      // Hip ball joint
      const hip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), furMaterial);
      limbGroup.add(hip);

      // Muscular Primate Thigh (Femur)
      const thighGeo = new THREE.CylinderGeometry(0.095, 0.07, 0.36, 12);
      thighGeo.translate(0, -0.18, 0);
      const thighMesh = new THREE.Mesh(thighGeo, furMaterial);
      thighMesh.rotation.x = 0.55; // Natural seated quadrupedal posture
      thighMesh.rotation.z = isRight ? 0.2 : -0.2;
      limbGroup.add(thighMesh);

      // Shin Group (Tibia/Fibula) anchored at knee
      const shinGroup = new THREE.Group();
      shinGroup.position.set(
        isRight ? 0.06 : -0.06,
        -0.36 * Math.cos(0.55),
        -0.36 * Math.sin(0.55)
      );

      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), furMaterial);
      shinGroup.add(knee);

      const shinGeo = new THREE.CylinderGeometry(0.07, 0.05, 0.32, 10);
      shinGeo.translate(0, -0.16, 0);
      const shinMesh = new THREE.Mesh(shinGeo, furMaterial);
      shinMesh.rotation.x = -0.65; // Angles forward/down to perch
      shinGroup.add(shinMesh);

      // Grasping Foot with Opposable Hallux
      const footGroup = new THREE.Group();
      footGroup.position.set(0, -0.32 * Math.cos(0.65), 0.32 * Math.sin(0.65));

      const soleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.04, 0.16), skinMaterial);
      soleMesh.position.set(0, -0.02, 0.03);
      footGroup.add(soleMesh);

      // Toes gripping branch
      for (let t = -1.5; t <= 1.5; t += 1.0) {
        const toeGeo = new THREE.CapsuleGeometry(0.013, 0.05, 6, 6);
        toeGeo.rotateX(Math.PI / 4);
        const toe = new THREE.Mesh(toeGeo, skinMaterial);
        toe.position.set(t * 0.02, -0.02, 0.12);
        footGroup.add(toe);
      }

      shinGroup.add(footGroup);
      limbGroup.add(shinGroup);

      return limbGroup;
    };

    torsoGroup.add(createHindlimb(true));
    torsoGroup.add(createHindlimb(false));

    // -------------------------------------------------------------
    // E. 14-SEGMENT PREHENSILE ARTICULATED TAIL (IK CHAIN)
    // -------------------------------------------------------------
    const tailSegments: THREE.Group[] = [];
    if (!isChimp) {
      let currentParent: THREE.Group = torsoGroup;
      const segmentCount = 14;

      for (let s = 0; s < segmentCount; s++) {
        const segmentGroup = new THREE.Group();
        if (s === 0) {
          segmentGroup.position.set(0, -0.05, -0.28); // Rooted at sacrum
        } else {
          segmentGroup.position.set(0, 0.02, -0.11);
        }

        const taper = Math.max(0.016, 0.055 - (s / segmentCount) * 0.04);
        const segGeo = new THREE.CylinderGeometry(taper * 0.85, taper, 0.12, 8);
        segGeo.rotateX(Math.PI / 2);
        const segMesh = new THREE.Mesh(segGeo, furMaterial);
        segMesh.castShadow = true;
        segmentGroup.add(segMesh);

        currentParent.add(segmentGroup);
        currentParent = segmentGroup;
        tailSegments.push(segmentGroup);
      }
    }
    animatedRefs.current.tailSegments = tailSegments;

    // Face the monkey slightly towards camera for optimal 3/4 cinematic composition
    monkeyHero.rotation.y = 0.45;
    monkeyHero.add(torsoGroup);
    scene.add(monkeyHero);
    animatedRefs.current.monkeyHero = monkeyHero;

    // -------------------------------------------------------------
    // F. OPTIONAL LIDAR 3D HOLOGRAM POINT CLOUD (3,500 PTS)
    // -------------------------------------------------------------
    const pointCloudGeo = new THREE.BufferGeometry();
    const ptsCount = 3500;
    const ptsPos = new Float32Array(ptsCount * 3);
    for (let i = 0; i < ptsCount; i++) {
      const r = Math.random() * 0.52;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      ptsPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      ptsPos[i * 3 + 1] = r * Math.cos(phi) + 0.42;
      ptsPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    pointCloudGeo.setAttribute('position', new THREE.BufferAttribute(ptsPos, 3));
    const pointCloudMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.032,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const pointCloudMesh = new THREE.Points(pointCloudGeo, pointCloudMat);
    pointCloudMesh.visible = showLiDARPointCloud;
    scene.add(pointCloudMesh);
    animatedRefs.current.pointCloudMesh = pointCloudMesh;

    // -------------------------------------------------------------
    // G. SKELETAL RIG DEBUG VISUALIZER
    // -------------------------------------------------------------
    const skeletalGroup = new THREE.Group();
    skeletalGroup.position.set(0, isVolumetric ? 0.02 : 0.22, 0);
    skeletalGroup.rotation.y = 0.45;

    const boneMat = new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 2 });
    const jointMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });

    const createBoneLine = (p1: THREE.Vector3, p2: THREE.Vector3) => {
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([p1, p2]),
        boneMat
      );
      skeletalGroup.add(line);
      const jointMesh = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), jointMat);
      jointMesh.position.copy(p1);
      skeletalGroup.add(jointMesh);
    };

    createBoneLine(new THREE.Vector3(0, 0.48, -0.2), new THREE.Vector3(0, 0.74, 0.22));
    createBoneLine(new THREE.Vector3(0, 0.74, 0.22), new THREE.Vector3(0, 0.99, 0.46));
    createBoneLine(new THREE.Vector3(0, 0.74, 0.22), new THREE.Vector3(0.24, 0.42, 0.4));
    createBoneLine(new THREE.Vector3(0, 0.74, 0.22), new THREE.Vector3(-0.24, 0.42, 0.4));
    createBoneLine(new THREE.Vector3(0, 0.48, -0.2), new THREE.Vector3(0.22, 0.15, -0.22));
    createBoneLine(new THREE.Vector3(0, 0.48, -0.2), new THREE.Vector3(-0.22, 0.15, -0.22));

    skeletalGroup.visible = showSkeletalRig;
    scene.add(skeletalGroup);
    animatedRefs.current.skeletalGroup = skeletalGroup;

    // =========================================================================
    // 8. INTERACTION HANDLERS (DESKTOP MOUSE & MOBILE TOUCH ORBIT)
    // =========================================================================
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = w * (9 / 16);
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePosRef.current.x;
      const deltaY = e.clientY - previousMousePosRef.current.y;

      cameraOrbitRef.current.theta -= deltaX * 0.007;
      cameraOrbitRef.current.phi = Math.max(0.15, Math.min(Math.PI - 0.15, cameraOrbitRef.current.phi - deltaY * 0.007));
      previousMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraOrbitRef.current.radius = Math.max(1.6, Math.min(9.5, cameraOrbitRef.current.radius + e.deltaY * 0.004));
    };

    // Mobile Touch Handlers
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchDistanceRef.current = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const deltaX = e.touches[0].clientX - previousMousePosRef.current.x;
        const deltaY = e.touches[0].clientY - previousMousePosRef.current.y;

        cameraOrbitRef.current.theta -= deltaX * 0.008;
        cameraOrbitRef.current.phi = Math.max(0.15, Math.min(Math.PI - 0.15, cameraOrbitRef.current.phi - deltaY * 0.008));
        previousMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && touchDistanceRef.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const deltaDist = dist - touchDistanceRef.current;
        cameraOrbitRef.current.radius = Math.max(1.6, Math.min(9.5, cameraOrbitRef.current.radius - deltaDist * 0.01));
        touchDistanceRef.current = dist;
      }
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      touchDistanceRef.current = null;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });

    domElem.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    // =========================================================================
    // 9. ANIMATION LOOP (60 FPS)
    // =========================================================================
    let frameCount = 0;
    let fpsTime = performance.now();

    const animate = (timeNow: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Calculate Realtime FPS
      frameCount++;
      if (timeNow - fpsTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsTime = timeNow;
      }

      if (!isPlaying) return;
      const elapsed = timeNow * 0.001 * playbackSpeed;

      // 1. Camera Orbit Position & Smooth LookAt
      const { radius, theta, phi } = cameraOrbitRef.current;
      const target = cameraTargetRef.current;
      camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = target.y + radius * Math.cos(phi);
      camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(target);

      // 2. Primate Respiration (Physiological Ribcage Expansion)
      if (animatedRefs.current.chestGroup) {
        const breath = 1.0 + Math.sin(elapsed * 2.6) * 0.04;
        animatedRefs.current.chestGroup.scale.set(breath, breath, breath);
      }

      // 3. Realistic Saccadic Head Micro-Turns & Awareness
      if (animatedRefs.current.headGroup) {
        animatedRefs.current.headGroup.rotation.y =
          Math.sin(elapsed * 1.1) * 0.12 + Math.sin(elapsed * 3.4) * 0.04;
        animatedRefs.current.headGroup.rotation.x = Math.sin(elapsed * 0.7) * 0.05;
      }

      // 4. Tail Ethology Forward Kinematics Chain
      const ethPattern = twin.ethologyProfile?.tailLanguageRepertoire[0];
      const targetAngleDeg = ethPattern ? ethPattern.angleDegrees : 65;
      const twitchHz = ethPattern ? ethPattern.twitchFrequencyHz : 1.2;
      const curvature = ethPattern ? ethPattern.curvature : 0.45;
      const tailTwitch = Math.sin(elapsed * Math.PI * 2 * twitchHz) * (twitchHz > 0 ? 0.06 : 0.01);
      const windSway = Math.sin(elapsed * 2.8) * 0.04 * (windSpeedKmH / 25);

      const baseRad = (targetAngleDeg * Math.PI) / 180;
      const segPitch = (baseRad / 14) * 0.9 + tailTwitch;
      const segRoll = curvature * 0.12 + windSway;

      animatedRefs.current.tailSegments.forEach((seg, idx) => {
        seg.rotation.x = -segPitch + Math.sin(elapsed * 3.5 + idx * 0.25) * 0.02;
        seg.rotation.y = segRoll;
      });

      // 5. LiDAR Scanning Ring Sweep (for Volumetric Studio Scene)
      if (animatedRefs.current.lidarLaserRing) {
        const sweepY = 0.1 + (Math.sin(elapsed * 2.2) * 0.5 + 0.5) * 1.0;
        animatedRefs.current.lidarLaserRing.position.y = sweepY;
      }

      // 6. Turntable Rotation (if camera mode is turntable)
      if (activeScene.id === 'volumetric-scan' && cameraAnglePreset.includes('turntable')) {
        if (animatedRefs.current.monkeyHero) {
          animatedRefs.current.monkeyHero.rotation.y = 0.45 + elapsed * 0.35;
        }
      }

      // 7. Swaying Tropical Palm Fronds
      animatedRefs.current.foliageObjects.forEach((frond, i) => {
        frond.rotation.z = Math.sin(elapsed * 2.0 + i) * 0.06 * (windSpeedKmH / 20);
      });

      // 8. Ocean Wave Swell
      if (animatedRefs.current.waterPlane) {
        animatedRefs.current.waterPlane.position.y = -3.8 + Math.sin(elapsed * 1.4) * 0.08;
      }

      // 9. Weather Particle Drift (Rain / Spores / Pollen)
      const pSys = animatedRefs.current.weatherParticles;
      if (pSys) {
        const pos = pSys.geometry.attributes.position.array as Float32Array;
        const speedMultiplier = isMonsoon ? 0.14 : 0.025;
        for (let i = 0; i < particleCount; i++) {
          if (isMonsoon) {
            // Falling vertical raindrops
            pos[i * 3 + 1] -= speedMultiplier * 1.8;
            pos[i * 3] += (windSpeedKmH / 60) * 0.02;
            if (pos[i * 3 + 1] < -1.5) {
              pos[i * 3 + 1] = 5.5;
              pos[i * 3] = (Math.random() - 0.5) * 14;
            }
          } else {
            // Floating pollen / spores
            pos[i * 3] += (0.015 + Math.random() * 0.01) * (windSpeedKmH / 20);
            pos[i * 3 + 1] += Math.sin(elapsed * 1.8 + i) * 0.003;
            if (pos[i * 3] > 7) pos[i * 3] = -7;
          }
        }
        pSys.geometry.attributes.position.needsUpdate = true;
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

      domElem.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      renderer.dispose();
    };
  }, [
    activeScene.id,
    twin.species,
    twin.name,
    showSkeletalRig,
    showLiDARPointCloud,
    enableSubsurfaceScattering,
    enableAnisotropicFur,
  ]);

  // Dynamic Visibility Updates for Shaders & Overlays
  useEffect(() => {
    if (animatedRefs.current.pointCloudMesh) {
      animatedRefs.current.pointCloudMesh.visible = showLiDARPointCloud;
    }
    if (animatedRefs.current.skeletalGroup) {
      animatedRefs.current.skeletalGroup.visible = showSkeletalRig;
    }
  }, [showLiDARPointCloud, showSkeletalRig]);

  return (
    <div className="relative w-full aspect-video bg-[#030712] rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl group select-none">
      {/* 3D WebGL / OpenGL Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

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

      {/* Top Left OpenGL Status & Engine Info */}
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

        {photorealStats?.active && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 backdrop-blur-md border border-cyan-500/50 text-[11px] font-mono text-cyan-300 shadow-lg animate-in fade-in">
            <Box className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-semibold">3D MESH FROM IMAGE ACTIVE</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300 font-bold">
              {(photorealStats.primateVertices + photorealStats.sceneVertices).toLocaleString()} Vertices
            </span>
          </div>
        )}
      </div>

      {/* Interactive Orbit Drag Helper Pill */}
      <div className="absolute bottom-5 left-4 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 pointer-events-none">
        <Compass className="w-3.5 h-3.5 text-cyan-400" />
        <span>Drag to orbit in 3D • Pinch/Scroll to zoom • Dynamic USD Camera IK</span>
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
