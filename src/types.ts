export type BlockchainNetwork = 'ethereum' | 'avalanche';

export interface NetworkConfig {
  id: BlockchainNetwork;
  name: string;
  shortName: string;
  nativeCurrency: string;
  symbol: string;
  chainId: number;
  rpcStatus: 'operational' | 'congested' | 'degraded';
  currentBlock: number;
  avgGas: string;
  explorerName: string;
  explorerUrl: string;
  immTokenAddress: string;
  governorAddress: string;
  timelockAddress: string;
  color: string;
  badgeBg: string;
}

export type MemberTier = 
  | 'Genesis Elder Monkey' 
  | 'Gold Delegate' 
  | 'Silver Contributor' 
  | 'Bronze Hodler';

export interface WalletAccount {
  address: string;
  ensName?: string;
  tier: MemberTier;
  votingPower: number; // e.g. 125000 VP
  stakedImm: number;   // e.g. 250000 $IMM
  ethBalance: number;  // ETH balance
  avaxBalance: number; // AVAX balance
  immBalance: number;  // liquid $IMM balance
  delegatedTo?: string;
  googleWalletPassInstalled: boolean;
  avatarSeed: string;
}

export type NavTabType = 'overview' | 'proposals' | 'digital-twin' | 'wallet-pass' | 'startups' | 'staking';

export type ProposalStatus = 'active' | 'passed' | 'executed' | 'queued' | 'defeated';
export type ProposalCategory = 
  | 'Google Cloud Grant' 
  | 'Cross-Chain Bridge' 
  | 'Google Antigravity AI' 
  | 'Treasury & Liquidity' 
  | 'Protocol Upgrade' 
  | 'Google Wallet Pass'
  | 'Miyawaki Afforestation & Rehab';

export interface DAOProposal {
  id: number;
  title: string;
  description: string;
  fullBody?: string;
  proposer: string;
  category: ProposalCategory;
  chain: BlockchainNetwork | 'cross-chain';
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorumNeeded: number;
  totalVoters: number;
  createdAt: string;
  endsAt: string;
  executionAction?: string;
  antigravityAudit?: {
    score: number;
    verdict: string;
    details: string;
  };
  miyawakiData?: {
    treesPlanted: number;
    canopyHectares: number;
    densityPerSqM: number;
    targetHavenAtoll: string;
    biomassGrowthRateMultiplier: number;
    projectedCarbonOffsetTons: number;
    conservationPortalUrl: string;
  };
}

export interface MarshallIslandsHavenLocation {
  sanctuaryName: string;
  atoll: string;
  coordinates: string;
  havenZone: string;
  climateProfile: string;
  canopyShadeCoverage: number; // e.g. 92%
}

export interface CinematicUsdScene {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  timeOfDay: string;
  lightingSetup: string;
  usdScenePath: string;
  cameraFocalLength: string;
  weather: string;
  primaryAction: string;
  moodColor: string;
  usdaCode: string;
  highResImageUrl?: string;
  windPhysics?: {
    windSpeedKmH: number; // e.g. 18
    windDirectionDeg: number; // e.g. 75
    gustiness: number; // 0-1
    floralTypes: string[];
    treeSpecies: string[];
  };
  cameraAngles: Array<{ id: string; label: string; fov: number }>;
}

export interface TailLanguagePattern {
  id: string;
  postureName: string;
  semanticMeaning: string;
  communicativeDirection: 'Affiliative & Friendly' | 'Dominance & Confidence' | 'Submission & Appeasement' | 'Alarm & Threat Alert' | 'Locomotor Balance';
  socialContext: string;
  publishedLiterature: {
    citation: string;
    keyFinding: string;
  };
  angleDegrees: number;
  curvature: number; // -1 to 1 (negative = down/clamped, positive = arched over back)
  twitchFrequencyHz: number;
  rigidity: 'Relaxed' | 'Tense' | 'Stiff' | 'Prehensile Wrapped';
}

export interface BodyLanguageGesture {
  id: string;
  gestureName: string;
  facialAndPosturalAction: string;
  communicativeDirection: string;
  socialFunction: string;
  publishedLiterature: {
    citation: string;
    context: string;
  };
  youtubeReference: {
    title: string;
    channelOrSource: string;
    searchQuery: string;
  };
}

export interface PrimateVocalization {
  id: string;
  callName: string;
  callType: 'Contact' | 'Alarm' | 'Agonistic' | 'Affiliative' | 'Food Discovery' | 'Dispute Resolution';
  acousticProfile: string;
  frequencyRangeHz: [number, number];
  fundamentalFrequencyHz: number;
  harmonicFormants: number[];
  durationMs: number;
  semanticDirection: string;
  publishedLiterature: {
    citation: string;
    acousticAnalysis: string;
  };
  youtubeReference: {
    title: string;
    videoQuery: string;
    channelOrSource: string;
  };
}

export interface PrimateEthologyProfile {
  speciesName: string;
  scientificName: string;
  naturalTroopStructure: string;
  tailLanguageRepertoire: TailLanguagePattern[];
  bodyLanguageRepertoire: BodyLanguageGesture[];
  vocalizationRepertoire: PrimateVocalization[];
  languageCommunicationDirection: {
    overview: string;
    multiModalRules: string[];
    caretakerGuidance: string;
  };
}

export interface LumeriaOsUsdAnimation {
  usdFormat: 'USD' | 'USDA' | 'USDZ';
  usdScenePath: string;
  fps: number;
  totalFrames: number;
  simulationStage: string;
  biometrics: {
    heartRateBpm?: number;
    stressIndex: number; // 0-100, drops as rehab advances
    canopyElevationMeters: number;
    activityState: 'Climbing' | 'Foraging' | 'Social Grooming' | 'Resting in Canopy' | 'Arboreal Play';
    dietaryIntakeKcal: number;
  };
  usdMeshNodes: string[];
  animationType: 'usd_spatial_mesh' | 'lumeria_kinematic_usd';
  usdStageAscii?: string;
}

export interface MonkeyDigitalTwin {
  id: string;
  name: string;
  species: string;
  bio: string;
  bioDescriptionUsd?: string; // Production-grade Pixar Universal Scene Description Bio Schema
  imageUrl: string;
  age: number | string;
  gender: 'Female' | 'Male' | 'Juvenile';
  rescueOrigin: string; // e.g. "Former biomedical research lab cage #B-402", "Illegal exotic pet trade confiscation"
  captivityDuration: string; // e.g. "6 years in solitary steel enclosure"
  rehabHavenLocation: MarshallIslandsHavenLocation;
  lumeriaOsAnimation: LumeriaOsUsdAnimation;
  miyawakiParcelId: string;
  healthStatus: 'Fully Rehabilitated' | 'Active Rehabilitation' | 'Sanctuary Acclimatization' | 'Elder Care';
  onChainHash: string; // e.g. 0x8f4b...
  matrixConservationUrl: string; // https://conservationonthematrix.weebly.com
  lumeriaOsTelemetrySync: boolean;
  joinedHavenDate: string;
  googleWalletTwinBadge: boolean;
  favoriteForage: string;
  socialTroopName: string;
  ethologyProfile?: PrimateEthologyProfile;
}

export interface GoogleWalletPassObject {
  id: string;
  classId: string;
  cardTitle: string;
  subheader: string;
  header: string;
  tier: MemberTier;
  votingPower: string;
  immStaked: string;
  primaryChain: string;
  secondaryChain: string;
  memberAddress: string;
  memberName: string;
  barcodeValue: string;
  hexBackgroundColor: string;
  jwtUrl?: string;
  saveUrl: string;
  isSavedLocally: boolean;
  issuedAt: string;
}

export interface TreasuryAsset {
  symbol: string;
  name: string;
  chain: BlockchainNetwork;
  amount: number;
  usdValue: number;
  priceUsd: number;
  allocationPercent: number;
  change24h: number;
}

export interface GoogleForStartupsGrantApp {
  startupName: string;
  githubRepo: string;
  programTier: string;
  fundingRequested: string;
  focusArea: string;
  antigravityRole: string;
  googleWalletUtility: string;
  status: 'draft' | 'ai_generated' | 'dao_ratified' | 'ready_for_submission';
  applicationText: string;
  cloudCreditBreakdown: {
    service: string;
    description: string;
    amountUsd: number;
    percent: number;
  }[];
  isAiGenerated: boolean;
  ratificationProposalId?: number;
}
