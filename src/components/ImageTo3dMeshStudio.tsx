import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { MonkeyDigitalTwin, CinematicUsdScene } from '../types';
import {
  generate3dMeshFromImage,
  exportMeshToUsda,
  exportMeshToObj,
  ReconstructedMeshResult
} from '../utils/imageTo3dMesh';
import {
  Box,
  Layers,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCw,
  Sun,
  Eye,
  Sliders,
  Maximize2,
  FileCode,
  Image as ImageIcon,
  Trees,
  Upload,
  Zap,
  Info
} from 'lucide-react';

interface ImageTo3dMeshStudioProps {
  twins: MonkeyDigitalTwin[];
  scenes: CinematicUsdScene[];
  initialTwinId?: string;
  initialSceneId?: string;
  onSelectTwinForStage?: (twin: MonkeyDigitalTwin) => void;
}

export const ImageTo3dMeshStudio: React.FC<ImageTo3dMeshStudioProps> = ({
  twins,
  scenes,
  initialTwinId,
  initialSceneId,
  onSelectTwinForStage,
}) => {
  // Category selection: Monkey Digital Twin vs Cinematic Scene
  const [targetType, setTargetType] = useState<'monkey' | 'scene'>('monkey');

  const [selectedTwinId, setSelectedTwinId] = useState<string>(initialTwinId || twins[0]?.id || 'DT-MKY-001');
  const [selectedSceneId, setSelectedSceneId] = useState<string>(initialSceneId || scenes[0]?.id || 'emerald-dawn');
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState<string>('Custom Upload');

  // Active item
  const selectedTwin = useMemo(() => twins.find((t) => t.id === selectedTwinId) || twins[0], [twins, selectedTwinId]);
  const selectedScene = useMemo(() => scenes.find((s) => s.id === selectedSceneId) || scenes[0], [scenes, selectedSceneId]);

  // Source Image URL
  const activeImageSrc = useMemo(() => {
    if (customImageSrc) return customImageSrc;
    if (targetType === 'monkey') return selectedTwin?.imageUrl || '';
    return selectedScene?.highResImageUrl || '';
  }, [targetType, selectedTwin, selectedScene, customImageSrc]);

  const activeTitle = useMemo(() => {
    if (customImageSrc) return customImageName;
    if (targetType === 'monkey') return `${selectedTwin?.name} (${selectedTwin?.species})`;
    return `${selectedScene?.title} — ${selectedScene?.location}`;
  }, [targetType, selectedTwin, selectedScene, customImageSrc, customImageName]);

  // Mesh Generation Parameters
  const [meshResolution, setMeshResolution] = useState<number>(128); // 128x128
  const [depthScale, setDepthScale] = useState<number>(0.55);
  const [curvature, setCurvature] = useState<number>(0.38); // 0.38 for organic monkey bust, 0.15 for scene
  const [smoothingPasses, setSmoothingPasses] = useState<number>(1);
  const [invertDepth, setInvertDepth] = useState<boolean>(false);

  // Viewport & Shading modes
  const [renderMode, setRenderMode] = useState<'pbr' | 'normals' | 'depth' | 'wireframe' | 'points'>('pbr');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [wireframeOverlay, setWireframeOverlay] = useState<boolean>(false);
  const [lightIntensity, setLightIntensity] = useState<number>(1.8);

  // Export & USDA View Modal
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [meshResult, setMeshResult] = useState<ReconstructedMeshResult | null>(null);
  const [copiedUsda, setCopiedUsda] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'3d-viewport' | 'map-passes' | 'usda-code'>('3d-viewport');

  // Three.js Mount & Animation refs
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const animIdRef = useRef<number | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Camera Orbit state
  const orbitRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 3.2,
    theta: 0,
    phi: Math.PI / 2,
  });
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // ---------------------------------------------------------------------------
  // 1. GENERATE / REBUILD 3D MESH FROM ACTIVE IMAGE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!activeImageSrc) return;

    let isMounted = true;
    setIsGenerating(true);

    const rebuildMesh = async () => {
      try {
        const isSceneMode = targetType === 'scene';
        const res = await generate3dMeshFromImage({
          imageSrc: activeImageSrc,
          segmentsX: meshResolution,
          segmentsY: meshResolution,
          depthScale,
          curvature: isSceneMode ? Math.min(0.2, curvature) : curvature,
          radialFalloff: !isSceneMode,
          invertDepth,
          smoothingPasses,
          meshWidth: isSceneMode ? 3.4 : 2.0,
          meshHeight: isSceneMode ? 2.2 : 2.0,
        });

        if (isMounted) {
          setMeshResult(res);
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('Failed to generate 3D mesh from image:', err);
        if (isMounted) setIsGenerating(false);
      }
    };

    rebuildMesh();

    return () => {
      isMounted = false;
    };
  }, [activeImageSrc, meshResolution, depthScale, curvature, smoothingPasses, invertDepth, targetType]);

  // ---------------------------------------------------------------------------
  // 2. THREE.JS VIEWPORT SETUP & RENDER LOOP
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Environment Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, lightIntensity);
    dirLight.position.set(3, 4, 3);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Subtle Cyan Rim Light
    const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    // Bottom Fill Light
    const fillLight = new THREE.DirectionalLight(0x1e293b, 0.5);
    fillLight.position.set(0, -3, 2);
    scene.add(fillLight);

    // Studio Grid Ground Plane
    const gridHelper = new THREE.GridHelper(6, 24, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -1.25;
    scene.add(gridHelper);

    // Dynamic Mesh Container Group
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    // Pointer Interaction Handlers
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;

      orbitRef.current.theta -= dx * 0.007;
      orbitRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, orbitRef.current.phi - dy * 0.007));

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      orbitRef.current.radius = Math.max(1.2, Math.min(8.0, orbitRef.current.radius * zoomFactor));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Render loop
    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);

      if (autoRotate && !isDraggingRef.current) {
        orbitRef.current.theta += 0.005;
      }

      // Update camera position from spherical orbit coords
      const { radius, theta, phi } = orbitRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animIdRef.current = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth || 800;
      const newH = container.clientHeight || 500;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);

      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  // Update light intensity
  useEffect(() => {
    if (dirLightRef.current) {
      dirLightRef.current.intensity = lightIntensity;
    }
  }, [lightIntensity]);

  // ---------------------------------------------------------------------------
  // 3. ATTACH RECONSTRUCTED 3D MESH TO SCENE WITH ACTIVE MATERIAL
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const meshGroup = meshGroupRef.current;
    if (!meshGroup || !meshResult) return;

    // Clear previous mesh children
    while (meshGroup.children.length > 0) {
      const child = meshGroup.children[0];
      meshGroup.remove(child);
    }

    const { geometry, diffuseTexture, normalTexture, roughnessTexture } = meshResult;

    let primaryMesh: THREE.Object3D;

    if (renderMode === 'points') {
      // Volumetric 3D Point Cloud Representation
      const pointsMat = new THREE.PointsMaterial({
        color: targetType === 'monkey' ? 0x06b6d4 : 0x10b981,
        size: 0.025,
        transparent: true,
        opacity: 0.9,
      });
      primaryMesh = new THREE.Points(geometry, pointsMat);
    } else if (renderMode === 'wireframe') {
      // Pure Wireframe Topology
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
      });
      primaryMesh = new THREE.Mesh(geometry, wireMat);
    } else if (renderMode === 'normals') {
      // Surface Normals Color Space Material
      const normMat = new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide,
      });
      primaryMesh = new THREE.Mesh(geometry, normMat);
    } else if (renderMode === 'depth') {
      // Depth Heatmap Gradient Material
      const depthMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.1,
      });
      primaryMesh = new THREE.Mesh(geometry, depthMat);
    } else {
      // Photorealistic Physically Based Rendering (PBR)
      const pbrMaterial = new THREE.MeshPhysicalMaterial({
        map: diffuseTexture,
        normalMap: normalTexture,
        normalScale: new THREE.Vector2(1.6, 1.6),
        roughnessMap: roughnessTexture,
        roughness: 0.65,
        metalness: 0.05,
        sheen: 0.85,
        sheenColor: new THREE.Color(targetType === 'monkey' ? 0xfdba74 : 0x67e8f9),
        sheenRoughness: 0.4,
        clearcoat: 0.15,
        clearcoatRoughness: 0.3,
        side: THREE.DoubleSide,
      });
      primaryMesh = new THREE.Mesh(geometry, pbrMaterial);
      primaryMesh.castShadow = true;
      primaryMesh.receiveShadow = true;
    }

    meshGroup.add(primaryMesh);

    // Optional Wireframe overlay on top of solid mesh
    if (wireframeOverlay && renderMode !== 'wireframe' && renderMode !== 'points') {
      const overlayWire = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true,
          transparent: true,
          opacity: 0.25,
        })
      );
      meshGroup.add(overlayWire);
    }
  }, [meshResult, renderMode, wireframeOverlay, targetType]);

  // ---------------------------------------------------------------------------
  // 4. EXPORT HANDLERS (PIXAR USDA & WAVEFRONT OBJ)
  // ---------------------------------------------------------------------------
  const usdaCode = useMemo(() => {
    if (!meshResult) return '# USDA generation pending...';
    const prim = targetType === 'monkey' ? `Rescued_${selectedTwin.name}` : `Scene_${selectedScene.id}`;
    return exportMeshToUsda(meshResult.geometry, prim, activeTitle);
  }, [meshResult, targetType, selectedTwin, selectedScene, activeTitle]);

  const handleCopyUsda = () => {
    navigator.clipboard.writeText(usdaCode);
    setCopiedUsda(true);
    setTimeout(() => setCopiedUsda(false), 2500);
  };

  const handleDownloadUsda = () => {
    const blob = new Blob([usdaCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${targetType === 'monkey' ? selectedTwin.name : selectedScene.id}_photoreal_mesh.usda`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadObj = () => {
    if (!meshResult) return;
    const objText = exportMeshToObj(meshResult.geometry, activeTitle.replace(/\s+/g, '_'));
    const blob = new Blob([objText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${targetType === 'monkey' ? selectedTwin.name : selectedScene.id}_mesh.obj`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Custom Image Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomImageSrc(dataUrl);
      setCustomImageName(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-5 bg-slate-950/95 border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              <Box className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Photorealistic 3D Mesh From Image Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-medium">
                Pixar USD Compliant
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Reconstructs organic 3D volumetric polygonal meshes directly from high-resolution 2D photographic plates with normal maps, depth displacement, and ACEScg PBR materials.
          </p>
        </div>

        {/* Target Switch: Monkey Digital Twin vs Cinematic Scene */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1 text-xs">
            <button
              onClick={() => {
                setTargetType('monkey');
                setCustomImageSrc(null);
                setCurvature(0.38);
                setDepthScale(0.55);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                targetType === 'monkey' && !customImageSrc
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Primate Meshes ({twins.length})</span>
            </button>
            <button
              onClick={() => {
                setTargetType('scene');
                setCustomImageSrc(null);
                setCurvature(0.12);
                setDepthScale(0.7);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                targetType === 'scene' && !customImageSrc
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trees className="w-3.5 h-3.5" />
              <span>Scene Terrains ({scenes.length})</span>
            </button>
          </div>

          {/* Upload Custom Photo Button */}
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/70 cursor-pointer transition-colors shadow-sm">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload Image</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {/* Target Selector Carousel / Grid */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {targetType === 'monkey' ? (
          twins.map((t) => {
            const isSelected = selectedTwinId === t.id && !customImageSrc;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTwinId(t.id);
                  setCustomImageSrc(null);
                }}
                className={`flex items-center gap-2.5 p-2 rounded-xl border text-left shrink-0 transition-all ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-lg shadow-cyan-500/15'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <img
                  src={t.imageUrl}
                  alt={t.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                />
                <div className="pr-2">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    {t.name}
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{t.species}</div>
                </div>
              </button>
            );
          })
        ) : (
          scenes.map((s) => {
            const isSelected = selectedSceneId === s.id && !customImageSrc;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSceneId(s.id);
                  setCustomImageSrc(null);
                }}
                className={`flex items-center gap-2.5 p-2 rounded-xl border text-left shrink-0 transition-all ${
                  isSelected
                    ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-lg shadow-emerald-500/15'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <img
                  src={s.highResImageUrl}
                  alt={s.title}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                />
                <div className="pr-2">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    {s.title}
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{s.location.split('—')[0]}</div>
                </div>
              </button>
            );
          })
        )}

        {customImageSrc && (
          <div className="flex items-center gap-2 p-2 rounded-xl border border-amber-500 bg-amber-950/40 text-amber-200 shrink-0">
            <img src={customImageSrc} alt="Custom" className="w-10 h-10 rounded-lg object-cover border border-amber-600" />
            <div className="pr-2 text-xs font-bold truncate max-w-[110px]">
              {customImageName}
              <span className="block text-[10px] font-normal text-amber-400">Custom 3D Mesh</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Studio Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: 3D Stage / SubTabs (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* SubTab Navigation Bar */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-1.5">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSubTab('3d-viewport')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === '3d-viewport'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Interactive 3D Stage</span>
              </button>
              <button
                onClick={() => setActiveSubTab('map-passes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === 'map-passes'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Map Texture Passes</span>
              </button>
              <button
                onClick={() => setActiveSubTab('usda-code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === 'usda-code'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Pixar USDA Schema</span>
              </button>
            </div>

            {/* Render Shading Selector */}
            {activeSubTab === '3d-viewport' && (
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setRenderMode('pbr')}
                  className={`px-2 py-1 rounded transition-colors ${renderMode === 'pbr' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'}`}
                  title="Photorealistic Physically Based Rendering"
                >
                  PBR Textured
                </button>
                <button
                  onClick={() => setRenderMode('normals')}
                  className={`px-2 py-1 rounded transition-colors ${renderMode === 'normals' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'}`}
                  title="Surface Normals RGB"
                >
                  Normals
                </button>
                <button
                  onClick={() => setRenderMode('wireframe')}
                  className={`px-2 py-1 rounded transition-colors ${renderMode === 'wireframe' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'}`}
                  title="Wireframe Polygon Grid"
                >
                  Wireframe
                </button>
                <button
                  onClick={() => setRenderMode('points')}
                  className={`px-2 py-1 rounded transition-colors ${renderMode === 'points' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'}`}
                  title="Volumetric Point Cloud"
                >
                  Point Cloud
                </button>
              </div>
            )}
          </div>

          {/* Viewport Canvas Container */}
          {activeSubTab === '3d-viewport' && (
            <div className="relative w-full aspect-[16/10] bg-[#030712] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl group select-none">
              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

              {/* Generating Spinner Overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
                  <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                  <div className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    Generating 3D Displaced Mesh from Photographic Plate...
                  </div>
                </div>
              )}

              {/* Telemetry HUD Top-Left */}
              <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 rounded-xl p-2.5 text-xs font-mono text-slate-300 shadow-xl pointer-events-none space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-slate-800 pb-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3D PHOTOGRAMMETRIC RECONSTRUCTION</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                  <div>
                    <span className="text-slate-500 text-[10px] block">TARGET PRIM</span>
                    <span className="text-white font-semibold truncate max-w-[120px] block">
                      {targetType === 'monkey' ? selectedTwin.name : selectedScene.title}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">VERTICES</span>
                    <span className="text-emerald-400 font-semibold">{meshResult?.vertexCount.toLocaleString() || '...'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">POLYGON FACES</span>
                    <span className="text-cyan-300 font-semibold">{meshResult?.triangleCount.toLocaleString() || '...'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">DEPTH EXT</span>
                    <span className="text-amber-300 font-semibold">{depthScale.toFixed(2)}m</span>
                  </div>
                </div>
              </div>

              {/* Interactive Controls Overlay Bottom-Right */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-xl">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    autoRotate
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Turntable Auto-Rotation"
                >
                  <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
                </button>
                <button
                  onClick={() => setWireframeOverlay(!wireframeOverlay)}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    wireframeOverlay
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Wireframe Overlay"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>

              {/* Helpful Gesture Instructions Bottom-Left */}
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/75 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-300">
                Left Drag: Orbit 3D • Right Drag: Pan • Wheel: Zoom
              </div>
            </div>
          )}

          {/* SubTab 2: Map Passes (Diffuse, Normal Map, Depth Heightfield) */}
          {activeSubTab === 'map-passes' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              {/* Diffuse Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold">1. Diffuse Albedo (Photo)</span>
                  <span className="text-slate-500">sRGB</span>
                </div>
                <div className="aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                  <img src={activeImageSrc} alt="Diffuse" className="w-full h-full object-cover" />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  High-resolution photographic plate capturing realistic fur agouti pigmentation, irises, and skin tone.
                </p>
              </div>

              {/* Surface Normal Map */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-400 font-bold">2. Normal Map (Sobel)</span>
                  <span className="text-slate-500">Tangent Space</span>
                </div>
                <div className="aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  {meshResult?.normalCanvas ? (
                    <img
                      src={meshResult.normalCanvas.toDataURL()}
                      alt="Normal Map"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">Generating...</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Computed tangent-space normal vectors providing high-frequency micro-relief for fur follicles and pores.
                </p>
              </div>

              {/* Depth Heightfield */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">3. Depth Displacement</span>
                  <span className="text-slate-500">16-bit Float</span>
                </div>
                <div className="aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  {meshResult?.depthCanvas ? (
                    <img
                      src={meshResult.depthCanvas.toDataURL()}
                      alt="Depth Field"
                      className="w-full h-full object-cover grayscale"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">Generating...</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Perceptual luminance heightfield extruding the 3D vertex positions along the normal axis.
                </p>
              </div>
            </div>
          )}

          {/* SubTab 3: Pixar USDA Code Viewer */}
          {activeSubTab === 'usda-code' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" />
                  PIXAR USDA 1.0 SCHEMA SPECIFICATION
                </span>
                <button
                  onClick={handleCopyUsda}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors border border-slate-700"
                >
                  {copiedUsda ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUsda ? 'Copied USDA!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-96 overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                {usdaCode}
              </pre>
            </div>
          )}
        </div>

        {/* Right Column: Mesh Reconstruction Controls & Export (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Controls Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Mesh Reconstruction Tuning
              </span>
              <span className="text-[10px] font-mono text-slate-400">WebGL2 / PBR</span>
            </div>

            {/* Mesh Resolution Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Polygonal Density</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {meshResolution} × {meshResolution} ({(meshResolution * meshResolution * 2).toLocaleString()} tris)
                </span>
              </div>
              <input
                type="range"
                min="64"
                max="256"
                step="32"
                value={meshResolution}
                onChange={(e) => setMeshResolution(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Fast (64)</span>
                <span>Balanced (128)</span>
                <span>Ultra (256)</span>
              </div>
            </div>

            {/* 3D Depth / Extrusion Amplitude */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Depth Extrusion Scale</span>
                <span className="text-amber-300 font-mono font-bold">{depthScale.toFixed(2)}×</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={depthScale}
                onChange={(e) => setDepthScale(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Scales the physical Z-displacement amplitude calculated from image luminance.
              </p>
            </div>

            {/* Curvature Wrap (Organic Primate Cranium / Curved Panorama) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Anatomical Curvature Wrap</span>
                <span className="text-purple-400 font-mono font-bold">{(curvature * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={curvature}
                onChange={(e) => setCurvature(parseFloat(e.target.value))}
                className="w-full accent-purple-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Wraps planar geometry into a natural 3D cylindrical/spherical anatomical curve.
              </p>
            </div>

            {/* Gaussian Depth Smoothing Passes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Noise Smoothing</span>
                <span className="text-emerald-400 font-mono font-bold">{smoothingPasses} Pass</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((pass) => (
                  <button
                    key={pass}
                    onClick={() => setSmoothingPasses(pass)}
                    className={`py-1 rounded-lg text-xs font-mono font-semibold transition-colors border ${
                      smoothingPasses === pass
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pass === 0 ? 'Raw' : `${pass}x`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sun Light Intensity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Directional Key Light</span>
                <span className="text-amber-400 font-mono font-bold">{lightIntensity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.1"
                value={lightIntensity}
                onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Depth Inversion Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
              <span className="text-slate-300">Invert Heightfield Depth</span>
              <button
                onClick={() => setInvertDepth(!invertDepth)}
                className={`w-10 h-5 rounded-full transition-colors relative ${invertDepth ? 'bg-cyan-500' : 'bg-slate-800'}`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.75 ${
                    invertDepth ? 'left-5.5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Export & Action Buttons */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-slate-800 pb-2">
              Export 3D Reconstructed Asset
            </span>

            <button
              onClick={handleDownloadUsda}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Pixar USD (.usda)</span>
            </button>

            <button
              onClick={handleDownloadObj}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-all border border-slate-700 cursor-pointer"
            >
              <Box className="w-4 h-4 text-amber-400" />
              <span>Download Wavefront 3D (.obj)</span>
            </button>

            {onSelectTwinForStage && targetType === 'monkey' && (
              <button
                onClick={() => onSelectTwinForStage(selectedTwin)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-semibold text-xs transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Launch in Marshall Islands Stage</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
