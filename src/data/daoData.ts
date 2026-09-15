import { NetworkConfig, DAOProposal, TreasuryAsset, WalletAccount, GoogleForStartupsGrantApp } from '../types';

export const NETWORKS: Record<'ethereum' | 'avalanche', NetworkConfig> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    nativeCurrency: 'Ether',
    symbol: 'ETH',
    chainId: 1,
    rpcStatus: 'operational',
    currentBlock: 20748192,
    avgGas: '16.4 Gwei',
    explorerName: 'Etherscan',
    explorerUrl: 'https://etherscan.io',
    immTokenAddress: '0x88c6e24177d716D0807ffFa522967F7bA8e91B33',
    governorAddress: '0x321e90d192Eb7C1d69d7B4A1a71A9144888C0462',
    timelockAddress: '0x59a39A5d60C895C989d97096E37435f309995166',
    color: '#38bdf8', // sky-400
    badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  avalanche: {
    id: 'avalanche',
    name: 'Avalanche C-Chain',
    shortName: 'Avalanche',
    nativeCurrency: 'AVAX',
    symbol: 'AVAX',
    chainId: 43114,
    rpcStatus: 'operational',
    currentBlock: 48912304,
    avgGas: '26.8 nAVAX',
    explorerName: 'Snowtrace',
    explorerUrl: 'https://snowtrace.io',
    immTokenAddress: '0xE831804F5E6c5D607384A95015e347517EaAc829',
    governorAddress: '0x994a31C824b2E4a1017bcaE0330D0455B90772C3',
    timelockAddress: '0x2280dD92Fe1293aB245642a8b941584852924151',
    color: '#f43f5e', // rose-500
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
};

export const INITIAL_ACCOUNTS: WalletAccount[] = [
  {
    address: '0x71C2a8B428e5a7bF14c67A837f4AdfFe8eD649bE',
    ensName: 'elder-monkey.eth',
    tier: 'Genesis Elder Monkey',
    votingPower: 125000,
    stakedImm: 250000,
    ethBalance: 14.85,
    avaxBalance: 320.5,
    immBalance: 45000,
    googleWalletPassInstalled: true,
    avatarSeed: 'elder-42',
  },
  {
    address: '0x9A48bF32D582b993214aB02773c33285918667a1',
    ensName: 'banana-delegate.avax',
    tier: 'Gold Delegate',
    votingPower: 65000,
    stakedImm: 120000,
    ethBalance: 3.2,
    avaxBalance: 180.0,
    immBalance: 12000,
    googleWalletPassInstalled: false,
    avatarSeed: 'delegate-9',
  },
  {
    address: '0x33B9174A53eE5998188151241a77eA642B591288',
    ensName: 'contributor-dev.eth',
    tier: 'Silver Contributor',
    votingPower: 22500,
    stakedImm: 45000,
    ethBalance: 1.1,
    avaxBalance: 75.2,
    immBalance: 8500,
    googleWalletPassInstalled: false,
    avatarSeed: 'contributor-3',
  },
];

export const INITIAL_TREASURY: TreasuryAsset[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum Reserve',
    chain: 'ethereum',
    amount: 420.5,
    priceUsd: 3420,
    usdValue: 1438110,
    allocationPercent: 34.2,
    change24h: 3.4,
  },
  {
    symbol: 'AVAX',
    name: 'Avalanche Reserve',
    chain: 'avalanche',
    amount: 34200,
    priceUsd: 34.8,
    usdValue: 1190160,
    allocationPercent: 28.3,
    change24h: 5.1,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin Liquidity (Cross-Chain)',
    chain: 'ethereum',
    amount: 850000,
    priceUsd: 1.0,
    usdValue: 850000,
    allocationPercent: 20.2,
    change24h: 0.01,
  },
  {
    symbol: '$IMM',
    name: 'I-Me-Monkey Protocol Reserve',
    chain: 'avalanche',
    amount: 30700000,
    priceUsd: 0.024,
    usdValue: 736800,
    allocationPercent: 17.3,
    change24h: 12.8,
  },
];

export const INITIAL_PROPOSALS: DAOProposal[] = [
  {
    id: 44,
    title: 'MIP-44: Miyawaki Forest Protocol: Marshall Islands Monkey Sanctuary Canopy Phase 1 (Majuro Atoll)',
    description: 'Deploy Akira Miyawaki multi-tiered afforestation (30 native Marshallese tree species, 30x denser canopy, 10x faster growth) to create 4.8 hectares of self-sustaining fruit and shade canopy for rescued primates freed from captive laboratory enclosures in the Marshall Islands haven.',
    fullBody: `### Miyawaki Afforestation Protocol Overview
This proposal establishes the **Miyawaki Agro-Forestry Protocol** in Majuro Atoll, Republic of the Marshall Islands, creating a dense multi-tiered sanctuary canopy for monkeys rescued from biomedical, pet trade, and circus captivity.

### Scientific Methodology (Miyawaki Method)
1. **Multi-Tiered Stratification**:
   - **Main Tree Layer (15–20m)**: Breadfruit (Artocarpus altilis), Native Pacific Banyan, Calophyllum inophyllum.
   - **Sub-Tree Layer (6–12m)**: Guettarda speciosa, Pandanus tectorius, Cordia subcordata.
   - **Shrub Layer (2–5m)**: Scaevola taccada, Native Hibiscus tiliaceus, Morinda citrifolia (Noni).
   - **Living Groundcover (0–1m)**: Native ferns and nitrogen-fixing legumes.
2. **Dense Planting Density**: 3 to 4 saplings per square meter (30x denser than standard forestry, achieving mature closed canopy in 24 months).
3. **Integration with LumeriaOS & Matrix Conservation**:
   - Soil moisture, canopy temperature, and primate arboreal pathways modeled in LumeriaOS USD digital twins.
   - Direct reporting to [conservationonthematrix.weebly.com](https://conservationonthematrix.weebly.com).

### Treasury Allocation & On-Chain Execution
- Target: Marshall Islands Haven Environmental Multisig (ETH/AVAX)
- Budget: 45,000 USDC + 120,000 $IMM (saplings, biochar soil conditioning, local Marshallese agro-forestry stewardship).`,
    proposer: '0x71C2a8B428e5a7bF14c67A837f4AdfFe8eD649bE',
    category: 'Miyawaki Afforestation & Rehab',
    chain: 'cross-chain',
    status: 'active',
    votesFor: 2310000,
    votesAgainst: 18000,
    votesAbstain: 5000,
    quorumNeeded: 1500000,
    totalVoters: 294,
    createdAt: '2026-09-14T08:00:00Z',
    endsAt: '2026-09-21T08:00:00Z',
    executionAction: 'fundMiyawakiMarshallHavenPhase1()',
    antigravityAudit: {
      score: 99,
      verdict: 'Ecological & Solvency Verified | Zero Protocol Risk',
      details: 'Antigravity verified that funding creates perpetual agro-forestry sanctuary value. Multi-chain timelock escrow releases funds based on verifiable LumeriaOS satellite canopy growth telemetry.',
    },
    miyawakiData: {
      treesPlanted: 57600,
      canopyHectares: 4.8,
      densityPerSqM: 3.5,
      targetHavenAtoll: 'Majuro Atoll, Marshall Islands',
      biomassGrowthRateMultiplier: 10,
      projectedCarbonOffsetTons: 142.5,
      conservationPortalUrl: 'https://conservationonthematrix.weebly.com',
    },
  },
  {
    id: 43,
    title: 'MIP-43: LumeriaOS USD Spatial Digital Twin Architecture & Conservation on the Matrix Integration',
    description: 'Ratify the LumeriaOS Universal Scene Description (USD/USDA) standard for real-time digital twins of all rehabilitated primates in the Marshall Islands, establishing live IoT biometrics and bridging DAO telemetry to conservationonthematrix.weebly.com.',
    fullBody: `### Digital Twin & LumeriaOS Architecture
Authorizes the integration of **LumeriaOS Spatial Engine** to manage 3D kinematic Digital Twins of every primate rehabilitated from captivity in the Marshall Islands haven.

### Core Capabilities
1. **Pixar USD / Omniverse Interoperability**: Each monkey's digital twin is exported as an open-standard USD/USDA scene hierarchy containing physiological meshes, arboreal movement kinematics, and biometric sensor streams.
2. **Real-Time Biometric Health Telemetry**: Live cardiac BPM, stress index decay curves, canopy altitude, and dietary tracking fed directly from non-invasive haven IoT nodes.
3. **Matrix Conservation Integration**: Cross-linking all digital twin metadata and rehabilitation milestones to [conservationonthematrix.weebly.com](https://conservationonthematrix.weebly.com).
4. **Rich Card & JSON Input Interface**: Enables DAO stewards, zoologists, and haven veterinarians to import and update monkey digital twins via raw JSON or responsive rich visual cards.`,
    proposer: '0x9A48bF32D582b993214aB02773c33285918667a1',
    category: 'Miyawaki Afforestation & Rehab',
    chain: 'avalanche',
    status: 'active',
    votesFor: 1980000,
    votesAgainst: 32000,
    votesAbstain: 8000,
    quorumNeeded: 1500000,
    totalVoters: 255,
    createdAt: '2026-09-13T11:00:00Z',
    endsAt: '2026-09-20T11:00:00Z',
    executionAction: 'deployLumeriaOsUsdRelay()',
    antigravityAudit: {
      score: 97,
      verdict: 'Architecture Verified | High Impact',
      details: 'USD schema conforms to Pixar and ISO spatial digital twin standards. Avalanche C-Chain hash anchoring guarantees immutable provenance of primate health records.',
    },
    miyawakiData: {
      treesPlanted: 18400,
      canopyHectares: 2.1,
      densityPerSqM: 3.2,
      targetHavenAtoll: 'Jaluit & Majuro Atolls',
      biomassGrowthRateMultiplier: 10,
      projectedCarbonOffsetTons: 64.0,
      conservationPortalUrl: 'https://conservationonthematrix.weebly.com',
    },
  },
  {
    id: 42,
    title: 'MIP-42: Ratify Google for Startups Cloud Application & Deploy Google Antigravity Agent Core',
    description: 'Formal DAO approval to submit the $200k Google Cloud Web3 startup grant application and grant the Google Antigravity Agent autonomous pre-execution security verification authority over Ethereum and Avalanche timelock contracts.',
    fullBody: `### Proposal Summary
This proposal authorizes the I-Me-Monkey DAO Core Council to finalize and execute the grant agreement with **Google for Startups Cloud Program (Web3 & AI Tier)**.

### Key Deliverables & Implementation
1. **Google Cloud Grant Utilization**: Up to $200,000 in Google Cloud and Vertex AI credits to run Ethereum archive RPC nodes, Avalanche validator nodes, and BigQuery Web3 indexing.
2. **Google Antigravity Agent Integration**: Implement the Antigravity autonomous security auditor across Ethereum (L1) and Avalanche C-Chain contracts to simulate proposal execution safety, verify bridge liquidity, and prevent malicious multi-sig state attacks.
3. **Google Wallet Tokenized Pass Expansion**: Subsidize gas fees for the first 10,000 verified DAO members to mint their zero-friction Google Wallet credentials.

### Execution Payload
- Target: Cross-Chain Timelock Coordinator (0x59a39A... and 0x2280dD...)
- Allocation: $0 from treasury (100% funded via Google Cloud grant).`,
    proposer: '0x71C2a8B428e5a7bF14c67A837f4AdfFe8eD649bE',
    category: 'Google Cloud Grant',
    chain: 'cross-chain',
    status: 'active',
    votesFor: 1845000,
    votesAgainst: 42000,
    votesAbstain: 15000,
    quorumNeeded: 1500000,
    totalVoters: 248,
    createdAt: '2026-09-12T14:00:00Z',
    endsAt: '2026-09-19T14:00:00Z',
    executionAction: 'ratifyGoogleForStartupsApp()',
    antigravityAudit: {
      score: 98,
      verdict: 'Zero Economic Risk | High Strategic Value',
      details: 'Antigravity verified that no treasury funds are encumbered. Google Cloud credits provide non-dilutive computational infrastructure across ETH & AVAX.',
    },
  },
  {
    id: 41,
    title: 'MIP-41: Launch Avalanche Subnet Teleporter Bridge for Zero-Fee Quadratic Voting',
    description: 'Deploy Avalanche Warp Messaging (AWM) and Teleporter contract relays between Avalanche C-Chain and dedicated Monkey Governance Subnet to eliminate voter gas friction.',
    fullBody: 'Establish a custom Avalanche Subnet for I-Me-Monkey DAO voting transactions while settling root consensus back to Ethereum Mainnet.',
    proposer: '0x9A48bF32D582b993214aB02773c33285918667a1',
    category: 'Cross-Chain Bridge',
    chain: 'avalanche',
    status: 'queued',
    votesFor: 2150000,
    votesAgainst: 110000,
    votesAbstain: 35000,
    quorumNeeded: 1500000,
    totalVoters: 312,
    createdAt: '2026-09-08T10:00:00Z',
    endsAt: '2026-09-14T10:00:00Z',
    executionAction: 'deployTeleporterRelay()',
    antigravityAudit: {
      score: 95,
      verdict: 'Audited & Safe',
      details: 'Avalanche Warp Messaging verification matches standard Snow consensus security guarantees.',
    },
  },
  {
    id: 40,
    title: 'MIP-40: Integration of Google Wallet API for Decentralized Membership Credentials',
    description: 'Approved protocol upgrade to generate cryptographic Google Wallet passes for all $IMM token holders, enabling NFC tap-in verification at global Web3 hacker houses and conferences.',
    fullBody: 'Enables every DAO member to link their Ethereum or Avalanche address to a Google Wallet Pass without giving up private keys or relying on centralized custodians.',
    proposer: '0x71C2a8B428e5a7bF14c67A837f4AdfFe8eD649bE',
    category: 'Google Wallet Pass',
    chain: 'cross-chain',
    status: 'passed',
    votesFor: 2980000,
    votesAgainst: 65000,
    votesAbstain: 20000,
    quorumNeeded: 1500000,
    totalVoters: 489,
    createdAt: '2026-08-28T08:00:00Z',
    endsAt: '2026-09-04T08:00:00Z',
    executionAction: 'enableGoogleWalletPassMinting()',
    antigravityAudit: {
      score: 99,
      verdict: 'Audited & Verified',
      details: 'Google Wallet generic objects do not store seed phrases or private keys. Verified read-only verifiable credential architecture.',
    },
  },
  {
    id: 39,
    title: 'MIP-39: Cross-Chain Liquidity Provisioning: Uniswap v3 (ETH) & TraderJoe (AVAX)',
    description: 'Allocated 150 ETH and 12,000 AVAX paired with protocol-owned $IMM to establish concentrated liquidity pools on Ethereum Mainnet and Avalanche C-Chain.',
    fullBody: 'Deepens liquidity across both primary networks to support institutional treasury swaps and reduced slippage for decentralized governance participants.',
    proposer: '0x33B9174A53eE5998188151241a77eA642B591288',
    category: 'Treasury & Liquidity',
    chain: 'cross-chain',
    status: 'executed',
    votesFor: 2450000,
    votesAgainst: 180000,
    votesAbstain: 40000,
    quorumNeeded: 1500000,
    totalVoters: 374,
    createdAt: '2026-08-15T12:00:00Z',
    endsAt: '2026-08-22T12:00:00Z',
    executionAction: 'provisionCrossChainPools()',
    antigravityAudit: {
      score: 92,
      verdict: 'Executed Safely',
      details: 'Timelock successfully executed transaction on both chains.',
    },
  },
];

export const DEFAULT_STARTUP_APP: GoogleForStartupsGrantApp = {
  startupName: 'I-Me-Monkey DAO',
  githubRepo: 'https://github.com/I-Me-Monkey-DAO/DAO',
  programTier: 'Google for Startups Cloud Program — Web3 & AI Track',
  fundingRequested: '$200,000 USD (Credits)',
  focusArea: 'Cross-Chain Autonomous DAO Governance on Ethereum and Avalanche with Google Wallet Tokenization',
  antigravityRole: 'Autonomous Cross-Chain Proposal Auditor, Smart Contract Guardian, and Security Oracle',
  googleWalletUtility: 'Zero-Seed-Phrase Membership Onboarding, NFC Physical Proof-of-Humanity, and Real-Time Tokenized Voting Power Pass',
  status: 'ready_for_submission',
  applicationText: '',
  cloudCreditBreakdown: [
    {
      service: 'Vertex AI & Gemini Models',
      description: 'Hosting Google Antigravity agent instances, fine-tuning proposal risk models, and processing governance transcripts',
      amountUsd: 65000,
      percent: 32.5,
    },
    {
      service: 'Google Kubernetes Engine (GKE)',
      description: 'Dedicated Ethereum archive RPC nodes, Avalanche validator/relayer nodes, and cross-chain message indexers',
      amountUsd: 60000,
      percent: 30.0,
    },
    {
      service: 'BigQuery Web3 Public Datasets',
      description: 'Petabyte-scale on-chain analysis across Ethereum and Avalanche blocks, wallet behavior clustering, and sybil prevention',
      amountUsd: 30000,
      percent: 15.0,
    },
    {
      service: 'Cloud KMS & Security HSM',
      description: 'Hardware Security Module cryptographic signing for Google Wallet Passes and Antigravity multi-sig co-signatures',
      amountUsd: 25000,
      percent: 12.5,
    },
    {
      service: 'Cloud Run & Serverless Microservices',
      description: 'High-availability low-latency API endpoints for Google Wallet pass issuance, webhooks, and DApp state delivery',
      amountUsd: 20000,
      percent: 10.0,
    },
  ],
  isAiGenerated: false,
  ratificationProposalId: 42,
};
