import React, { useState } from 'react';
import { 
  BlockchainNetwork, 
  WalletAccount, 
  DAOProposal, 
  TreasuryAsset, 
  GoogleForStartupsGrantApp,
  NavTabType 
} from './types';
import { 
  NETWORKS, 
  INITIAL_ACCOUNTS, 
  INITIAL_TREASURY, 
  INITIAL_PROPOSALS, 
  DEFAULT_STARTUP_APP 
} from './data/daoData';

import { Navbar } from './components/Navbar';
import { NetworkBanner } from './components/NetworkBanner';
import { TreasuryOverview } from './components/TreasuryOverview';
import { GoogleWalletSection } from './components/GoogleWalletSection';
import { GoogleForStartupsSection } from './components/GoogleForStartupsSection';
import { GovernanceSection } from './components/GovernanceSection';
import { StakingBridgeSection } from './components/StakingBridgeSection';
import { DigitalTwinSection } from './components/DigitalTwinSection';
import { SemioticsLexicon } from './components/SemioticsLexicon';
import { WalletModal } from './components/WalletModal';
import { CheckCircle2, Info } from 'lucide-react';

export default function App() {
  const [currentNetwork, setCurrentNetwork] = useState<BlockchainNetwork>('ethereum');
  const [accounts, setAccounts] = useState<WalletAccount[]>(INITIAL_ACCOUNTS);
  const [activeAccount, setActiveAccount] = useState<WalletAccount>(INITIAL_ACCOUNTS[0]);
  const [treasury] = useState<TreasuryAsset[]>(INITIAL_TREASURY);
  const [proposals, setProposals] = useState<DAOProposal[]>(INITIAL_PROPOSALS);
  const [startupApp, setStartupApp] = useState<GoogleForStartupsGrantApp>(DEFAULT_STARTUP_APP);

  const [activeTab, setActiveTab] = useState<NavTabType>('overview');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSelectNetwork = (net: BlockchainNetwork) => {
    setCurrentNetwork(net);
    showToast(`Switched active RPC network to ${NETWORKS[net].name}`);
  };

  const handleUpdateAccount = (updated: Partial<WalletAccount>) => {
    const newAcc = { ...activeAccount, ...updated };
    setActiveAccount(newAcc);
    setAccounts((prev) => prev.map((a) => (a.address === activeAccount.address ? newAcc : a)));
    showToast('Account balances and voting power updated.');
  };

  const handleCastVote = (proposalId: number, support: 'for' | 'against' | 'abstain') => {
    const vp = activeAccount.votingPower;
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        return {
          ...p,
          votesFor: support === 'for' ? p.votesFor + vp : p.votesFor,
          votesAgainst: support === 'against' ? p.votesAgainst + vp : p.votesAgainst,
          votesAbstain: support === 'abstain' ? p.votesAbstain + vp : p.votesAbstain,
          totalVoters: p.totalVoters + 1,
        };
      })
    );
    showToast(`Cast ${vp.toLocaleString()} VP ${support.toUpperCase()} on Proposal MIP-${proposalId}!`);
  };

  const handleCreateProposal = (newP: Omit<DAOProposal, 'id' | 'votesFor' | 'votesAgainst' | 'votesAbstain' | 'totalVoters' | 'createdAt' | 'endsAt'>) => {
    const nextId = Math.max(...proposals.map((p) => p.id)) + 1;
    const fullProposal: DAOProposal = {
      ...newP,
      id: nextId,
      votesFor: activeAccount.votingPower,
      votesAgainst: 0,
      votesAbstain: 0,
      totalVoters: 1,
      createdAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setProposals([fullProposal, ...proposals]);
    showToast(`MIP-${nextId} created successfully with your initial vote!`);
    setActiveTab('proposals');
  };

  const handleRatifyStartupInDAO = (appText: string) => {
    setStartupApp((prev) => ({ ...prev, status: 'dao_ratified' }));
    showToast('Google for Startups Application linked to MIP-42 for DAO Ratification!');
    setActiveTab('proposals');
  };

  const handleFaucet = (type: 'imm' | 'eth' | 'avax') => {
    if (type === 'imm') {
      handleUpdateAccount({ immBalance: activeAccount.immBalance + 10000 });
      showToast('Dispensed 10,000 test $IMM tokens!');
    } else if (type === 'eth') {
      handleUpdateAccount({ ethBalance: Number((activeAccount.ethBalance + 1.0).toFixed(2)) });
      showToast('Dispensed 1.0 test ETH!');
    } else {
      handleUpdateAccount({ avaxBalance: Number((activeAccount.avaxBalance + 25.0).toFixed(2)) });
      showToast('Dispensed 25 test AVAX!');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentNetwork={currentNetwork}
        networks={NETWORKS}
        onSelectNetwork={handleSelectNetwork}
        activeAccount={activeAccount}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Live Network & RPC Telemetry Banner */}
      <NetworkBanner
        currentNetwork={currentNetwork}
        networks={NETWORKS}
      />

      {/* Main Application Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <TreasuryOverview
            treasury={treasury}
            onNavigateToWalletPass={() => setActiveTab('wallet-pass')}
            onNavigateToStartups={() => setActiveTab('startups')}
            onNavigateToGovernance={() => setActiveTab('proposals')}
            onNavigateToDigitalTwin={() => setActiveTab('digital-twin')}
            currentNetwork={currentNetwork}
          />
        )}

        {activeTab === 'proposals' && (
          <GovernanceSection
            proposals={proposals}
            onCastVote={handleCastVote}
            onCreateProposal={handleCreateProposal}
            activeAccount={activeAccount}
            currentNetwork={currentNetwork}
            onNavigateToDigitalTwin={() => setActiveTab('digital-twin')}
          />
        )}

        {activeTab === 'digital-twin' && (
          <DigitalTwinSection
            activeAccount={activeAccount}
            currentNetwork={currentNetwork}
            onNavigateToGovernance={() => setActiveTab('proposals')}
            onNavigateToWalletPass={() => setActiveTab('wallet-pass')}
            onNavigateToSemiotics={() => setActiveTab('semiotics')}
          />
        )}

        {activeTab === 'semiotics' && (
          <SemioticsLexicon
            onNavigateToStage={() => setActiveTab('digital-twin')}
          />
        )}

        {activeTab === 'wallet-pass' && (
          <GoogleWalletSection
            activeAccount={activeAccount}
            currentNetwork={currentNetwork}
          />
        )}

        {activeTab === 'startups' && (
          <GoogleForStartupsSection
            initialApp={startupApp}
            onRatifyInDAO={handleRatifyStartupInDAO}
            activeProposals={proposals}
          />
        )}

        {activeTab === 'staking' && (
          <StakingBridgeSection
            activeAccount={activeAccount}
            currentNetwork={currentNetwork}
            onUpdateAccount={handleUpdateAccount}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center flex-wrap gap-2">
            <span>🐵 I-Me-Monkey DAO</span>
            <span>•</span>
            <span>Ethereum Mainnet & Avalanche C-Chain</span>
            <span>•</span>
            <span className="text-emerald-400">LumeriaOS USD & Miyawaki Haven</span>
          </div>

          <div className="flex items-center flex-wrap gap-4">
            <a
              href="https://conservationonthematrix.weebly.com"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
            >
              conservationonthematrix.weebly.com
            </a>
            <span>•</span>
            <button
              onClick={() => setActiveTab('digital-twin')}
              className="hover:text-slate-300 transition-colors"
            >
              Digital Twin USD
            </button>
            <span>•</span>
            <a
              href="https://github.com/stpaul2coderdojo/I-Me-Monkey-on-LumeriaOS"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              GitHub Repository
            </a>
            <span>•</span>
            <button
              onClick={() => setActiveTab('wallet-pass')}
              className="hover:text-slate-300 transition-colors"
            >
              Google Wallet API Docs
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('startups')}
              className="hover:text-slate-300 transition-colors"
            >
              Google for Startups Cloud
            </button>
          </div>
        </div>
      </footer>

      {/* Account Switcher & Faucet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        accounts={accounts}
        activeAccount={activeAccount}
        onSelectAccount={(acc) => {
          setActiveAccount(acc);
          setIsWalletModalOpen(false);
          showToast(`Switched account to ${acc.ensName || acc.tier}`);
        }}
        currentNetwork={currentNetwork}
        networks={NETWORKS}
        onFaucet={handleFaucet}
      />
    </div>
  );
}
