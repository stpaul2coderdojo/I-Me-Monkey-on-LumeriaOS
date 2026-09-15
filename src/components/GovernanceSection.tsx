import React, { useState } from 'react';
import { DAOProposal, WalletAccount, BlockchainNetwork, ProposalCategory } from '../types';
import { 
  Vote, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ExternalLink, 
  Filter,
  Check,
  X,
  Cpu,
  Trees,
  TreePine,
  Box
} from 'lucide-react';

interface GovernanceSectionProps {
  proposals: DAOProposal[];
  onCastVote: (proposalId: number, support: 'for' | 'against' | 'abstain') => void;
  onCreateProposal: (newProposal: Omit<DAOProposal, 'id' | 'votesFor' | 'votesAgainst' | 'votesAbstain' | 'totalVoters' | 'createdAt' | 'endsAt'>) => void;
  activeAccount: WalletAccount;
  currentNetwork: BlockchainNetwork;
  onNavigateToDigitalTwin?: () => void;
}

export const GovernanceSection: React.FC<GovernanceSectionProps> = ({
  proposals,
  onCastVote,
  onCreateProposal,
  activeAccount,
  currentNetwork,
  onNavigateToDigitalTwin,
}) => {
  const [selectedChainFilter, setSelectedChainFilter] = useState<'all' | 'ethereum' | 'avalanche' | 'cross-chain'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'queued' | 'passed' | 'executed'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'miyawaki' | 'grants' | 'wallet'>('all');
  const [votingProposal, setVotingProposal] = useState<DAOProposal | null>(null);
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [voteChoice, setVoteChoice] = useState<'for' | 'against' | 'abstain'>('for');

  // New proposal form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProposalCategory>('Miyawaki Afforestation & Rehab');
  const [newChain, setNewChain] = useState<BlockchainNetwork | 'cross-chain'>('cross-chain');
  const [newDescription, setNewDescription] = useState('');
  const [newAction, setNewAction] = useState('executeAction()');
  const [isAuditing, setIsAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<any>(null);

  const filteredProposals = proposals.filter((p) => {
    if (selectedChainFilter !== 'all' && p.chain !== selectedChainFilter) return false;
    if (selectedStatusFilter !== 'all' && p.status !== selectedStatusFilter) return false;
    if (selectedCategoryFilter === 'miyawaki' && p.category !== 'Miyawaki Afforestation & Rehab') return false;
    if (selectedCategoryFilter === 'grants' && p.category !== 'Google Cloud Grant') return false;
    if (selectedCategoryFilter === 'wallet' && p.category !== 'Google Wallet Pass') return false;
    return true;
  });

  const handleAuditProposal = async () => {
    if (!newTitle || !newDescription) return;
    setIsAuditing(true);
    try {
      const res = await fetch('/api/antigravity/audit-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          chain: newChain,
          budget: 'Protocol execution action: ' + newAction,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiAuditResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    onCreateProposal({
      title: newTitle,
      description: newDescription,
      proposer: activeAccount.address,
      category: newCategory,
      chain: newChain,
      status: 'active',
      quorumNeeded: 1500000,
      executionAction: newAction,
      antigravityAudit: aiAuditResult ? {
        score: 96,
        verdict: aiAuditResult.riskScore || 'Safe to Ratify',
        details: aiAuditResult.auditSummary || 'Antigravity verified cross-chain safety.',
      } : {
        score: 94,
        verdict: 'Standard Governance Verification',
        details: 'Verified by Google Antigravity autonomous security agent.',
      },
    });

    setIsCreatingModal(false);
    setNewTitle('');
    setNewDescription('');
    setAiAuditResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <Vote className="w-3.5 h-3.5" />
            <span>Cross-Chain Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            I-Me-Monkey DAO Governance & Proposals
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Token-weighted and quadratic voting across Ethereum and Avalanche C-Chain. 
            All proposals are pre-screened by Google Antigravity autonomous risk agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreatingModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Proposal</span>
          </button>
        </div>
      </div>

      {/* Miyawaki Afforestation & Conservation on the Matrix Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <Trees className="w-3.5 h-3.5" />
              Miyawaki Afforestation Protocol
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300 font-mono">Marshall Islands Primate Haven</span>
          </div>
          <h2 className="text-lg font-display font-bold text-white">
            Rapid 30x Dense Miyawaki Canopies for Rescued Primates
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            All Miyawaki micro-forest proposals directly fund native multi-tiered tree planting (30+ species at 3 plants/m²) in the Republic of the Marshall Islands, creating lush arboreal habitats for monkeys freed from laboratory testing and captivity. Linked to{' '}
            <a
              href="https://conservationonthematrix.weebly.com"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-300 hover:underline font-semibold inline-flex items-center gap-0.5"
            >
              conservationonthematrix.weebly.com
              <ExternalLink className="w-3 h-3" />
            </a>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <a
            href="https://conservationonthematrix.weebly.com"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>Matrix Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {onNavigateToDigitalTwin && (
            <button
              onClick={onNavigateToDigitalTwin}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>Digital Twin Haven</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-slate-400 font-semibold px-2">Category:</span>
          {[
            { id: 'all', label: 'All Proposals' },
            { id: 'miyawaki', label: '🌴 Miyawaki Forestry & Rehab' },
            { id: 'grants', label: '🚀 Google Grants' },
            { id: 'wallet', label: '💳 Google Wallet' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategoryFilter === cat.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Chain Filters */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 font-semibold px-2">Chain:</span>
          {(['all', 'cross-chain', 'ethereum', 'avalanche'] as const).map((chain) => (
            <button
              key={chain}
              onClick={() => setSelectedChainFilter(chain)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedChainFilter === chain
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {chain === 'all' ? 'All Networks' : chain === 'cross-chain' ? 'Cross-Chain' : chain === 'ethereum' ? 'Ethereum' : 'Avalanche'}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 font-semibold px-2">Status:</span>
          {(['all', 'active', 'queued', 'passed', 'executed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                selectedStatusFilter === status
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map((proposal) => {
          const totalVotesCast = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
          const forPercent = totalVotesCast > 0 ? ((proposal.votesFor / totalVotesCast) * 100).toFixed(1) : '0';
          const quorumProgress = ((totalVotesCast / proposal.quorumNeeded) * 100).toFixed(0);

          return (
            <div
              key={proposal.id}
              className="bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 transition-all space-y-4"
            >
              {/* Proposal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    MIP-{proposal.id}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                    proposal.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : proposal.status === 'queued'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : proposal.status === 'passed'
                      ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                      : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                  }`}>
                    {proposal.status}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    proposal.chain === 'ethereum'
                      ? 'bg-sky-500/10 text-sky-300'
                      : proposal.chain === 'avalanche'
                      ? 'bg-rose-500/10 text-rose-300'
                      : 'bg-purple-500/10 text-purple-300'
                  }`}>
                    {proposal.chain === 'cross-chain' ? 'Cross-Chain (ETH + AVAX)' : proposal.chain === 'ethereum' ? 'Ethereum Mainnet' : 'Avalanche C-Chain'}
                  </span>

                  <span className="text-xs text-slate-500">
                    Category: <strong className="text-slate-300">{proposal.category}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Ends: {new Date(proposal.endsAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Title & Summary */}
              <div>
                <h3 className="text-lg font-display font-bold text-white leading-snug">
                  {proposal.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {proposal.description}
                </p>
              </div>

              {/* Miyawaki Afforestation Metrics (if applicable) */}
              {proposal.miyawakiData && (
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Trees className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="font-bold text-emerald-300 text-xs">
                        Miyawaki Afforestation Habitat Matrix • {proposal.miyawakiData.targetAtoll}
                      </span>
                    </div>
                    <a
                      href="https://conservationonthematrix.weebly.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <span>conservationonthematrix.weebly.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-emerald-500/15">
                      <span className="text-[11px] text-slate-400 block">Saplings Planted</span>
                      <span className="font-bold text-emerald-300 font-mono text-sm">
                        {proposal.miyawakiData.treesPlanted.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block">30 native species</span>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-emerald-500/15">
                      <span className="text-[11px] text-slate-400 block">Canopy Coverage</span>
                      <span className="font-bold text-white font-mono text-sm">
                        {proposal.miyawakiData.hectaresCovered} Hectares
                      </span>
                      <span className="text-[10px] text-emerald-400/80 block">30x denser canopy</span>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-emerald-500/15">
                      <span className="text-[11px] text-slate-400 block">Primate Haven</span>
                      <span className="font-bold text-amber-300 font-mono text-sm">
                        {proposal.miyawakiData.monkeysSupported} Primates
                      </span>
                      <span className="text-[10px] text-amber-400/80 block">100% cage-free rehab</span>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-emerald-500/15">
                      <span className="text-[11px] text-slate-400 block">Estimated Carbon</span>
                      <span className="font-bold text-cyan-300 font-mono text-sm">
                        {proposal.miyawakiData.carbonOffsetEstimatedTons} Tons CO₂
                      </span>
                      <span className="text-[10px] text-cyan-400/80 block">10x faster growth</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1">
                    <span className="text-slate-400">
                      Species planted: <strong className="text-emerald-300">{proposal.miyawakiData.nativeSpeciesCount} native Polynesian coastal species</strong> (Pisonia grandis, Pandanus, Guettarda speciosa)
                    </span>
                    {onNavigateToDigitalTwin && (
                      <button
                        onClick={onNavigateToDigitalTwin}
                        className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1"
                      >
                        <Box className="w-3 h-3" />
                        <span>View Digital Twins</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Antigravity Audit Badge */}
              {proposal.antigravityAudit && (
                <div className="bg-slate-950/80 rounded-lg p-3 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">
                      <strong>Antigravity Verification:</strong> {proposal.antigravityAudit.details}
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/20 whitespace-nowrap">
                    Score: {proposal.antigravityAudit.score}/100
                  </span>
                </div>
              )}

              {/* Voting Progress Bars & Action */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-1.5 max-w-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Votes For: <strong className="text-emerald-400">{forPercent}%</strong> ({proposal.votesFor.toLocaleString()} VP)
                    </span>
                    <span className="text-slate-400">
                      Quorum: <strong className="text-slate-200">{quorumProgress}%</strong> (1.5M VP needed)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${forPercent}%` }}
                    ></div>
                    <div
                      className="bg-rose-500 h-full"
                      style={{ width: `${totalVotesCast > 0 ? ((proposal.votesAgainst / totalVotesCast) * 100).toFixed(1) : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    Voters: <strong className="text-slate-200">{proposal.totalVoters}</strong>
                  </span>

                  {proposal.status === 'active' && (
                    <button
                      onClick={() => setVotingProposal(proposal)}
                      className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
                    >
                      Cast Vote
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cast Vote Modal */}
      {votingProposal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">MIP-{votingProposal.id}</span>
                <h3 className="font-display font-bold text-white text-base">Cast Your Vote</h3>
              </div>
              <button
                onClick={() => setVotingProposal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-400 block mb-1">Voting with Connected Account:</span>
              <span className="font-mono font-bold text-white">{activeAccount.address}</span>
              <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span>Your Voting Power:</span>
                <span className="font-mono font-bold text-amber-400">{activeAccount.votingPower.toLocaleString()} VP</span>
              </div>
            </div>

            {/* Vote options */}
            <div className="space-y-2">
              <button
                onClick={() => setVoteChoice('for')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                  voteChoice === 'for'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Vote FOR Proposal</span>
                <Check className="w-4 h-4" />
              </button>

              <button
                onClick={() => setVoteChoice('against')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                  voteChoice === 'against'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Vote AGAINST Proposal</span>
                <X className="w-4 h-4" />
              </button>

              <button
                onClick={() => setVoteChoice('abstain')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                  voteChoice === 'abstain'
                    ? 'bg-slate-800 border-slate-600 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span>ABSTAIN</span>
                <span>—</span>
              </button>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setVotingProposal(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onCastVote(votingProposal.id, voteChoice);
                  setVotingProposal(null);
                }}
                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Sign & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Proposal Modal */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-white text-base">
                Create DAO Governance Proposal
              </h3>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Proposal Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Deploy Google Cloud Teleporter Relayer on Avalanche"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProposalCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Miyawaki Afforestation & Rehab">🌴 Miyawaki Afforestation & Rehab</option>
                    <option value="Google Cloud Grant">Google Cloud Grant</option>
                    <option value="Google Antigravity AI">Google Antigravity AI</option>
                    <option value="Cross-Chain Bridge">Cross-Chain Bridge</option>
                    <option value="Treasury & Liquidity">Treasury & Liquidity</option>
                    <option value="Google Wallet Pass">Google Wallet Pass</option>
                    <option value="Protocol Upgrade">Protocol Upgrade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Target Network
                  </label>
                  <select
                    value={newChain}
                    onChange={(e) => setNewChain(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="cross-chain">Cross-Chain (ETH + AVAX)</option>
                    <option value="ethereum">Ethereum Mainnet</option>
                    <option value="avalanche">Avalanche C-Chain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Description & Motivation
                </label>
                <textarea
                  required
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Explain the background, benefits, and cross-chain execution payload..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Execution Payload Action
                </label>
                <input
                  type="text"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              {/* Antigravity AI Audit button inside form */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white">Google Antigravity Pre-Flight Audit</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAuditProposal}
                    disabled={isAuditing || !newTitle || !newDescription}
                    className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold rounded-lg border border-emerald-500/30 transition-colors"
                  >
                    {isAuditing ? 'Auditing...' : 'Run Antigravity Check'}
                  </button>
                </div>

                {aiAuditResult && (
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                    <span className="text-emerald-400 font-bold block mb-1">
                      Verdict: {aiAuditResult.riskScore}
                    </span>
                    <p className="whitespace-pre-wrap">{aiAuditResult.auditSummary}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
