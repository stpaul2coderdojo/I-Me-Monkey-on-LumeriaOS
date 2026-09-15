import { MonkeyDigitalTwin } from '../types';
import kokoaImg from '../assets/images/kokoa_rhesus_portrait_1789492570933.jpg';
import jacoImg from '../assets/images/jaco_macaque_portrait_1789492587566.jpg';
import mayaImg from '../assets/images/maya_capuchin_portrait_1789492602501.jpg';
import baronImg from '../assets/images/baron_macaque_portrait_1789492616446.jpg';
import zephyrImg from '../assets/images/zephyr_vervet_portrait_1789492630684.jpg';

export const MARSHALL_ISLANDS_HAVEN_METRICS = {
  sanctuaryName: "Marshall Islands Primate Haven & Agro-Forestry Sanctuary",
  nation: "Republic of the Marshall Islands (RMI)",
  primaryAtoll: "Majuro & Jaluit Atolls",
  coordinates: "7.1095° N, 171.3800° E",
  totalRescuedMonkeys: 18,
  rehabSuccessRate: "98.4%",
  captivitySourcesFreed: ["Biomedical Laboratory Cages", "Illegal Exotic Pet Trade", "Circus & Street Show Exploitation"],
  miyawakiCanopyHectares: 4.8,
  miyawakiTreesPlanted: 57600,
  nativeSpeciesCount: 34,
  lumeriaOsSyncStatus: "Live Spatial Stream Active (60 FPS Telemetry)",
  matrixPortalUrl: "https://conservationonthematrix.weebly.com",
  oceanBreezeFactor: "Optimal (Pacific Trade Winds provide natural temperature regulation)",
};

export const SAMPLE_USDA_STAGE = `#usda 1.0
(
    defaultPrim = "Haven_Marshall_Islands"
    metersPerUnit = 1.0
    upAxis = "Y"
    doc = "LumeriaOS Spatial Digital Twin - Marshall Islands Primate Rehabilitation Haven"
    customLayerData = {
        string engine = "LumeriaOS Spatial Engine v3.4"
        string format = "Universal Scene Description (USD)"
        string conservationMatrix = "https://conservationonthematrix.weebly.com"
        string sanctuary = "Marshall Islands Primate Sanctuary Haven"
        string coordinates = "7.1095 N, 171.3800 E"
    }
)

def Xform "Haven_Marshall_Islands" (
    assetInfo = {
        string name = "Marshall_Islands_Sanctuary_Zone3"
    }
)
{
    def Scope "Miyawaki_Afforestation_Canopy"
    {
        def UsdGeomMesh "Canopy_Overstory_Artocarpus" (
            doc = "Breadfruit & Pacific Native Canopy - 18m elevation"
        )
        {
            float3[] extent = [(-250, 0, -250), (250, 24, 250)]
            int[] faceVertexCounts = [4, 4, 4, 4]
            point3f[] points = [(-10, 18, -10), (10, 18, -10), (10, 18, 10), (-10, 18, 10)]
            uniform token subdivisionScheme = "catmullClark"
        }
        
        def UsdGeomMesh "Miyawaki_SubCanopy_Density" (
            doc = "30x Denser Japanese Miyawaki Method - Hibiscus tiliaceus & Pandanus"
        )
        {
            color3f[] primvars:displayColor = [(0.12, 0.58, 0.24)]
        }
    }

    def Xform "Primate_DigitalTwin_Rig" (
        doc = "LumeriaOS Kinematic USD Skeleton & Telemetry Sensor Prim"
    )
    {
        custom double biometrics:stressIndex = 12.4
        custom double biometrics:rehabProgress = 98.2
        custom double telemetry:canopyElevationMeters = 14.8
        custom string status:rehabPhase = "Cage-Free Miyawaki Canopy Roaming"
        
        def UsdGeomSphere "Biometric_Node_Sensor"
        {
            double radius = 0.15
            color3f[] primvars:displayColor = [(0.18, 0.85, 0.44)]
        }
    }
}
`;

export const INITIAL_DIGITAL_TWINS: MonkeyDigitalTwin[] = [
  {
    id: 'DT-MKY-001',
    name: 'Kokoa',
    species: 'Rhesus Macaque (Macaca mulatta)',
    bio: 'Kokoa spent 6 painful years confined to an 80cm steel laboratory cage undergoing neurological toxicology testing. Transferred to the Marshall Islands Haven under DAO custody, Kokoa has undergone a miraculous recovery. Now the confident matriarch of Troop Sunrise, she navigates the top canopy of Miyawaki Forest Parcel A with graceful arboreal leaps.',
    bioDescriptionUsd: `#usda 1.0
(
    defaultPrim = "RescuedPrimate_Kokoa"
    metersPerUnit = 1.0
    upAxis = "Y"
    doc = "Pixar Universal Scene Description - Rescued Primate Bio Schema (LumeriaOS)"
    customLayerData = {
        string authority = "I-Me-Monkey DAO Custody & Rehabilitation"
        string haven = "Marshall Islands Primate Haven - Majuro Atoll"
        string matrixPortal = "https://conservationonthematrix.weebly.com"
        string usdCompliance = "Pixar USDA Standard 1.0 / LumeriaOS 3.4"
    }
)

def Xform "RescuedPrimate_Kokoa" (
    assetInfo = {
        string name = "Kokoa"
        string identifier = "DT-MKY-001"
        string species = "Rhesus Macaque (Macaca mulatta)"
        string gender = "Female"
        int age = 9
        string healthStatus = "Fully Rehabilitated"
    }
)
{
    custom string bio:biography = "Kokoa spent 6 painful years confined to an 80cm steel laboratory cage undergoing neurological toxicology testing. Transferred to the Marshall Islands Haven under DAO custody, Kokoa has undergone a miraculous recovery. Now the confident matriarch of Troop Sunrise, she navigates the top canopy of Miyawaki Forest Parcel A with graceful arboreal leaps."
    custom string bio:rescueOrigin = "Former biomedical research facility cage #B-402"
    custom string bio:captivityDuration = "6 years in solitary steel laboratory enclosure"
    custom string bio:rehabTimeline = "2024-03-14 Ingestion -> 90-day isolation decomp -> 180-day sensory recovery -> Full canopy release"
    custom string bio:marshallHavenAtoll = "Majuro Atoll, Zone 1 - High Canopy Miyawaki Bio-Corridor (7.1095 N, 171.3800 E)"
    custom string bio:favoriteForage = "Fresh Marshallese Breadfruit & Ripe Papaya"
    custom string bio:socialRole = "Matriarch of Sunrise Canopy Troop"
    custom double bio:canopyElevationMeters = 16.2
    custom double bio:rehabCalmIndex = 89.0
    custom string bio:blockchainProof = "0x8f4b119a07842c129e0018f238bfa79100ac39185a73e6d1c82834b9d03829aa"
}
`,
    imageUrl: kokoaImg,
    age: 9,
    gender: 'Female',
    rescueOrigin: 'Former biomedical research facility cage #B-402',
    captivityDuration: '6 years in solitary steel laboratory enclosure',
    rehabHavenLocation: {
      sanctuaryName: 'Marshall Islands Primate Haven',
      atoll: 'Majuro Atoll',
      coordinates: '7.1095° N, 171.3800° E',
      havenZone: 'Zone 1 - High Canopy Miyawaki Bio-Corridor',
      climateProfile: 'Tropical Ocean Haven (28.4°C, 78% Humidity, Constant Pacific Trade Winds)',
      canopyShadeCoverage: 94,
    },
    lumeriaOsAnimation: {
      usdFormat: 'USD',
      usdScenePath: '/LumeriaOS/Haven/MarshallIslands/Primates/Kokoa_Arboreal_USD.usda',
      fps: 60,
      totalFrames: 360,
      simulationStage: 'Arboreal Canopy Foraging & Quadrupedal Traverse',
      biometrics: {
        stressIndex: 11, // Down from 94 during captivity
        canopyElevationMeters: 16.2,
        activityState: 'Foraging',
        dietaryIntakeKcal: 1840,
      },
      usdMeshNodes: [
        '/World/MarshallHaven/Miyawaki_Canopy_Trees',
        '/World/Primates/Kokoa/Skeleton_Root_Jnt',
        '/World/LumeriaOS/Telemetry/GPS_Tracker',
        '/World/Environment/Ocean_Trade_Wind_Vector'
      ],
      animationType: 'usd_spatial_mesh',
      usdStageAscii: SAMPLE_USDA_STAGE,
    },
    miyawakiParcelId: 'MIYAWAKI-PARCEL-MAJURO-ALPHA',
    healthStatus: 'Fully Rehabilitated',
    onChainHash: '0x8f4b119a07842c129e0018f238bfa79100ac39185a73e6d1c82834b9d03829aa',
    matrixConservationUrl: 'https://conservationonthematrix.weebly.com',
    lumeriaOsTelemetrySync: true,
    joinedHavenDate: '2024-03-14',
    googleWalletTwinBadge: true,
    favoriteForage: 'Fresh Marshallese Breadfruit & Ripe Papaya',
    socialTroopName: 'Sunrise Canopy Troop',
  },
  {
    id: 'DT-MKY-002',
    name: 'Jaco',
    species: 'Long-tailed Macaque (Macaca fascicularis)',
    bio: 'Rescued from an illegal tourist exploitation ring where he was chained by the neck to a concrete post for photo souvenirs. When Jaco first arrived at the Marshall Islands Haven, his neck was scarred and he feared human shadows. Guided by LumeriaOS ambient sensory conditioning and the lush shelter of the Miyawaki dense micro-forest, Jaco has reclaimed his natural dignity and acrobatics.',
    bioDescriptionUsd: `#usda 1.0
(
    defaultPrim = "RescuedPrimate_Jaco"
    metersPerUnit = 1.0
    upAxis = "Y"
    doc = "Pixar Universal Scene Description - Rescued Primate Bio Schema (LumeriaOS)"
    customLayerData = {
        string authority = "I-Me-Monkey DAO Custody & Rehabilitation"
        string haven = "Marshall Islands Primate Haven - Jaluit Atoll"
        string matrixPortal = "https://conservationonthematrix.weebly.com"
        string usdCompliance = "Pixar USDA Standard 1.0 / LumeriaOS 3.4"
    }
)

def Xform "RescuedPrimate_Jaco" (
    assetInfo = {
        string name = "Jaco"
        string identifier = "DT-MKY-002"
        string species = "Long-tailed Macaque (Macaca fascicularis)"
        string gender = "Male"
        int age = 5
        string healthStatus = "Active Rehabilitation"
    }
)
{
    custom string bio:biography = "Rescued from an illegal tourist exploitation ring where he was chained by the neck to a concrete post for photo souvenirs. When Jaco first arrived at the Marshall Islands Haven, his neck was scarred and he feared human shadows. Guided by LumeriaOS ambient sensory conditioning and the lush shelter of the Miyawaki dense micro-forest, Jaco has reclaimed his natural dignity and acrobatics."
    custom string bio:rescueOrigin = "Confiscated from illegal street entertainment chain captivity"
    custom string bio:captivityDuration = "3 years chained to concrete post"
    custom string bio:rehabTimeline = "2024-09-22 Arrived with neck lesions -> Soft silicone laser therapy -> Lagoon bridge acrobatic conditioning"
    custom string bio:marshallHavenAtoll = "Jaluit Atoll, Zone 2 - Lagoon Arboreal Bridge & Mango Grove (5.9167 N, 169.6333 E)"
    custom string bio:favoriteForage = "Native Marshallese Coconut Flesh & Pandanus Fruit"
    custom string bio:socialRole = "Acrobatic Scout of Lagoon Explorers Troop"
    custom double bio:canopyElevationMeters = 13.5
    custom double bio:rehabCalmIndex = 82.0
    custom string bio:blockchainProof = "0x3c9902bb1478129e7710928af00129774a819b990172e29381c19d44321ab887"
}
`,
    imageUrl: jacoImg,
    age: 5,
    gender: 'Male',
    rescueOrigin: 'Confiscated from illegal street entertainment chain captivity',
    captivityDuration: '3 years chained to concrete post',
    rehabHavenLocation: {
      sanctuaryName: 'Marshall Islands Primate Haven',
      atoll: 'Jaluit Atoll',
      coordinates: '5.9167° N, 169.6333° E',
      havenZone: 'Zone 2 - Lagoon Arboreal Bridge & Mango Grove',
      climateProfile: 'Pristine Marine Atoll (27.8°C, Gentle Salt-Air Healing)',
      canopyShadeCoverage: 91,
    },
    lumeriaOsAnimation: {
      usdFormat: 'USD',
      usdScenePath: '/LumeriaOS/Haven/MarshallIslands/Primates/Jaco_Acrobatic_USD.usda',
      fps: 60,
      totalFrames: 360,
      simulationStage: 'Canopy Rope & Branch Acrobatics',
      biometrics: {
        stressIndex: 18,
        canopyElevationMeters: 13.5,
        activityState: 'Climbing',
        dietaryIntakeKcal: 2100,
      },
      usdMeshNodes: [
        '/World/MarshallHaven/Arboreal_Bridges',
        '/World/Primates/Jaco/Kinematic_USD_Rig',
        '/World/LumeriaOS/Environmental_Microbiome'
      ],
      animationType: 'lumeria_kinematic_usd',
      usdStageAscii: SAMPLE_USDA_STAGE,
    },
    miyawakiParcelId: 'MIYAWAKI-PARCEL-JALUIT-BETA',
    healthStatus: 'Active Rehabilitation',
    onChainHash: '0x3c9902bb1478129e7710928af00129774a819b990172e29381c19d44321ab887',
    matrixConservationUrl: 'https://conservationonthematrix.weebly.com',
    lumeriaOsTelemetrySync: true,
    joinedHavenDate: '2024-09-22',
    googleWalletTwinBadge: true,
    favoriteForage: 'Native Marshallese Coconut Flesh & Pandanus Fruit',
    socialTroopName: 'Lagoon Explorers Troop',
  },
  {
    id: 'DT-MKY-003',
    name: 'Maya',
    species: 'White-faced Capuchin (Cebus capucinus)',
    bio: 'Rescued from an illicit exotic pet trafficking bust inside an unventilated wooden crate. Maya arrived malnourished with stunted bone density. The Marshall Islands Haven nutritional protocol combined with mineral-rich volcanic soil runoff in the Miyawaki forest has completely restored her agility. She is fascinated by water basins and teaches younger monkeys tool-assisted nut cracking.',
    bioDescriptionUsd: `#usda 1.0
(
    defaultPrim = "RescuedPrimate_Maya"
    metersPerUnit = 1.0
    upAxis = "Y"
    doc = "Pixar Universal Scene Description - Rescued Primate Bio Schema (LumeriaOS)"
    customLayerData = {
        string authority = "I-Me-Monkey DAO Custody & Rehabilitation"
        string haven = "Marshall Islands Primate Haven - Majuro Atoll"
        string matrixPortal = "https://conservationonthematrix.weebly.com"
        string usdCompliance = "Pixar USDA Standard 1.0 / LumeriaOS 3.4"
    }
)

def Xform "RescuedPrimate_Maya" (
    assetInfo = {
        string name = "Maya"
        string identifier = "DT-MKY-003"
        string species = "White-faced Capuchin (Cebus capucinus)"
        string gender = "Female"
        int age = 4
        string healthStatus = "Fully Rehabilitated"
    }
)
{
    custom string bio:biography = "Rescued from an illicit exotic pet trafficking bust inside an unventilated wooden crate. Maya arrived malnourished with stunted bone density. The Marshall Islands Haven nutritional protocol combined with mineral-rich volcanic soil runoff in the Miyawaki forest has completely restored her agility. She is fascinated by water basins and teaches younger monkeys tool-assisted nut cracking."
    custom string bio:rescueOrigin = "Illicit wildlife smuggling trafficking container"
    custom string bio:captivityDuration = "18 months in black-market confinement box"
    custom string bio:rehabTimeline = "2025-01-10 Admitted -> Mineral replenishment -> Tool usage enrichment -> Peer group mentoring"
    custom string bio:marshallHavenAtoll = "Majuro Atoll, Zone 3 - Miyawaki Agro-Forestry Nursery (7.1095 N, 171.3800 E)"
    custom string bio:favoriteForage = "Tender Hibiscus Flowers & Crushed Macadamia"
    custom string bio:socialRole = "Cognitive Tool Mentor in Sunrise Canopy Troop"
    custom double bio:canopyElevationMeters = 11.2
    custom double bio:rehabCalmIndex = 86.0
    custom string bio:blockchainProof = "0x59a117bc992019aebc198733219001928374189aaeeff00192847118239471ab"
}
`,
    imageUrl: mayaImg,
    age: 4,
    gender: 'Female',
    rescueOrigin: 'Illicit wildlife smuggling trafficking container',
    captivityDuration: '18 months in black-market confinement box',
    rehabHavenLocation: {
      sanctuaryName: 'Marshall Islands Primate Haven',
      atoll: 'Majuro Atoll',
      coordinates: '7.1095° N, 171.3800° E',
      havenZone: 'Zone 3 - Miyawaki Agro-Forestry Nursery',
      climateProfile: 'Tropical Marine Sanctuary (28.1°C, 81% Humidity)',
      canopyShadeCoverage: 96,
    },
    lumeriaOsAnimation: {
      usdFormat: 'USD',
      usdScenePath: '/LumeriaOS/Haven/MarshallIslands/Primates/Maya_Nutcracker_USD.usda',
      fps: 60,
      totalFrames: 360,
      simulationStage: 'Tool-Assisted Foraging & Arboreal Socializing',
      biometrics: {
        stressIndex: 14,
        canopyElevationMeters: 11.2,
        activityState: 'Arboreal Play',
        dietaryIntakeKcal: 1720,
      },
      usdMeshNodes: [
        '/World/MarshallHaven/Tool_Forage_RockBasin',
        '/World/Primates/Maya/Hand_Carpal_Rig',
        '/World/LumeriaOS/Sensory_Acoustic_Loop'
      ],
      animationType: 'usd_spatial_mesh',
      usdStageAscii: SAMPLE_USDA_STAGE,
    },
    miyawakiParcelId: 'MIYAWAKI-PARCEL-MAJURO-GAMMA',
    healthStatus: 'Fully Rehabilitated',
    onChainHash: '0x59a117bc992019aebc198733219001928374189aaeeff00192847118239471ab',
    matrixConservationUrl: 'https://conservationonthematrix.weebly.com',
    lumeriaOsTelemetrySync: true,
    joinedHavenDate: '2025-01-10',
    googleWalletTwinBadge: true,
    favoriteForage: 'Tender Hibiscus Flowers & Crushed Macadamia',
    socialTroopName: 'Sunrise Canopy Troop',
  },
  {
    id: 'DT-MKY-004',
    name: 'Baron',
    species: 'Pig-tailed Macaque (Macaca nemestrina)',
    bio: 'Freed from 8 years of forced commercial coconut harvesting labor where he suffered severe psychological burnout and joint trauma. At the Marshall Islands Haven, Baron is never forced to work; instead, he enjoys resting on elevated custom teak wood hammocks suspended in the Miyawaki canopy and receiving infrared physiotherapy monitored by LumeriaOS.',
    bioDescriptionUsd: `#usda 1.0
(
    defaultPrim = "RescuedPrimate_Baron"
    metersPerUnit = 1.0
    upAxis = "Y"
    doc = "Pixar Universal Scene Description - Rescued Primate Bio Schema (LumeriaOS)"
    customLayerData = {
        string authority = "I-Me-Monkey DAO Custody & Rehabilitation"
        string haven = "Marshall Islands Primate Haven - Arno Atoll"
        string matrixPortal = "https://conservationonthematrix.weebly.com"
        string usdCompliance = "Pixar USDA Standard 1.0 / LumeriaOS 3.4"
    }
)

def Xform "RescuedPrimate_Baron" (
    assetInfo = {
        string name = "Baron"
        string identifier = "DT-MKY-004"
        string species = "Pig-tailed Macaque (Macaca nemestrina)"
        string gender = "Male"
        int age = 12
        string healthStatus = "Elder Care"
    }
)
{
    custom string bio:biography = "Freed from 8 years of forced commercial coconut harvesting labor where he suffered severe psychological burnout and joint trauma. At the Marshall Islands Haven, Baron is never forced to work; instead, he enjoys resting on elevated custom teak wood hammocks suspended in the Miyawaki canopy and receiving infrared physiotherapy monitored by LumeriaOS."
    custom string bio:rescueOrigin = "Commercial forced coconut labor exploitation"
    custom string bio:captivityDuration = "8 years chained in forced servitude"
    custom string bio:rehabTimeline = "2025-04-03 Rescued -> Joint anti-inflammatory nutrition -> Teak canopy hammock acclimatization"
    custom string bio:marshallHavenAtoll = "Arno Atoll, Zone 4 - Elder Primate Sanctuary & Gentle Canopy Walkways (7.0667 N, 171.7000 E)"
    custom string bio:favoriteForage = "Sweet Bananas & Chilled Coconut Milk"
    custom string bio:socialRole = "Venerable Elder Patriarch of Peaceful Canopy Elders"
    custom double bio:canopyElevationMeters = 7.8
    custom double bio:rehabCalmIndex = 91.0
    custom string bio:blockchainProof = "0x17fa2b9487192803847119283741892837419823741982734918273491827341"
}
`,
    imageUrl: baronImg,
    age: 12,
    gender: 'Male',
    rescueOrigin: 'Commercial forced coconut labor exploitation',
    captivityDuration: '8 years chained in forced servitude',
    rehabHavenLocation: {
      sanctuaryName: 'Marshall Islands Primate Haven',
      atoll: 'Arno Atoll',
      coordinates: '7.0667° N, 171.7000° E',
      havenZone: 'Zone 4 - Elder Primate Sanctuary & Gentle Canopy Walkways',
      climateProfile: 'Quiet Protected Atoll Haven (28.0°C, Sea Spray Mist)',
      canopyShadeCoverage: 98,
    },
    lumeriaOsAnimation: {
      usdFormat: 'USD',
      usdScenePath: '/LumeriaOS/Haven/MarshallIslands/Primates/Baron_Elder_Care_USD.usda',
      fps: 60,
      totalFrames: 360,
      simulationStage: 'Gentle Walkway Traversal & Sunlight Rest',
      biometrics: {
        stressIndex: 9,
        canopyElevationMeters: 7.8,
        activityState: 'Resting in Canopy',
        dietaryIntakeKcal: 1950,
      },
      usdMeshNodes: [
        '/World/MarshallHaven/Elder_Hammock_Suspension',
        '/World/Primates/Baron/Joint_Physio_Sensors',
        '/World/LumeriaOS/Biometrics_Telemetry'
      ],
      animationType: 'usd_spatial_mesh',
      usdStageAscii: SAMPLE_USDA_STAGE,
    },
    miyawakiParcelId: 'MIYAWAKI-PARCEL-ARNO-DELTA',
    healthStatus: 'Elder Care',
    onChainHash: '0x17fa2b9487192803847119283741892837419823741982734918273491827341',
    matrixConservationUrl: 'https://conservationonthematrix.weebly.com',
    lumeriaOsTelemetrySync: true,
    joinedHavenDate: '2025-04-03',
    googleWalletTwinBadge: true,
    favoriteForage: 'Sweet Bananas & Chilled Coconut Milk',
    socialTroopName: 'Peaceful Canopy Elders',
  },
  {
    id: 'DT-MKY-005',
    name: 'Zephyr',
    species: 'Green Vervet Monkey (Chlorocebus pygerythrus)',
    bio: 'Confiscated by wildlife enforcement agents from an unregistered ocean cargo vessel where he was held in an engine-room storage crate. Once terrified of mechanical noise, Zephyr now thrives in the tranquil, rustling breadfruit groves of Jaluit Atoll. His keen sentinel alarm calls keep his adoptive troop safe during sudden Pacific squalls.',
    bioDescriptionUsd: `#usda 1.0
(
    defaultPrim = "RescuedPrimate_Zephyr"
    metersPerUnit = 1.0
    upAxis = "Y"
    doc = "Pixar Universal Scene Description - Rescued Primate Bio Schema (LumeriaOS)"
    customLayerData = {
        string authority = "I-Me-Monkey DAO Custody & Rehabilitation"
        string haven = "Marshall Islands Primate Haven - Jaluit Atoll"
        string matrixPortal = "https://conservationonthematrix.weebly.com"
        string usdCompliance = "Pixar USDA Standard 1.0 / LumeriaOS 3.4"
    }
)

def Xform "RescuedPrimate_Zephyr" (
    assetInfo = {
        string name = "Zephyr"
        string identifier = "DT-MKY-005"
        string species = "Green Vervet Monkey (Chlorocebus pygerythrus)"
        string gender = "Male"
        int age = 3
        string healthStatus = "Active Rehabilitation"
    }
)
{
    custom string bio:biography = "Confiscated by wildlife enforcement agents from an unregistered ocean cargo vessel where he was held in an engine-room storage crate. Once terrified of mechanical noise, Zephyr now thrives in the tranquil, rustling breadfruit groves of Jaluit Atoll. His keen sentinel alarm calls keep his adoptive troop safe during sudden Pacific squalls."
    custom string bio:rescueOrigin = "Cargo vessel illegal contraband seizure"
    custom string bio:captivityDuration = "11 months in maritime engine container"
    custom string bio:rehabTimeline = "2025-06-18 Rescued -> Auditory trauma therapy -> Coral lagoon foraging integration"
    custom string bio:marshallHavenAtoll = "Jaluit Atoll, Zone 2 - Outer Reef Agroforestry Belt (5.9167 N, 169.6333 E)"
    custom string bio:favoriteForage = "Tender Breadfruit Shoots & Wild Island Figs"
    custom string bio:socialRole = "Vigilant Sentinel of Lagoon Explorers Troop"
    custom double bio:canopyElevationMeters = 15.4
    custom double bio:rehabCalmIndex = 84.0
    custom string bio:blockchainProof = "0x4b7218ef9012384a71b2901248761298471badefa00192847118239471192847"
}
`,
    imageUrl: zephyrImg,
    age: 3,
    gender: 'Male',
    rescueOrigin: 'Cargo vessel illegal contraband seizure',
    captivityDuration: '11 months in maritime engine container',
    rehabHavenLocation: {
      sanctuaryName: 'Marshall Islands Primate Haven',
      atoll: 'Jaluit Atoll',
      coordinates: '5.9167° N, 169.6333° E',
      havenZone: 'Zone 2 - Outer Reef Agroforestry Belt',
      climateProfile: 'Coastal Pacific Trade Wind Corridor (27.9°C, Fresh Sea Mist)',
      canopyShadeCoverage: 93,
    },
    lumeriaOsAnimation: {
      usdFormat: 'USD',
      usdScenePath: '/LumeriaOS/Haven/MarshallIslands/Primates/Zephyr_Lagoon_Sentinel_USD.usda',
      fps: 60,
      totalFrames: 360,
      simulationStage: 'Canopy Sentinel Leaps & Arboreal Foraging',
      biometrics: {
        stressIndex: 16,
        canopyElevationMeters: 15.4,
        activityState: 'Climbing',
        dietaryIntakeKcal: 1680,
      },
      usdMeshNodes: [
        '/World/MarshallHaven/Reef_Canopy_Trees',
        '/World/Primates/Zephyr/Kinematic_USD_Rig',
        '/World/LumeriaOS/Pacific_Acoustic_Stream'
      ],
      animationType: 'lumeria_kinematic_usd',
      usdStageAscii: SAMPLE_USDA_STAGE,
    },
    miyawakiParcelId: 'MIYAWAKI-PARCEL-JALUIT-GAMMA',
    healthStatus: 'Active Rehabilitation',
    onChainHash: '0x4b7218ef9012384a71b2901248761298471badefa00192847118239471192847',
    matrixConservationUrl: 'https://conservationonthematrix.weebly.com',
    lumeriaOsTelemetrySync: true,
    joinedHavenDate: '2025-06-18',
    googleWalletTwinBadge: true,
    favoriteForage: 'Tender Breadfruit Shoots & Wild Island Figs',
    socialTroopName: 'Lagoon Explorers Troop',
  },
];
