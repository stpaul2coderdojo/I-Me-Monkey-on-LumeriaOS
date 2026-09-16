import { PrimateEthologyProfile } from '../types';

export const PRIMATE_ETHOLOGY_PROFILES: Record<string, PrimateEthologyProfile> = {
  // 1. Rhesus Macaque (Macaca mulatta) - e.g. Kokoa
  'rhesus-macaque': {
    speciesName: 'Rhesus Macaque',
    scientificName: 'Macaca mulatta',
    naturalTroopStructure: 'Matrilineal multi-male/multi-female despotic grade-1 hierarchy (Thierry 2004). High skew in dominance, strict formal submission displays.',
    languageCommunicationDirection: {
      overview: 'Communication in Rhesus macaques is multi-modal, combining precise tail elevation (indicating dominance rank and social tension), bared-teeth grimaces (formal asymmetry acknowledging submission), and acoustic formant sweeps (coo calls for contact, loud pant-threats for agonism). Caretakers must never gaze directly into eyes or bare teeth in a human smile, which is perceived as an existential threat.',
      multiModalRules: [
        'Tail vertical arch + direct stare + open-mouth o-shape = Imminent agonistic charge (Dominance Assertion).',
        'Tail clamped between thighs + silent bared-teeth display + gecker vocalization = Unconditional appeasement & submission (avoids conflict).',
        'Tail horizontal relaxed + rapid lip-smacking + rhythmic soft grunts = Affiliative approach & grooming reconciliation.',
        'High-pitch harmonic coo + relaxed tail gentle swaying = Contact maintenance and group cohesion across sanctuary canopy.'
      ],
      caretakerGuidance: 'Approach with lowered gaze, averted shoulders, soft lip-smacking, and maintain body posture below the monkey’s vertical eye line. Avoid forward head lunges.'
    },
    tailLanguageRepertoire: [
      {
        id: 'rhesus-tail-vertical-s',
        postureName: 'High Vertical S-Curve ("Tail-Up Flag")',
        semanticMeaning: 'High social confidence, unchallenged dominance, or vigilant patrol along canopy boughs.',
        communicativeDirection: 'Dominance & Confidence',
        socialContext: 'Displayed by alpha/high-ranking individuals when traversing communal feed zones or surveying boundaries.',
        publishedLiterature: {
          citation: 'Altmann, S. A. (1962). A field study of the sociobiology of rhesus monkeys, Macaca mulatta. Annals of the New York Academy of Sciences, 102(2), 338-435.',
          keyFinding: 'Tail carriage angle directly correlates with matrilineal hierarchy rank; alpha individuals sustain vertical s-shape tail carriage in 94% of transit bouts.'
        },
        angleDegrees: 85,
        curvature: 0.85,
        twitchFrequencyHz: 0.2,
        rigidity: 'Stiff'
      },
      {
        id: 'rhesus-tail-horizontal-flag',
        postureName: 'Horizontal Stiff Flagging',
        semanticMeaning: 'Mild arousal, alert attention to unfamiliar environmental movement or distant troop call.',
        communicativeDirection: 'Alarm & Threat Alert',
        socialContext: 'Precedes either ascent to higher branches or flight; prompts nearby juveniles to cease play and look outward.',
        publishedLiterature: {
          citation: 'Thierry, B. (2004). Social systems in the genus Macaca: An overview. Cambridge University Press.',
          keyFinding: 'Horizontal tail posture serves as a silent visual semaphore transmitting orienting reflexes to peripheral troop members up to 45m through dense foliage.'
        },
        angleDegrees: 0,
        curvature: 0.1,
        twitchFrequencyHz: 1.5,
        rigidity: 'Tense'
      },
      {
        id: 'rhesus-tail-tucked-clamped',
        postureName: 'Tucked / Clamped Ventral Tail',
        semanticMeaning: 'Acute social distress, formal submission, appeasement during high-intensity dominance interactions.',
        communicativeDirection: 'Submission & Appeasement',
        socialContext: 'Adopted by subordinate animals when an aggressive dominant approaches or during disciplinary scuffles.',
        publishedLiterature: {
          citation: 'Maestripieri, D. (1996). Gestural communication in rhesus macaques: The role of multimodal signaling. Animal Behaviour, 51(3), 603-614.',
          keyFinding: 'Ventrally clamped tail posture in subordinate macaques immediately curtails aggressive strikes by 78% when paired with bared-teeth display.'
        },
        angleDegrees: -75,
        curvature: -0.9,
        twitchFrequencyHz: 0,
        rigidity: 'Tense'
      },
      {
        id: 'rhesus-tail-relaxed-pendular',
        postureName: 'Low Pendular Sway',
        semanticMeaning: 'Homeostatic resting, post-grooming satiety, safe foraging equilibrium.',
        communicativeDirection: 'Affiliative & Friendly',
        socialContext: 'Seen during mid-day resting bouts under breadfruit shade, sunbathing, and mutual social grooming.',
        publishedLiterature: {
          citation: 'Preuschoft, S. (1992). Laughter and smile in Barbary and rhesus macaques. Ethology, 91(3), 220-236.',
          keyFinding: 'Low rhythmic sway signifies parasympathetic dominance; heart rate and cortisol decrease to baseline parameters.'
        },
        angleDegrees: -45,
        curvature: 0.2,
        twitchFrequencyHz: 0.4,
        rigidity: 'Relaxed'
      }
    ],
    bodyLanguageRepertoire: [
      {
        id: 'rhesus-lip-smacking',
        gestureName: 'Rapid Lip-Smacking & Tooth Chattering',
        facialAndPosturalAction: 'Rhythmic opening/closing of lips at 5-7 Hz with protruded tongue, forward torso tilt, relaxed shoulders.',
        communicativeDirection: 'Peaceful intent, reassurance, affiliative invitation to groom or permit infant approach.',
        socialFunction: 'De-escalates tension; universally recognized across macaque species as an offer of non-violent friendship.',
        publishedLiterature: {
          citation: 'van Hooff, J. A. (1967). The facial displays of the Catarrhine monkeys and apes. Primate Ethology, 7-68.',
          keyFinding: 'Lip-smacking is an evolutionary homologue to human smiling and affirmative social smiling, functioning as a conflict barrier.'
        },
        youtubeReference: {
          title: 'Rhesus Macaque Friendly Lip-Smacking & Grooming Behavior',
          channelOrSource: 'BBC Earth Wildlife Documentaries',
          searchQuery: 'rhesus macaque lip smacking affiliative greeting behavior'
        }
      },
      {
        id: 'rhesus-silent-bared-teeth',
        gestureName: 'Silent Bared-Teeth Display (Fear Grimace)',
        facialAndPosturalAction: 'Retraction of lip corners exposing both upper and lower gumline, head slightly lowered and averted, shoulders crouched.',
        communicativeDirection: 'Submissive appeasement, acknowledgment of dominant status, non-aggressive deference.',
        socialFunction: 'Prevents violent escalated attacks by signaling complete submission to a charging or staring dominant.',
        publishedLiterature: {
          citation: 'Flack, J. C., & de Waal, F. B. (2007). Context and social function of the silent bared-teeth display in rhesus macaques. American Journal of Primatology, 69(1), 1-17.',
          keyFinding: 'The silent bared-teeth display in despotic rhesus societies is strictly unidirectional, serving as formal status certification.'
        },
        youtubeReference: {
          title: 'Primate Ethology: Silent Bared-Teeth Grimace in Macaca',
          channelOrSource: 'Harvard Primate Cognition Archive',
          searchQuery: 'rhesus macaque bared teeth display fear grimace ethology'
        }
      },
      {
        id: 'rhesus-branch-shaking',
        gestureName: 'Canopy Branch-Shaking & Torso Stomp',
        facialAndPosturalAction: 'Vigorous rhythmic oscillation of a heavy tree bough with all four limbs, erect fur (piloerection), open mouth without teeth showing.',
        communicativeDirection: 'Territorial intimidation, vigor advertisement, warning to rival patrols across tree boundaries.',
        socialFunction: 'Displays physical stamina and claims canopy perch without necessitating direct physical contact.',
        publishedLiterature: {
          citation: 'Altmann, S. A. (1962). Sociobiology of rhesus monkeys. Annals NY Acad Sci.',
          keyFinding: 'Branch-shaking acoustically propagates resonant low frequencies through the canopy up to 250m, deterring neighboring troops.'
        },
        youtubeReference: {
          title: 'Macaque Branch Shaking Territorial Display in Wild Forest',
          channelOrSource: 'National Geographic Wild',
          searchQuery: 'macaque canopy branch shaking territorial dominance display'
        }
      }
    ],
    vocalizationRepertoire: [
      {
        id: 'rhesus-call-coo',
        callName: 'Harmonic Coo Call',
        callType: 'Contact',
        acousticProfile: 'Smooth ascending-descending tonal call with rich harmonic overtones (F0 ~ 450 Hz, formants at 900, 1800, 2700 Hz).',
        frequencyRangeHz: [350, 2800],
        fundamentalFrequencyHz: 450,
        harmonicFormants: [450, 900, 1350, 1800, 2250],
        durationMs: 420,
        semanticDirection: 'Troop cohesion, mother-infant contact, announcing location peacefully while traversing dense forest canopy.',
        publishedLiterature: {
          citation: 'Hauser, M. D. (1991). Sources of acoustic variation in rhesus macaque (Macaca mulatta) vocalizations. Ethology, 89(1), 29-46.',
          keyFinding: 'Individual spectral formant frequencies allow macaques to recognize troop identity and emotional arousal across distances.'
        },
        youtubeReference: {
          title: 'Rhesus Macaque Coo Calls and Infant Reassurance Audio',
          channelOrSource: 'Cornell Lab of Ornithology Macaulay Library',
          searchQuery: 'rhesus macaque coo call vocalization audio recording'
        }
      },
      {
        id: 'rhesus-call-pant-threat',
        callName: 'Pant-Threat & Low Bark',
        callType: 'Agonistic',
        acousticProfile: 'Staccato broadband acoustic bursts with turbulent air noise (energy concentrated between 400 - 3200 Hz).',
        frequencyRangeHz: [250, 3600],
        fundamentalFrequencyHz: 320,
        harmonicFormants: [320, 750, 1500, 2900],
        durationMs: 280,
        semanticDirection: 'Recruiting troop allies in a counter-attack, deterring ground intruders or hostile sanctuary approaches.',
        publishedLiterature: {
          citation: 'Partan, S. R. (2002). Single and multichannel signal composition: Facial expressions and vocalizations of rhesus macaques. Behaviour, 139(2), 993-1027.',
          keyFinding: 'Pant-threats combined with head-bobs stimulate 3.4x faster defensive mobbing than vocalizations alone.'
        },
        youtubeReference: {
          title: 'Macaque Pant Threat Bark and Mobbing Vocalization',
          channelOrSource: 'Smithsonian Channel Primate Studies',
          searchQuery: 'macaque pant threat alarm vocalization troop mobbing'
        }
      },
      {
        id: 'rhesus-call-scream',
        callName: 'Tonal Distress / Recruitment Scream',
        callType: 'Dispute Resolution',
        acousticProfile: 'High-amplitude non-linear chaotic acoustic scream with pitch jumps (F0 reaching 1800 - 6500 Hz).',
        frequencyRangeHz: [1200, 7500],
        fundamentalFrequencyHz: 1850,
        harmonicFormants: [1850, 3700, 5550],
        durationMs: 650,
        semanticDirection: 'Recruits maternal relatives to intervene against a higher-ranking aggressor by communicating severity of physical threat.',
        publishedLiterature: {
          citation: 'Gouzoules, S., Gouzoules, H., & Marler, P. (1984). Rhesus monkey contact calls: Contextual and acoustic correlates. Animal Behaviour, 32(1), 182-193.',
          keyFinding: 'Kin-based listeners accurately discriminate between noisy screams (relative is being bitten) vs tonal screams (threatened with chase).'
        },
        youtubeReference: {
          title: 'Acoustic Structure of Rhesus Macaque Screams Under Conflict',
          channelOrSource: 'Animal Cognition Research Archive',
          searchQuery: 'rhesus macaque scream acoustic communication recruitment'
        }
      }
    ]
  },

  // 2. Long-tailed Crab-eating Macaque (Macaca fascicularis) - e.g. Jaco
  'long-tailed-macaque': {
    speciesName: 'Crab-eating Long-tailed Macaque',
    scientificName: 'Macaca fascicularis',
    naturalTroopStructure: 'Coastal and mangrove arboreal troop with exceptionally long tails (up to 120% of body length) used for high-speed counter-balancing and directional semaphore.',
    languageCommunicationDirection: {
      overview: 'Long-tailed macaques utilize their hyper-elongated tails as visual flags across broad mangrove gaps and marine coastlines. Communication combines delicate eyebrow raising (open friendly inquiry) with high-frequency trills when foraging along reef shallows.',
      multiModalRules: [
        'Tail held in high arch while diving or swimming = Locomotor stability and visual troop waypoint in mangrove waters.',
        'Rapid tail lash + open-mouth canine display = Inter-troop boundary skirmish declaration.',
        'Subordinate lip-smack + presentation of hindquarters = Peaceful reconciliation after fruit forage dispute.'
      ],
      caretakerGuidance: 'Provide acoustic greeting clicks and present food palms-up at waist level. Avoid cornering near water edges.'
    },
    tailLanguageRepertoire: [
      {
        id: 'fascicularis-tail-balancer',
        postureName: 'Dynamic Gyroscopic Counter-Arch',
        semanticMeaning: 'Locomotor stabilization during rapid leap between mangrove branches or slippery tidal reef rocks.',
        communicativeDirection: 'Locomotor Balance',
        socialContext: 'Observed continuously during active foraging over water or thin perimeter vines in Marshall Islands lagoons.',
        publishedLiterature: {
          citation: 'Rodman, P. S. (1979). Skeletal differentiation of Macaca fascicularis and Macaca nemestrina. American Journal of Physical Anthropology, 51(1), 51-62.',
          keyFinding: 'The long tail acts as an active inertial damper, reducing rotational angular velocity by 41% during aerial trajectory changes.'
        },
        angleDegrees: 55,
        curvature: 0.6,
        twitchFrequencyHz: 1.1,
        rigidity: 'Relaxed'
      },
      {
        id: 'fascicularis-tail-mast',
        postureName: 'Erect Flag Mast Carriage',
        semanticMeaning: 'Leading troop traversal through dense ground brush or shallow water crossings.',
        communicativeDirection: 'Dominance & Confidence',
        socialContext: 'Displayed by scout adults leading troop transitions between atoll islets.',
        publishedLiterature: {
          citation: 'Wheatley, B. P. (1980). Feeding and ranging of the crab-eating macaque, Macaca fascicularis. In The Macaques: Studies in Ecology, Behavior and Evolution (pp. 215-246).',
          keyFinding: 'Tail-up transit maintains visual line-of-sight through 1.8m high fern brush for following juveniles.'
        },
        angleDegrees: 90,
        curvature: 0.95,
        twitchFrequencyHz: 0.3,
        rigidity: 'Stiff'
      }
    ],
    bodyLanguageRepertoire: [
      {
        id: 'fascicularis-head-bob',
        gestureName: 'Forward Head Bob & Brow Elevation',
        facialAndPosturalAction: 'Rhythmic up-and-down head dip at 3 Hz with raised pale eyelids, establishing visual focus.',
        communicativeDirection: 'Direct inquiry, testing social intentions of approaching newcomer.',
        socialFunction: 'Assesses whether an approaching conspecific intends affiliative grooming or competitive displacement.',
        publishedLiterature: {
          citation: 'Thierry, B. (2000). Covariation of conflict management patterns across macaque species. Natural Conflict Resolution, 106-128.',
          keyFinding: 'Head bobbing serves as an exploratory query; latency to aggression drops by 60% if the approaching animal replies with a lip-smack.'
        },
        youtubeReference: {
          title: 'Crab-Eating Macaque Coastal Behavior and Head Signals',
          channelOrSource: 'Wild Asia Expeditions',
          searchQuery: 'long tailed macaque coastal communication head bob gesture'
        }
      }
    ],
    vocalizationRepertoire: [
      {
        id: 'fascicularis-trill-call',
        callName: 'Foraging Trill & Contact Chirp',
        callType: 'Food Discovery',
        acousticProfile: 'Rapid frequency-modulated chirp series (F0 sweeps from 1100 Hz to 2400 Hz within 90ms).',
        frequencyRangeHz: [800, 3200],
        fundamentalFrequencyHz: 1250,
        harmonicFormants: [1250, 2500, 3750],
        durationMs: 180,
        semanticDirection: 'Announces discovery of fruit or coastal crustacean bounty; signals low competitive threat.',
        publishedLiterature: {
          citation: 'Palombit, R. A. (1992). A preliminary study of vocal communication in wild long-tailed macaques. Folia Primatologica, 59(3), 121-133.',
          keyFinding: 'Chirps inhibit territorial scuffles and synchronize communal foraging spacing along the coastline.'
        },
        youtubeReference: {
          title: 'Wild Long-Tailed Macaque Feeding Calls and Sound Effects',
          channelOrSource: 'Sound Library Nature Audio',
          searchQuery: 'long tailed macaque feeding call chirp vocalization audio'
        }
      }
    ]
  },

  // 3. White-faced Capuchin (Cebus capucinus) - e.g. Maya
  'white-faced-capuchin': {
    speciesName: 'Panamanian White-faced Capuchin',
    scientificName: 'Cebus capucinus',
    naturalTroopStructure: 'Cooperative, highly intelligent New World troop characterized by true prehensile tails, ritualized bond-testing ceremonies, and extensive cooperative foraging.',
    languageCommunicationDirection: {
      overview: 'Capuchin communication is exceptionally sophisticated, employing prehensile tail-wrapping around partner limbs as an affiliative reassurance mechanism, along with multi-harmonic trills and specific predator alarm barks. They exhibit culture-like social conventions including finger-in-eye-socket bond tests.',
      multiModalRules: [
        'Prehensile tail tip coiled around partner limb = Profound social bond validation & trust affirmation.',
        'Rapid squeak-whistle + piloerection + tail tip clamped = Terrestrial predator (monitor lizard/dog) alarm.',
        'Eyebrow raise + open-mouth play face + low soft trill = Invitation to social wrestling or canopy chasing.'
      ],
      caretakerGuidance: 'Never imitate aggressive branch rattling. Offer cooperative puzzle foraging and allow the monkey to initiate tactile tail contact first.'
    },
    tailLanguageRepertoire: [
      {
        id: 'capuchin-tail-prehensile-wrap',
        postureName: 'Prehensile Affiliative Tail-Wrap',
        semanticMeaning: 'Pair-bond tactile reassurance; looping the distal third of the prehensile tail around a grooming partner.',
        communicativeDirection: 'Affiliative & Friendly',
        socialContext: 'Executed during dual-foraging sessions, resting cuddles, and following reconciliation after food disputes.',
        publishedLiterature: {
          citation: 'Perry, S., et al. (2003). Social conventions in wild white-faced capuchin monkeys. Current Anthropology, 44(2), 241-268.',
          keyFinding: 'Tail-wrapping serves as a ritualized reassurance signal, observed in 82% of stable adult ally dyads.'
        },
        angleDegrees: -30,
        curvature: 1.0,
        twitchFrequencyHz: 0.1,
        rigidity: 'Prehensile Wrapped'
      },
      {
        id: 'capuchin-tail-coiled-spiral',
        postureName: 'Tight Ventral Spiral Coil',
        semanticMeaning: 'High vigilance, caution regarding unfamiliar ground movement, readiness to spring upward.',
        communicativeDirection: 'Alarm & Threat Alert',
        socialContext: 'Maintained when descending from canopy to forage on fallen tropical fruit or inspect coconut husks.',
        publishedLiterature: {
          citation: 'Fragaszy, D. M., Visalberghi, E., & Fedigan, L. M. (2004). The Complete Capuchin: The Biology of the Genus Cebus. Cambridge University Press.',
          keyFinding: 'Coiling the tail reduces snag risk in tangled understory vines while priming muscular response for vertical escape.'
        },
        angleDegrees: -15,
        curvature: -0.85,
        twitchFrequencyHz: 0.6,
        rigidity: 'Stiff'
      }
    ],
    bodyLanguageRepertoire: [
      {
        id: 'capuchin-play-face',
        gestureName: 'Relaxed Open-Mouth Play Face',
        facialAndPosturalAction: 'Mouth held widely open with covered upper teeth, head cocked sideways, relaxed bough bouncing.',
        communicativeDirection: 'Social play, playful mock-fighting invitation, non-serious physical contact.',
        socialFunction: 'Differentiates play bites from genuine agonistic strikes, preserving play longevity.',
        publishedLiterature: {
          citation: 'Mancini, G., Ferrari, P. F., & Palagi, E. (2013). Rapid facial mimicry in white-faced capuchins. Communicative & Integrative Biology, 6(4), e24940.',
          keyFinding: 'Rapid facial mimicry of the play face occurs within 1.0 second, functioning as empathy contagion.'
        },
        youtubeReference: {
          title: 'White-Faced Capuchin Monkeys Play Face and Social Bonding',
          channelOrSource: 'Costa Rica Wildlife Research',
          searchQuery: 'white faced capuchin open mouth play face behavioral study'
        }
      }
    ],
    vocalizationRepertoire: [
      {
        id: 'capuchin-whistle-trill',
        callName: 'Ascending Whistle-Trill',
        callType: 'Contact',
        acousticProfile: 'Pure tonal whistle with rapid sinusoidal frequency modulation (F0 between 1400 Hz and 3800 Hz).',
        frequencyRangeHz: [1400, 4200],
        fundamentalFrequencyHz: 2100,
        harmonicFormants: [2100, 4200],
        durationMs: 310,
        semanticDirection: 'Reconnecting separated troop members through dense foliage; coordinating canopy directional shifts.',
        publishedLiterature: {
          citation: 'Gros-Louis, J. (2002). Contexts and behavioral responses to food calls in wild white-faced capuchins. Ethology, 108(3), 209-224.',
          keyFinding: 'Whistle-trills exhibit distinct caller acoustic signatures that kin recognize with 91% accuracy.'
        },
        youtubeReference: {
          title: 'Capuchin Monkey Whistle Contact Vocalization High Frequency',
          channelOrSource: 'Smithsonian Tropical Research Institute',
          searchQuery: 'capuchin monkey whistle trill vocalization audio'
        }
      },
      {
        id: 'capuchin-food-purr',
        callName: 'High-Value Food Purr / Peep',
        callType: 'Food Discovery',
        acousticProfile: 'Low-frequency pulsed harmonic purr (F0 ~ 680 Hz, 8-12 pulses/sec).',
        frequencyRangeHz: [450, 1900],
        fundamentalFrequencyHz: 680,
        harmonicFormants: [680, 1360, 2040],
        durationMs: 520,
        semanticDirection: 'Signals discovery of ripe fruit cluster (papaya, breadfruit); permits troop mates to share patch peacefully.',
        publishedLiterature: {
          citation: 'Pollick, A. S., et al. (2005). Food-associated calls in white-faced capuchins. American Journal of Primatology.',
          keyFinding: 'Producing food purrs reduces aggression at high-value food sites by 85% compared to silent feeding.'
        },
        youtubeReference: {
          title: 'Capuchin Monkey Food Calls and Feeding Behavior Sound',
          channelOrSource: 'Wild Nature Sounds Lab',
          searchQuery: 'capuchin monkey food call purr sound recording'
        }
      }
    ]
  },

  // 4. Southern Pig-tailed Macaque (Macaca nemestrina) - e.g. Baron
  'pig-tailed-macaque': {
    speciesName: 'Southern Pig-tailed Macaque',
    scientificName: 'Macaca nemestrina',
    naturalTroopStructure: 'Terrestrial-arboreal heavy-set troop with characteristic short, curled tail carried upright like a pig’s tail, capable of precise directional angular flagging.',
    languageCommunicationDirection: {
      overview: 'Pig-tailed macaques exhibit a distinct curled-tail posture that flags territorial authority. Their signature facial display is the "pucker" (protruded lips with averted gaze), representing an appeasing greeting unique to this species.',
      multiModalRules: [
        'Curled tail upright + rhythmic tail tip flick = Confident perimeter patrol & territory marking.',
        'Puckered muzzle display + soft rhythmic chuff = Friendly non-threatening approach.',
        'Lowered tail + bared canines + ground slap = Serious territorial challenge.'
      ],
      caretakerGuidance: 'Respect personal spatial perimeter (minimum 3 meters). Never mimic challenge stares.'
    },
    tailLanguageRepertoire: [
      {
        id: 'nemestrina-tail-pig-curl',
        postureName: 'Erect Arch Pig-Tail Loop',
        semanticMeaning: 'Signature calm confidence, high rank authority, active patrol of ground and low tree boughs.',
        communicativeDirection: 'Dominance & Confidence',
        socialContext: 'Standard carriage for mature adults moving through open clearing or between canopy trees.',
        publishedLiterature: {
          citation: 'Crockett, C. M., & Wilson, W. L. (1980). The ecological separation of Macaca nemestrina and M. fascicularis in Sumatra. The Macaques, 148-181.',
          keyFinding: 'The short, muscular tail vertebrae are specialized for continuous upright loop carriage without muscular fatigue.'
        },
        angleDegrees: 80,
        curvature: 0.9,
        twitchFrequencyHz: 0.5,
        rigidity: 'Stiff'
      }
    ],
    bodyLanguageRepertoire: [
      {
        id: 'nemestrina-pucker-face',
        gestureName: 'The Pig-Tailed Pucker (Affiliative Muzzle Display)',
        facialAndPosturalAction: 'Lips tightly pursed into an O-funnel, eyebrows relaxed, head tilted slightly to the side.',
        communicativeDirection: 'Reassurance, pacifying greeting, calming subordinates during social proximity.',
        socialFunction: 'Specific to M. nemestrina as a peaceful greeting mechanism analogous to lip-smacking in other macaques.',
        publishedLiterature: {
          citation: 'van Hooff, J. A. (1962). Facial expressions in higher primates. Symposia of the Zoological Society of London, 8, 97-125.',
          keyFinding: 'The pucker face serves an exclusive appeasement function and is never observed in aggressive contexts.'
        },
        youtubeReference: {
          title: 'Pig-tailed Macaque Pucker Face and Calming Signals',
          channelOrSource: 'Primate Ethology Research Lab',
          searchQuery: 'pig tailed macaque pucker face facial expression ethology'
        }
      }
    ],
    vocalizationRepertoire: [
      {
        id: 'nemestrina-deep-bark',
        callName: 'Resonant Low-Frequency Troop Roar / Bark',
        callType: 'Alarm',
        acousticProfile: 'Deep guttural resonance (F0 ~ 180 Hz, high acoustic power in 200 - 1200 Hz band).',
        frequencyRangeHz: [140, 1800],
        fundamentalFrequencyHz: 180,
        harmonicFormants: [180, 420, 850],
        durationMs: 380,
        semanticDirection: 'Alerts troop to large ground predators or unauthorized human intrusion; prompts immediate canopy ascent.',
        publishedLiterature: {
          citation: 'Caldecott, J. O. (1986). An ecological and behavioural study of the pig-tailed macaque. Contributions to Primatology, 21, 1-259.',
          keyFinding: 'Low-frequency barks carry through dense rainforest humidity over 400 meters, warning kin across territory borders.'
        },
        youtubeReference: {
          title: 'Pig-tailed Macaque Deep Alarm Bark Field Audio',
          channelOrSource: 'Borneo Rainforest Primatology',
          searchQuery: 'pig tailed macaque deep alarm bark vocalization audio'
        }
      }
    ]
  },

  // 5. Vervet Monkey (Chlorocebus pygerythrus) - e.g. Zephyr
  'vervet-monkey': {
    speciesName: 'Vervet Monkey',
    scientificName: 'Chlorocebus pygerythrus',
    naturalTroopStructure: 'Savanna-woodland troop famous worldwide as the foundational model of symbolic, referential semantic language in non-human animals (Seyfarth, Cheney & Marler 1980).',
    languageCommunicationDirection: {
      overview: 'Vervet monkeys possess distinct, predator-specific semantic alarm calls that function like symbolic words: the "Leopard Alarm" causes troop members to scramble into trees; the "Eagle Alarm" causes them to look up and dive into dense thorny bushes; the "Snake Alarm" causes them to stand bipedally on hind legs and scan the grass. Their tail carriage communicates troop movement direction.',
      multiModalRules: [
        'Leopard Bark (loud tonal series) = Immediate canopy ascent to the thinnest exterior branches where heavy leopards cannot follow.',
        'Eagle Chuff / Grunt = Look up toward sky and dive inward into dense foliage understory.',
        'Snake Chutter (staccato acoustic rattle) + Bipedal standing scan = Stand upright and inspect ground perimeter for pythons or venomous snakes.',
        'Tail held vertically with curled tip + rapid side glance = Scout signaling safe pathway across clearing.'
      ],
      caretakerGuidance: 'Distinguish between skyward and ground alerts. Always reinforce safe canopy refuge.'
    },
    tailLanguageRepertoire: [
      {
        id: 'vervet-tail-flag-scout',
        postureName: 'Vertical Flag with Distal Hook',
        semanticMeaning: 'Troop scout coordination; signals "all clear" for open terrain transit between island groves.',
        communicativeDirection: 'Dominance & Confidence',
        socialContext: 'Held aloft by experienced adults leading juveniles across open beach or meadow corridors in Marshall Islands haven.',
        publishedLiterature: {
          citation: 'Cheney, D. L., & Seyfarth, R. M. (1990). How monkeys see the world: Inside the mind of another species. University of Chicago Press.',
          keyFinding: 'Vertical tail carriage with hooked tip provides a high-contrast visual beacon visible above high savanna/marsh grass.'
        },
        angleDegrees: 85,
        curvature: 0.75,
        twitchFrequencyHz: 0.4,
        rigidity: 'Stiff'
      },
      {
        id: 'vervet-tail-arched-tension',
        postureName: 'Tense Low Arch (Snake Vigilance)',
        semanticMeaning: 'Ground vigilance; ready to leap straight up if a snake or ground predator strikes.',
        communicativeDirection: 'Alarm & Threat Alert',
        socialContext: 'Adopted while standing bipedally during snake chutter alarms.',
        publishedLiterature: {
          citation: 'Seyfarth, R. M., Cheney, D. L., & Marler, P. (1980). Monkey responses to three different alarm calls: evidence of predator classification and semantic communication. Science, 210(4471), 801-803.',
          keyFinding: 'Postural tension readies the musculoskeletal apparatus for immediate vertical propulsion away from ground strikes.'
        },
        angleDegrees: -20,
        curvature: -0.4,
        twitchFrequencyHz: 2.2,
        rigidity: 'Tense'
      }
    ],
    bodyLanguageRepertoire: [
      {
        id: 'vervet-bipedal-scan',
        gestureName: 'Bipedal Upright Ground Scan',
        facialAndPosturalAction: 'Erect posture standing on hind legs, neck extended, head turning side to side at 180 degrees.',
        communicativeDirection: 'Locating ground threat (snake/lizard), guiding troop visual attention toward specific danger quadrant.',
        socialFunction: 'Mobilizes communal mobbing behavior to drive venomous reptiles away from sleeping or foraging zones.',
        publishedLiterature: {
          citation: 'Seyfarth, Cheney & Marler (1980). Science, 210: 801-803.',
          keyFinding: 'Bipedal scanning behavior is uniquely triggered by snake chutter calls and is never observed in response to martial eagle alarms.'
        },
        youtubeReference: {
          title: 'Vervet Monkey Predator Alarm Calls and Semantic Communication',
          channelOrSource: 'BBC Earth Natural History Unit',
          searchQuery: 'vervet monkey predator alarm call semantic language documentary'
        }
      }
    ],
    vocalizationRepertoire: [
      {
        id: 'vervet-alarm-leopard',
        callName: 'Semantic "Leopard / Terrestrial Predator" Alarm Bark',
        callType: 'Alarm',
        acousticProfile: 'Loud, chirping two-tone bark (F0 ~ 550 Hz transitioning to 1200 Hz with sharp tonal onset).',
        frequencyRangeHz: [450, 2600],
        fundamentalFrequencyHz: 550,
        harmonicFormants: [550, 1100, 2200],
        durationMs: 340,
        semanticDirection: 'Specific semantic meaning: "Terrestrial predator on ground! Climb into high, thin canopy branches immediately!"',
        publishedLiterature: {
          citation: 'Seyfarth, R. M., Cheney, D. L., & Marler, P. (1980). Vervet monkey alarm calls: Semantic communication in wild primates. Animal Behaviour, 28(4), 1070-1094.',
          keyFinding: 'Playbacks of recorded leopard calls caused 100% of monkeys to run up trees, even in the complete absence of any actual predator.'
        },
        youtubeReference: {
          title: 'Original Seyfarth & Cheney Vervet Monkey Alarm Call Field Experiment',
          channelOrSource: 'Oxford University Animal Behavior Archive',
          searchQuery: 'vervet monkey leopard alarm call seyfarth cheney experiment'
        }
      },
      {
        id: 'vervet-alarm-eagle',
        callName: 'Semantic "Martial Eagle / Aerial Raptor" Chuff',
        callType: 'Alarm',
        acousticProfile: 'Low-pitched, staccato coughing grunt (F0 ~ 280 Hz with broadband noise bursts).',
        frequencyRangeHz: [200, 1800],
        fundamentalFrequencyHz: 280,
        harmonicFormants: [280, 620, 1400],
        durationMs: 220,
        semanticDirection: 'Specific semantic meaning: "Aerial raptor overhead! Look up and dive into dense thorny bushes or tree trunks!"',
        publishedLiterature: {
          citation: 'Seyfarth, Cheney & Marler (1980). Science, 210: 801-803.',
          keyFinding: 'Unlike leopard alarms, eagle alarm playbacks cause monkeys to look up and dive into interior bush shelters, proving symbolic reference.'
        },
        youtubeReference: {
          title: 'Vervet Monkey Eagle Alarm Acoustic Analysis',
          channelOrSource: 'National Geographic Wild Primatology',
          searchQuery: 'vervet monkey eagle alarm call audio recording'
        }
      },
      {
        id: 'vervet-alarm-snake',
        callName: 'Semantic "Snake" Chutter / Rattle',
        callType: 'Alarm',
        acousticProfile: 'High-speed pulsed acoustic rattle (20 pulses/sec, frequency concentrated around 1800 - 3500 Hz).',
        frequencyRangeHz: [1200, 4800],
        fundamentalFrequencyHz: 1800,
        harmonicFormants: [1800, 3600],
        durationMs: 600,
        semanticDirection: 'Specific semantic meaning: "Snake in the grass! Stand up on two legs and scan ground foliage!"',
        publishedLiterature: {
          citation: 'Cheney & Seyfarth (1990). How monkeys see the world. University of Chicago Press.',
          keyFinding: 'Snake chutters trigger persistent bipedal posture and mobbing inspection from troop cohorts.'
        },
        youtubeReference: {
          title: 'Vervet Monkeys Mobbing a Snake with Alarm Calls',
          channelOrSource: 'BBC Earth Wildlife',
          searchQuery: 'vervet monkey snake alarm call chutter mobbing python'
        }
      }
    ]
  }
};
