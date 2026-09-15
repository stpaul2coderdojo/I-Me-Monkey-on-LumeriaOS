import { CinematicUsdScene } from '../types';

export const CINEMATIC_USD_SCENES: CinematicUsdScene[] = [
  {
    id: 'emerald-dawn',
    title: 'Emerald Overstory Dawn',
    subtitle: 'Miyawaki High Canopy Godrays & Arboreal Traverse',
    location: 'Majuro Atoll — Miyawaki Bio-Corridor Zone 1',
    timeOfDay: '06:18 AM Dawn',
    lightingSetup: 'Volumetric Golden Godrays, Pacific Mist, Dappled Leaf Radiance',
    usdScenePath: '/LumeriaOS/Scenes/Cinematic/Majuro_Dawn_Canopy_Hyperreal.usda',
    cameraFocalLength: '50mm Anamorphic Prime f/1.4',
    weather: 'Tropical Morning Mist (26.2°C, 82% Humidity, 12kt Trade Winds)',
    primaryAction: 'High Bough Quadrupedal Traverse & Prehensile Balance',
    moodColor: '#10b981',
    cameraAngles: [
      { id: 'tracking', label: 'Cinematic Tracking', fov: 42 },
      { id: 'close-up', label: 'Fur Macro Close-up', fov: 24 },
      { id: 'drone-sweep', label: 'Drone Canopy Sweep', fov: 65 },
      { id: 'low-angle', label: 'Low-Angle Bough Ascent', fov: 48 },
    ],
    usdaCode: `#usda 1.0
(
    defaultPrim = "Cinematic_Stage_Dawn"
    metersPerUnit = 1.0
    upAxis = "Y"
    startTimeCode = 0
    endTimeCode = 360
    timeCodesPerSecond = 60
    doc = "LumeriaOS Hyperrealistic Cinematic Scene: Emerald Overstory Dawn"
    customLayerData = {
        string renderer = "LumeriaOS Pixar USD Raytracer v4.2"
        string colorSpace = "ACEScg"
        string audioAmbience = "Pacific_Trade_Winds_Miyawaki_Dawn.wav"
        string sanctuaryMatrix = "https://conservationonthematrix.weebly.com"
    }
)

def Xform "Cinematic_Stage_Dawn"
{
    def Scope "Cameras"
    {
        def Camera "CinematicCam_Master"
        {
            float focalLength = 50.0
            float horizontalAperture = 36.0
            float verticalAperture = 15.06  // Anamorphic 2.39:1 Scope
            float fStop = 1.4
            float focusDistance = 4.25
            token projection = "perspective"
            double3 xformOp:translate = (1.2, 14.8, 4.5)
            uniform token[] xformOpOrder = ["xformOp:translate"]
        }
    }

    def Scope "Lighting_Environment"
    {
        def DomeLight "PacificSky_Dome"
        {
            float inputs:intensity = 1850.0
            color3f inputs:color = (0.74, 0.88, 1.0)
            asset inputs:texture:file = @textures/majuro_atoll_dawn_4k.hdr@
        }

        def DistantLight "Tropical_Sun_Godrays"
        {
            float inputs:intensity = 12500.0
            color3f inputs:color = (1.0, 0.82, 0.54)
            float inputs:angle = 0.53
            bool inputs:volumetricScattering = true
            float inputs:volumetricDensity = 0.045
        }
    }

    def Xform "Simian_DigitalTwin_Hero"
    {
        def SkelRoot "Skeletal_Kinematics"
        {
            // 48-bone articulated kinematic rig with procedural breathing and spine flexing
            float3[] restTransforms = [(0,0,0), (0, 0.4, 0), (0, 0.8, 0)]
        }

        def UsdGeomMesh "Simian_Hyperreal_Fur_Groom"
        {
            // 450,000 instanced procedural fur strands with anisotropic sheen
            token furInterpolation = "hairCurves"
            color3f primvars:rootColor = (0.16, 0.11, 0.08)
            color3f primvars:tipColor = (0.42, 0.31, 0.19)
            float primvars:specularShift = 0.08
            float primvars:subsurfaceColorScale = 0.35
        }

        def Material "Simian_Epidermis_SSS"
        {
            token outputs:surface.connect = </Cinematic_Stage_Dawn/Simian_DigitalTwin_Hero/Simian_Epidermis_SSS/PBRShader.outputs:surface>
            
            def Shader "PBRShader"
            {
                uniform token info:id = "UsdPreviewSurface"
                color3f inputs:diffuseColor = (0.34, 0.22, 0.18)
                color3f inputs:subsurfaceColor = (0.85, 0.24, 0.12)
                float inputs:subsurface = 0.65
                float inputs:roughness = 0.32
                float inputs:clearcoat = 0.15
                float inputs:ior = 1.45
            }
        }
    }
}
`,
  },
  {
    id: 'pacific-sunset',
    title: 'Pacific Lagoon Sunset Traverse',
    subtitle: 'Coral Reef Edge & Teak Arboreal Suspension Walkway',
    location: 'Jaluit Atoll — Marine Sanctuary Haven Zone 2',
    timeOfDay: '18:42 PM Golden Hour',
    lightingSetup: 'Fiery Tangerine Rim Lighting, Lagoon Specular Caustics, Sunset Bloom',
    usdScenePath: '/LumeriaOS/Scenes/Cinematic/Jaluit_Sunset_Traverse_Hyperreal.usda',
    cameraFocalLength: '35mm Widescreen Steadicam f/2.0',
    weather: 'Balmy Pacific Evening (27.8°C, Gentle Salt-Air Sea Spray, 8kt Breeze)',
    primaryAction: 'Suspension Bridge Agile Glide & Sunset Horizon Gaze',
    moodColor: '#f59e0b',
    cameraAngles: [
      { id: 'tracking', label: 'Steadicam Follow', fov: 46 },
      { id: 'profile', label: 'Sunset Silhouette Profile', fov: 32 },
      { id: 'lagoon-reflec', label: 'Lagoon Reflection Cam', fov: 58 },
      { id: 'orbit', label: 'Golden Orbit 360°', fov: 40 },
    ],
    usdaCode: `#usda 1.0
(
    defaultPrim = "Cinematic_Stage_Sunset"
    metersPerUnit = 1.0
    upAxis = "Y"
    timeCodesPerSecond = 60
    doc = "LumeriaOS Hyperrealistic Scene: Pacific Lagoon Sunset Traverse"
)

def Xform "Cinematic_Stage_Sunset"
{
    def Camera "Sunset_Steadicam"
    {
        float focalLength = 35.0
        float fStop = 2.0
        float focusDistance = 3.8
        token projection = "perspective"
        double3 xformOp:translate = (-2.1, 11.2, 3.8)
    }

    def DistantLight "Low_Angle_Sunset_Sun"
    {
        float inputs:intensity = 16800.0
        color3f inputs:color = (1.0, 0.45, 0.15)
        float inputs:angle = 1.2
    }

    def UsdGeomMesh "Coral_Lagoon_WaterSurface"
    {
        color3f primvars:deepWaterColor = (0.02, 0.35, 0.48)
        float primvars:causticStrength = 0.85
        float primvars:specularRoughness = 0.02
    }
}
`,
  },
  {
    id: 'tropical-monsoon',
    title: 'Tropical Monsoon & Bioluminescence',
    subtitle: 'Nocturnal Rain Mist & Glowing Canopy Micro-Organisms',
    location: 'Majuro Atoll — Ancient Breadfruit Deep Grove',
    timeOfDay: '01:15 AM Midnight Rain',
    lightingSetup: 'Cyan Bioluminescent Spores, Specular Water Droplets on Fur, Soft Moonlight',
    usdScenePath: '/LumeriaOS/Scenes/Cinematic/Nocturnal_Monsoon_Biolum_USD.usda',
    cameraFocalLength: '85mm Macro Portrait f/1.2',
    weather: 'Warm Tropical Monsoon Shower (25.4°C, 96% Humidity, Gentle Raindrops)',
    primaryAction: 'Raindrop Grooming, Reflexive Ear Twitches & Emotive Micro-Saccades',
    moodColor: '#38bdf8',
    cameraAngles: [
      { id: 'macro-portrait', label: 'Fur Droplets Macro', fov: 22 },
      { id: 'biolum-canopy', label: 'Bioluminescent Canopy', fov: 52 },
      { id: 'overhead-rain', label: 'Overhead Rain Mist', fov: 60 },
      { id: 'intimate-eye', label: 'Intimate Eye Reflection', fov: 18 },
    ],
    usdaCode: `#usda 1.0
(
    defaultPrim = "Cinematic_Stage_Monsoon"
    metersPerUnit = 1.0
    upAxis = "Y"
    doc = "LumeriaOS Hyperrealistic Scene: Tropical Monsoon & Bioluminescence"
)

def Xform "Cinematic_Stage_Monsoon"
{
    def PointLight "Biolum_Spores_Cluster_01"
    {
        float inputs:intensity = 420.0
        color3f inputs:color = (0.1, 0.95, 0.75)
        float inputs:radius = 1.8
    }

    def UsdGeomPoints "Rain_Droplets_Simulation"
    {
        point3f[] points = [(-2, 18, -1), (0, 16, 1), (3, 17, 2)]
        float[] widths = [0.008, 0.008, 0.008]
        color3f primvars:displayColor = [(0.8, 0.92, 1.0)]
    }

    def Material "Wet_Fur_Shader"
    {
        float inputs:roughness = 0.08
        float inputs:coat = 0.95
        float inputs:coatRoughness = 0.02
    }
}
`,
  },
  {
    id: 'sanctuary-awakening',
    title: 'Sanctuary Awakening & Freedom Flight',
    subtitle: 'Cage-Free Rehabilitation Canopy Panorama',
    location: 'Arno Atoll — Elder & Orphan Rehabilitation Reserve',
    timeOfDay: '11:30 AM Midday Sun',
    lightingSetup: 'Dappled Sunlight, High Contrast Equatorial Brilliance, Trade Breeze Dynamics',
    usdScenePath: '/LumeriaOS/Scenes/Cinematic/Arno_Sanctuary_Awakening_USD.usda',
    cameraFocalLength: '24mm Ultra-Wide Cinematic Crane',
    weather: 'Crystal Pacific Sunshine (28.9°C, 74% Humidity, 15kt Tradewinds)',
    primaryAction: 'Expansive Canopy Overstory Leap & Vigorous Tree Canopy Sway',
    moodColor: '#ec4899',
    cameraAngles: [
      { id: 'wide-crane', label: 'Ultra-Wide Canopy Crane', fov: 72 },
      { id: 'mid-stride', label: 'Dynamic Mid-Air Leap', fov: 45 },
      { id: 'troop-survey', label: 'Troop Matriarch Survey', fov: 38 },
      { id: 'first-person', label: 'Primate Point of View', fov: 80 },
    ],
    usdaCode: `#usda 1.0
(
    defaultPrim = "Cinematic_Stage_Awakening"
    metersPerUnit = 1.0
    upAxis = "Y"
    doc = "LumeriaOS Hyperrealistic Scene: Sanctuary Awakening & Freedom Flight"
)

def Xform "Cinematic_Stage_Awakening"
{
    def Camera "CraneCam_Epic"
    {
        float focalLength = 24.0
        float fStop = 2.8
        token projection = "perspective"
        double3 xformOp:translate = (0.0, 22.5, 8.0)
    }

    def UsdGeomMesh "Pisonia_Grandis_AncientTree"
    {
        string species = "Pisonia grandis (Native Polynesian Bough)"
        float canopySpreadMeters = 32.0
    }
}
`,
  },
  {
    id: 'volumetric-scan',
    title: 'Volumetric LiDAR Scan & USD Raytrace Rig',
    subtitle: 'LumeriaOS Spatial Photogrammetry & Skeletal IK Calibration',
    location: 'LumeriaOS Virtual Simulation Stage / Marshall Atoll Grid',
    timeOfDay: 'Virtual Studio Rig',
    lightingSetup: 'Studio Raytrace 3-Point Key, Rim Cyan, SSS Subsurface Isolator, Grid Matrix',
    usdScenePath: '/LumeriaOS/Scenes/Cinematic/Volumetric_Studio_Turntable_USD.usda',
    cameraFocalLength: '70mm Studio Turntable Ortho/Perspective',
    weather: 'Virtual Cleanroom Calibration Environment',
    primaryAction: '360° Turntable Kinematic Range-of-Motion & Joint Flexing',
    moodColor: '#a855f7',
    cameraAngles: [
      { id: 'turntable', label: '360° Studio Turntable', fov: 35 },
      { id: 'skeletal-ik', label: 'Skeletal Rig & Joint Bones', fov: 40 },
      { id: 'sss-pass', label: 'Subsurface Scattering Pass', fov: 28 },
      { id: 'wire-poly', label: 'Subdivision Mesh Wireframe', fov: 45 },
    ],
    usdaCode: `#usda 1.0
(
    defaultPrim = "Cinematic_Stage_Volumetric"
    metersPerUnit = 1.0
    upAxis = "Y"
    doc = "LumeriaOS Hyperrealistic Scene: Volumetric LiDAR Scan & USD Raytrace Rig"
)

def Xform "Cinematic_Stage_Volumetric"
{
    def Xform "Turntable_Rig"
    {
        double xformOp:rotateY = 180.0
    }

    def Scope "Raytrace_3Point_Lights"
    {
        def RectLight "KeyLight_Soft"
        {
            float inputs:intensity = 4500.0
            float inputs:width = 2.0
            float inputs:height = 2.0
            color3f inputs:color = (1.0, 0.96, 0.92)
        }

        def RectLight "FillLight_Cool"
        {
            float inputs:intensity = 1800.0
            color3f inputs:color = (0.75, 0.88, 1.0)
        }

        def DiskLight "RimLight_NeonEmerald"
        {
            float inputs:intensity = 6200.0
            color3f inputs:color = (0.2, 1.0, 0.6)
        }
    }
}
`,
  },
];
