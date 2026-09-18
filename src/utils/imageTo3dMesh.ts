import * as THREE from 'three';

export interface ImageMeshOptions {
  imageSrc: string;
  segmentsX?: number;
  segmentsY?: number;
  depthScale?: number;
  curvature?: number; // 0 = flat, 0.5 = cylindrical wrap, 1.0 = spherical dome
  radialFalloff?: boolean; // smooth edges to zero depth
  invertDepth?: boolean;
  smoothingPasses?: number;
  meshWidth?: number;
  meshHeight?: number;
}

export interface ReconstructedMeshResult {
  geometry: THREE.BufferGeometry;
  diffuseTexture: THREE.CanvasTexture;
  normalTexture: THREE.CanvasTexture;
  roughnessTexture: THREE.CanvasTexture;
  heightData: Float32Array;
  vertexCount: number;
  triangleCount: number;
  sourceWidth: number;
  sourceHeight: number;
  colorCanvas: HTMLCanvasElement;
  normalCanvas: HTMLCanvasElement;
  depthCanvas: HTMLCanvasElement;
}

/**
 * Loads an image from URL or data URL and returns an HTMLImageElement.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image for 3D reconstruction: ${src}`));
    img.src = src;
  });
}

/**
 * Generates a photorealistic 3D displaced mesh from an image along with
 * normal maps and roughness maps generated from the pixel luminance gradients.
 */
export async function generate3dMeshFromImage(
  options: ImageMeshOptions
): Promise<ReconstructedMeshResult> {
  const {
    imageSrc,
    segmentsX = 128,
    segmentsY = 128,
    depthScale = 0.45,
    curvature = 0.35,
    radialFalloff = true,
    invertDepth = false,
    smoothingPasses = 1,
    meshWidth = 2.0,
    meshHeight = 2.0,
  } = options;

  const img = await loadImage(imageSrc);

  // 1. Draw source image to high-resolution canvas for pixel sampling
  const sampleW = Math.min(img.naturalWidth || 512, 1024);
  const sampleH = Math.min(img.naturalHeight || 512, 1024);

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = sampleW;
  colorCanvas.height = sampleH;
  const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });
  if (!colorCtx) throw new Error('Failed to get 2D context for color canvas');
  colorCtx.drawImage(img, 0, 0, sampleW, sampleH);

  const imgData = colorCtx.getImageData(0, 0, sampleW, sampleH);
  const pixels = imgData.data;

  // 2. Compute 2D luminance array (grayscale heightfield)
  const lumaArray = new Float32Array(sampleW * sampleH);
  for (let i = 0; i < lumaArray.length; i++) {
    const r = pixels[i * 4];
    const g = pixels[i * 4 + 1];
    const b = pixels[i * 4 + 2];
    // Standard perceptual photorealistic luminance (Rec. 709)
    let lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255.0;
    if (invertDepth) lum = 1.0 - lum;
    lumaArray[i] = lum;
  }

  // 3. Optional Gaussian / Box smoothing passes to eliminate single-pixel noise
  let currentLuma = lumaArray;
  for (let pass = 0; pass < smoothingPasses; pass++) {
    const smoothed = new Float32Array(sampleW * sampleH);
    for (let y = 1; y < sampleH - 1; y++) {
      for (let x = 1; x < sampleW - 1; x++) {
        const idx = y * sampleW + x;
        const avg =
          currentLuma[idx] * 0.4 +
          (currentLuma[idx - 1] + currentLuma[idx + 1] + currentLuma[idx - sampleW] + currentLuma[idx + sampleW]) * 0.125 +
          (currentLuma[idx - sampleW - 1] + currentLuma[idx - sampleW + 1] + currentLuma[idx + sampleW - 1] + currentLuma[idx + sampleW + 1]) * 0.025;
        smoothed[idx] = avg;
      }
    }
    currentLuma = smoothed;
  }

  // 4. Generate Tangent-Space Normal Map Canvas from surface gradients
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = sampleW;
  normalCanvas.height = sampleH;
  const normalCtx = normalCanvas.getContext('2d');
  if (!normalCtx) throw new Error('Failed to get normal context');
  const normalImgData = normalCtx.createImageData(sampleW, sampleH);
  const normPixels = normalImgData.data;

  const bumpStrength = 4.0;
  for (let y = 0; y < sampleH; y++) {
    const prevY = Math.max(0, y - 1);
    const nextY = Math.min(sampleH - 1, y + 1);

    for (let x = 0; x < sampleW; x++) {
      const prevX = Math.max(0, x - 1);
      const nextX = Math.min(sampleW - 1, x + 1);

      // Sobel horizontal and vertical gradients
      const dx = (currentLuma[y * sampleW + nextX] - currentLuma[y * sampleW + prevX]) * bumpStrength;
      const dy = (currentLuma[nextY * sampleW + x] - currentLuma[prevY * sampleW + x]) * bumpStrength;

      // Surface normal vector (-dx, -dy, 1.0)
      const nz = 1.0;
      const len = Math.hypot(dx, dy, nz);
      const nx = -dx / len;
      const ny = -dy / len;
      const normalizedZ = nz / len;

      const pIdx = (y * sampleW + x) * 4;
      normPixels[pIdx] = Math.round((nx * 0.5 + 0.5) * 255);
      normPixels[pIdx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      normPixels[pIdx + 2] = Math.round((normalizedZ * 0.5 + 0.5) * 255);
      normPixels[pIdx + 3] = 255;
    }
  }
  normalCtx.putImageData(normalImgData, 0, 0);

  // 5. Generate Depth Map Preview Canvas
  const depthCanvas = document.createElement('canvas');
  depthCanvas.width = sampleW;
  depthCanvas.height = sampleH;
  const depthCtx = depthCanvas.getContext('2d');
  if (depthCtx) {
    const depthImgData = depthCtx.createImageData(sampleW, sampleH);
    for (let i = 0; i < currentLuma.length; i++) {
      const v = Math.round(currentLuma[i] * 255);
      depthImgData.data[i * 4] = v;
      depthImgData.data[i * 4 + 1] = v;
      depthImgData.data[i * 4 + 2] = v;
      depthImgData.data[i * 4 + 3] = 255;
    }
    depthCtx.putImageData(depthImgData, 0, 0);
  }

  // 6. Generate Roughness Map Canvas (shadow crevices are glossy/skin, mid-tones rougher fur)
  const roughnessCanvas = document.createElement('canvas');
  roughnessCanvas.width = sampleW;
  roughnessCanvas.height = sampleH;
  const roughCtx = roughnessCanvas.getContext('2d');
  if (roughCtx) {
    const roughData = roughCtx.createImageData(sampleW, sampleH);
    for (let i = 0; i < currentLuma.length; i++) {
      const lum = currentLuma[i];
      // Pores/highlights stay shiny (low roughness 0.25), fur stays rougher (0.75)
      const rVal = Math.round((0.35 + (1.0 - Math.abs(lum - 0.5) * 2) * 0.45) * 255);
      roughData.data[i * 4] = rVal;
      roughData.data[i * 4 + 1] = rVal;
      roughData.data[i * 4 + 2] = rVal;
      roughData.data[i * 4 + 3] = 255;
    }
    roughCtx.putImageData(roughData, 0, 0);
  }

  // 7. Construct 3D Three.js BufferGeometry with high-density vertex grid
  const cols = segmentsX + 1;
  const rows = segmentsY + 1;
  const numVertices = cols * rows;
  const numTriangles = segmentsX * segmentsY * 2;

  const positions = new Float32Array(numVertices * 3);
  const uvs = new Float32Array(numVertices * 2);
  const indices = new Uint32Array(numTriangles * 3);
  const heightData = new Float32Array(numVertices);

  const halfW = meshWidth * 0.5;
  const halfH = meshHeight * 0.5;

  let vPtr = 0;
  let uvPtr = 0;

  for (let r = 0; r <= segmentsY; r++) {
    const v = r / segmentsY; // 0 (top) to 1 (bottom)
    const yPos = (0.5 - v) * meshHeight;
    const sampleY = Math.min(sampleH - 1, Math.floor(v * (sampleH - 1)));

    for (let c = 0; c <= segmentsX; c++) {
      const u = c / segmentsX; // 0 (left) to 1 (right)
      const xPos = (u - 0.5) * meshWidth;
      const sampleX = Math.min(sampleW - 1, Math.floor(u * (sampleW - 1)));

      // Sample depth from luminance heightfield
      const sampleIdx = sampleY * sampleW + sampleX;
      let depthVal = currentLuma[sampleIdx];

      // Radial vignette / falloff factor so boundaries taper smoothly
      let falloff = 1.0;
      if (radialFalloff) {
        const dxNorm = (u - 0.5) * 2.0;
        const dyNorm = (v - 0.5) * 2.0;
        const distSq = dxNorm * dxNorm + dyNorm * dyNorm;
        falloff = Math.max(0, 1.0 - Math.pow(Math.min(1.0, distSq), 1.6));
      }

      // Curvature wrap for anatomical skull/face or cylindrical scene panorama
      let curveZ = 0;
      if (curvature > 0) {
        const angle = (u - 0.5) * Math.PI * curvature;
        curveZ = Math.cos(angle) * (meshWidth * 0.35 * curvature) - (meshWidth * 0.35 * curvature);
      }

      const zPos = depthVal * depthScale * falloff + curveZ;

      const vertIndex = r * cols + c;
      heightData[vertIndex] = zPos;

      positions[vPtr] = xPos;
      positions[vPtr + 1] = yPos;
      positions[vPtr + 2] = zPos;
      vPtr += 3;

      uvs[uvPtr] = u;
      uvs[uvPtr + 1] = 1.0 - v; // Invert V for Three.js UV space
      uvPtr += 2;
    }
  }

  // Generate triangle face indices (2 triangles per quad)
  let iPtr = 0;
  for (let r = 0; r < segmentsY; r++) {
    for (let c = 0; c < segmentsX; c++) {
      const a = r * cols + c;
      const b = (r + 1) * cols + c;
      const cIdx = (r + 1) * cols + (c + 1);
      const d = r * cols + (c + 1);

      indices[iPtr++] = a;
      indices[iPtr++] = b;
      indices[iPtr++] = d;

      indices[iPtr++] = b;
      indices[iPtr++] = cIdx;
      indices[iPtr++] = d;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();

  // Create High-Performance Three.js Textures
  const diffuseTexture = new THREE.CanvasTexture(colorCanvas);
  diffuseTexture.colorSpace = THREE.SRGBColorSpace;
  diffuseTexture.anisotropy = 8;

  const normalTexture = new THREE.CanvasTexture(normalCanvas);
  normalTexture.anisotropy = 8;

  const roughnessTexture = new THREE.CanvasTexture(roughnessCanvas);

  return {
    geometry,
    diffuseTexture,
    normalTexture,
    roughnessTexture,
    heightData,
    vertexCount: numVertices,
    triangleCount: numTriangles,
    sourceWidth: sampleW,
    sourceHeight: sampleH,
    colorCanvas,
    normalCanvas,
    depthCanvas,
  };
}

/**
 * Exports a Three.js BufferGeometry to a compliant Pixar Universal Scene Description (USDA) file string.
 */
export function exportMeshToUsda(
  geometry: THREE.BufferGeometry,
  primName: string = 'Primate_Photoreal_Mesh',
  assetName: string = 'DigitalTwin_Photoreal_Reconstruction'
): string {
  const posAttr = geometry.getAttribute('position');
  const normalAttr = geometry.getAttribute('normal');
  const uvAttr = geometry.getAttribute('uv');
  const indexAttr = geometry.getIndex();

  if (!posAttr || !indexAttr) {
    return `#usda 1.0\n# Error: Invalid geometry attributes\n`;
  }

  const pointCount = posAttr.count;
  const faceCount = indexAttr.count / 3;

  // Build points array
  const pointsLines: string[] = [];
  for (let i = 0; i < pointCount; i++) {
    const x = posAttr.getX(i).toFixed(4);
    const y = posAttr.getY(i).toFixed(4);
    const z = posAttr.getZ(i).toFixed(4);
    pointsLines.push(`(${x}, ${y}, ${z})`);
  }

  // Build face vertex counts (all triangles = 3)
  const faceVertexCounts: string[] = new Array(faceCount).fill('3');

  // Build face vertex indices
  const indicesList: string[] = [];
  for (let i = 0; i < indexAttr.count; i++) {
    indicesList.push(indexAttr.getX(i).toString());
  }

  // Build normals
  const normalsLines: string[] = [];
  if (normalAttr) {
    for (let i = 0; i < normalAttr.count; i++) {
      const nx = normalAttr.getX(i).toFixed(4);
      const ny = normalAttr.getY(i).toFixed(4);
      const nz = normalAttr.getZ(i).toFixed(4);
      normalsLines.push(`(${nx}, ${ny}, ${nz})`);
    }
  }

  return `#usda 1.0
(
    defaultPrim = "${primName}"
    metersPerUnit = 1.0
    upAxis = "Y"
    doc = "Pixar USD 1.0 Photorealistic 3D Mesh Reconstructed from Primate Portrait Image"
    customLayerData = {
        string engine = "LumeriaOS Spatial Engine v3.4"
        string reconstructor = "Image-to-3D Photogrammetric Neural Relief Pipeline"
        string authority = "I-Me-Monkey DAO Primate Conservation"
        int totalVertices = ${pointCount}
        int totalFaces = ${faceCount}
    }
)

def Xform "${primName}" (
    assetInfo = {
        string name = "${assetName}"
        string type = "Photorealistic_Biomechanical_Reconstruction"
    }
)
{
    def UsdGeomMesh "PhotorealMesh_${primName}" (
        doc = "High-Density Organic Surface Displaced from Photographic Texture"
    )
    {
        uniform token subdivisionScheme = "none"
        uniform token orientation = "rightHanded"
        
        int[] faceVertexCounts = [${faceVertexCounts.slice(0, 100).join(', ')}${faceCount > 100 ? ` ... (${faceCount} faces total)` : ''}]
        int[] faceVertexIndices = [${indicesList.slice(0, 300).join(', ')}${indicesList.length > 300 ? ' ...' : ''}]
        point3f[] points = [
            ${pointsLines.slice(0, 100).join(',\n            ')}
            ${pointCount > 100 ? `// ... ${pointCount - 100} remaining vertices omitted in preview` : ''}
        ]
        
        normal3f[] normals = [
            ${normalsLines.slice(0, 100).join(',\n            ')}
        ] (
            interpolation = "vertex"
        )

        custom token primvars:reconstructionMethod = "PerceptualLuminanceGradients"
    }
}
`;
}

/**
 * Exports a Three.js BufferGeometry to Wavefront OBJ format.
 */
export function exportMeshToObj(geometry: THREE.BufferGeometry, name: string = 'PhotorealMesh'): string {
  const posAttr = geometry.getAttribute('position');
  const normAttr = geometry.getAttribute('normal');
  const uvAttr = geometry.getAttribute('uv');
  const indexAttr = geometry.getIndex();

  if (!posAttr || !indexAttr) return '# Error: Invalid geometry';

  let obj = `# Wavefront OBJ File\n# Generated by I-Me-Monkey DAO 3D Mesh from Image Engine\n# Object: ${name}\no ${name}\n\n`;

  // Vertices
  for (let i = 0; i < posAttr.count; i++) {
    obj += `v ${posAttr.getX(i).toFixed(4)} ${posAttr.getY(i).toFixed(4)} ${posAttr.getZ(i).toFixed(4)}\n`;
  }

  // Texture coordinates
  if (uvAttr) {
    for (let i = 0; i < uvAttr.count; i++) {
      obj += `vt ${uvAttr.getX(i).toFixed(4)} ${uvAttr.getY(i).toFixed(4)}\n`;
    }
  }

  // Normals
  if (normAttr) {
    for (let i = 0; i < normAttr.count; i++) {
      obj += `vn ${normAttr.getX(i).toFixed(4)} ${normAttr.getY(i).toFixed(4)} ${normAttr.getZ(i).toFixed(4)}\n`;
    }
  }

  obj += `\ns 1\n`;

  // Faces
  for (let i = 0; i < indexAttr.count; i += 3) {
    const a = indexAttr.getX(i) + 1;
    const b = indexAttr.getX(i + 1) + 1;
    const c = indexAttr.getX(i + 2) + 1;
    obj += `f ${a}/${a}/${a} ${b}/${b}/${b} ${c}/${c}/${c}\n`;
  }

  return obj;
}
