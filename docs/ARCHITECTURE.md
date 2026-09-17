# System Architecture Specification

## 1. Overview & Top-Level Topology

The **I-Me-Monkey DAO** architecture bridges high-trust institutional capital with high-frequency micro-governance and physical conservation action in the **Marshall Islands**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT TIER (React 19)                           │
│  - Cross-Chain Governance Dashboard    - Semiotics Lexicon & Ethogram Table │
│  - Google Wallet Pass Minting Client   - Live Camera & Biometric Scanner    │
│  - LumeriaOS USD Raytrace Viewer       - OpenGL Photorealistic Stage        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / JSON-RPC / REST
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BACKEND TIER (Node 22 / Express)                       │
│  - /api/wallet/generate-pass (Google Wallet JWT / Generic Object API)       │
│  - /api/antigravity/audit-proposal (Autonomous Security Sentinel)           │
│  - /api/antigravity/generate-hd-usd-scene (Pixar USDA Raytrace Generator)   │
│  - /api/antigravity/generate-bio-usd (Primate Bio Taxonomy & USD Schema)    │
└───────────────────┬──────────────────────────────────┬──────────────────────┘
                    │                                  │
                    ▼                                  ▼
┌──────────────────────────────────────┐   ┌──────────────────────────────────┐
│          BLOCKCHAIN TIER             │   │       GOOGLE CLOUD INFRA         │
│  - Ethereum Layer-1 Mainnet          │   │  - Vertex AI (Gemini 3.8 Flash)  │
│    (Treasury Vault, Timelock)        │   │  - Cloud KMS (Pass/JWT Signing)  │
│  - Avalanche C-Chain & Subnet        │   │  - Cloud Run (Serverless API)    │
│    (Micro-grants, Miyawaki Parcels)  │   │  - BigQuery (Web3 Public Data)   │
│  - Cross-Chain Teleporter / CCIP     │   │  - Google Kubernetes Engine      │
└──────────────────────────────────────┘   └──────────────────────────────────┘
```

---

## 2. Blockchain Tier: Multi-Chain Governance Division

### Ethereum Layer-1 (Settlement & Capital Preservation)
- **ERC-20 Governance Token (`$IMM`)**: Fixed total supply of 100,000,000 $IMM tokens.
- **Timelock Controller (`0x88F...421E`)**: Enforces a 48-hour delay on multi-sig treasury dispersals greater than $25,000.
- **Safe Multisig Treasury Vault**: Multi-party authorization requiring 3 of 5 signature keys including institutional conservation partners and Republic of Marshall Islands local trustees.

### Avalanche C-Chain & Custom Primate Haven Subnet (Execution)
- **Subnet ID (`subnet-rmi-canopy-441`)**: High-throughput EVM execution environment for:
  - Real-time IoT biometric collars and acoustic monitoring towers across Laura Sanctuary Zone.
  - Miyawaki forest canopy parcel sponsorship NFTs (ERC-721).
  - Gas fees subsidized via native tokenomics for frictionless local participation.
- **Cross-Chain Bridge Verification**: Governed via Chainlink CCIP / Avalanche Teleporter, guarded by the Google Antigravity Sentinel.

---

## 3. Google Wallet Mobile Tokenization Integration

### Zero-Seed-Phrase Onboarding
Traditional Web3 user experience requires browser extensions, seed phrases, and manual gas estimation. I-Me-Monkey DAO circumvents this using **Google Wallet Passes**:

```
[Primate Rescued & Validated]
              │
              ▼
[Cloud KMS Generates Signed JWT with Google Wallet API Object]
              │
              ▼
[User Clicks "Add to Google Wallet" Button on Mobile/Desktop]
              │
              ▼
[Pass Stored in Google Wallet App on Android / WearOS]
              │
              ▼
[In-Person Tap & QR Code Scan at Sanctuary Gate in Majuro]
```

### Generic Pass Classes
1. **`primate_custody_class`**:
   - Header: Primate Name and Rescue ID.
   - Primary Field: Haven Location (Majuro Atoll, Laura Sanctuary Zone).
   - Secondary Fields: Species taxonomy, arrival date, rehabilitation health score.
   - Barcode: Dynamic QR code with signed cryptographic proof of custody.
2. **`dao_voting_share_class`**:
   - Primary Field: Voting Power in $IMM tokens.
   - Secondary Field: Governance Tier (Apex Steward, Arboreal Guardian, Miyawaki Sustainer).
   - QR Code: Resolves to active on-chain snapshot proposal ratification URLs.

---

## 4. Google Antigravity Autonomous Security Agent

The Antigravity Agent operates as a server-side AI sentinel providing:
- **Formal Verification Simulation**: Executes deterministic static audits of proposed smart contract function calls before quorum vote broadcast.
- **Cross-Chain Solvency Validation**: Ensures proposed treasury payouts on Avalanche do not exceed backed collateral on Ethereum L1.
- **Model Cascade**: Leverages `gemini-3.8-flash` with automatic fallback to `gemini-3.6-flash` and strict 6-second execution caps to guarantee high-uptime deterministic evaluations.

---

## 5. LumeriaOS USD (Universal Scene Description) Pipeline

All rescued primates and their forest habitats are digitized into standards-compliant **Pixar USDA 1.0** specifications:
- **`metersPerUnit = 1.0`** and **`upAxis = "Y"`** for physics compliance.
- **Articulated Kinematic Skeleton**: 8-joint tail chain (`Tail_Base` through `Tail_Tip_07`) with flexion and twist bounds.
- **Biometric Metadata**: Embedded custom USDA layer attributes (`custom string bio:marshallHavenAtoll`, `custom double bio:canopyElevationMeters`, `custom string bio:matrixConservationUrl`).
- **Rendering Engines**:
  - **WebGL Shader Stage**: Real-time interactive 3D simulation with Three.js.
  - **Procedural USDA Stage**: Direct source view of the Pixar USDA scene graph for production pipeline export into Houdini, Maya, Omniverse, or Blender.
