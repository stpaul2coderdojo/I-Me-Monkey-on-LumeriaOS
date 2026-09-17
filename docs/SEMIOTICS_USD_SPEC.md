# Primate Semiotics & Pixar USD Ethogram Specification

## 1. Ethological Background & Scope

The **LumeriaOS Semiotics Codex** establishes a formal digital representation for simian communication modalities observed in rehabilitated primates across the **Marshall Islands Haven (Majuro & Arno Atolls)**.

The framework codifies communication into three synchronized operational layers:
1. **Ethogram Semiotic Signal**: Latin behavioral name, communicative intent, social context, and literature citations (Altmann, 1962; Hinde & Rowell, 1962; van Lawick-Goodall, 1968; de Waal, 1982).
2. **Kinematic & Acoustic Formants**: Skeletal angles, tail curvature vectors, and acoustic frequency spectrums (Hz).
3. **Pixar USD (`.usda`) Schema**: Standardized property bindings allowing digital twin rendering engines to animate skeletal rigs according to ethological truth.

---

## 2. Modality Classifications

| Modality | Description | Key Indicators | USD Property Target |
| :--- | :--- | :--- | :--- |
| **Tail Kinematics** | Arboreal balance & social status signaling | Elevation angle (0°–90°), distal curl curvature, rapid flicking | `primvars:tailElevationDeg`, `primvars:tailCurvature` |
| **Facial Expression** | Close-range affective and affiliative intent | Lip-smacking, bared-teeth display, eyebrow flashing, open-mouth threat | `blendshapes:lipSmackWeight`, `blendshapes:jawOpen` |
| **Vocalizations** | Acoustic long-range and canopy transmission | Coo calls (450–600 Hz), alarm barks (800–1200 Hz), pant-hoots | `acoustic:spectralCentroidHz`, `acoustic:fundamentalFrequency` |
| **Body Posture** | Kinetic dominance, submission, and invitation | Quadrupedal stiff-legged walk, hunching, presenting hindquarters | `joints:spineFlexion`, `joints:pelvicRotation` |
| **Tactile & Spatial** | Social cohesion and stress reduction | Social allogrooming, side-by-side touching, hand clasping | `tactile:groomingContactIndex`, `spatial:interIndividualDistance` |

---

## 3. Pixar USDA Sample Schema: Rescued Primate Bio

```usda
#usda 1.0
(
    defaultPrim = "RescuedPrimate_Kokoa"
    metersPerUnit = 1.0
    upAxis = "Y"
    doc = "Pixar Universal Scene Description - Rescued Primate Bio Schema (LumeriaOS)"
    customLayerData = {
        string authority = "I-Me-Monkey DAO Custody & Rehabilitation"
        string haven = "Marshall Islands Primate Haven - Majuro Atoll"
        string matrixPortal = "https://conservationonthematrix.weebly.com"
        string usdCompliance = "Pixar USDA Standard 1.0 / LumeriaOS 4.2"
    }
)

def Xform "RescuedPrimate_Kokoa" (
    assetInfo = {
        string name = "Kokoa"
        string species = "Rhesus Macaque (Macaca mulatta)"
        string healthStatus = "Fully Rehabilitated"
    }
)
{
    custom string bio:biography = "Rescued from biomedical quarantine block #4 after 6 years of captive isolation. Now flourishing in Laura Sanctuary Zone."
    custom string bio:rescueOrigin = "Biomedical testing laboratory quarantine block #4"
    custom string bio:captivityDuration = "6 years in solitary cage"
    custom string bio:marshallHavenAtoll = "Majuro Atoll"
    custom double bio:canopyElevationMeters = 15.2
    custom double bio:rehabCalmIndex = 92.4

    def Scope "EthogramState"
    {
        custom token semiotics:activeState = "affiliative_lip_smacking"
        custom double semiotics:confidence = 0.984
        custom double semiotics:tailAngleDeg = 45.0
        custom double semiotics:tailCurvature = 0.25
        custom double semiotics:acousticFrequencyHz = 550.0
    }

    def Skeleton "Simian_Rig"
    {
        // 8-joint articulated tail chain
        uniform token[] joints = [
            "Spine_Root", "Spine_Thoracic", "Neck", "Head",
            "Tail_Base", "Tail_J01", "Tail_J02", "Tail_J03",
            "Tail_J04", "Tail_J05", "Tail_J06", "Tail_Tip"
        ]
    }
}
```

---

## 4. Web Audio Acoustic Synthesis Engine

The application synthesizes real-time primate calls in the browser using the Web Audio API without external audio assets:

- **Sine Wave Oscillator**: Generates tonal affiliative coos and chirps with exponential frequency glide:
  $$\text{Frequency}(t) = f_0 \cdot \exp\left(-\frac{t}{\tau}\right)$$
- **Triangle Wave Oscillator**: Generates percussive alarm barks with rapid attack envelopes (5ms) and high-frequency overtones.
- **Acoustic Formants**: Configured dynamically from the `acousticFrequencyHz` field of the active `SemioticsSignal`.
